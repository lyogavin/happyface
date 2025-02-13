'use server'
import { createClient } from '@supabase/supabase-js'
import appConfig from './app-config'
import { getUserSubscriptionStatus } from './user-utils'
import cumfaceWorkflow from '@/app/comfyui-workflows/cumface-reactor-api.json'
// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SECRET!
)

const COMFY_API_HOST = appConfig.comfyuiHost;

export async function submitHappyFaceJob(
  userId: string,
  sourceImageUrl: string | null,
  prompt?: string,
  cumStrength?: number,
  orgasmStrength?: number
): Promise<string> {
  // Check user subscription status first
  const subscription = await getUserSubscriptionStatus(userId);
  if (!subscription || subscription.credits < 1) {
    return 'Insufficient credits';
  }

  console.log('cumStrength', cumStrength, 'orgasmStrength', orgasmStrength);

  // Load the workflow (create a deep copy to avoid modifying the original)
  const workflow = JSON.parse(JSON.stringify(cumfaceWorkflow));
  
  // Set negative prompt
  workflow[7].inputs.text = "ugly, organ, dick, musk, cock";

  // Set random seed for node 73 (KSampler)
  workflow[73].inputs.seed = Math.floor(Math.random() * 1000000);

  if (sourceImageUrl) {
    // Download and upload the source image
    const sourceImage = await downloadImage(sourceImageUrl);
    const sourceName = await uploadImage(sourceImage);
    workflow[221].inputs.image = sourceName;
  } else {
    // If no source image, set weight to 0
    workflow[206].inputs.weight = 0;
  }

  // Set prompt if provided
  if (prompt) {
    let mergedPrompt = prompt;
    if (!prompt.startsWith("white cum on face")) {
      mergedPrompt = "white cum on face, " + prompt;
    }
    if (!prompt.endsWith("white cum on face")) {
      mergedPrompt = prompt + ", white cum on face";
    }
    workflow[190].inputs.text = mergedPrompt;
  } else {
    workflow[190].inputs.text = "white cum on face";
  }

  // Submit the job to ComfyUI
  const response = await fetch(`${COMFY_API_HOST}/prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: workflow,
      client_id: crypto.randomUUID(),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit ComfyUI job');
  }

  const data = await response.json();
  return data.prompt_id;
}

export async function checkHappyFaceStatus(jobId: string, userId: string, sourceImageUrl: string | null, prompt: string): Promise<ComfyUIProgress> {
  const response = await fetch(`${COMFY_API_HOST}/history/${jobId}`);
  
  if (!response.ok) {
    throw new Error('Failed to check job status');
  }

  const data = await response.json();
  
  // Check if job is completed - node 231 is now the SaveImage node
  if (Object.keys(data).length > 0 && data[jobId]?.outputs?.[231]?.images?.[0]) {
    const comfyUrl = `${COMFY_API_HOST}/view?filename=${data[jobId].outputs[231].images[0].filename}`;
    
    // Download the image from ComfyUI
    const imageData = await downloadImage(comfyUrl);
    
    // Upload to Supabase with UUID filename
    const fileName = `${crypto.randomUUID()}.${imageData.mimeType.split('/')[1]}`;
    const filePath = `public/happyface/${fileName}`;
    
    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, imageData.blob, {
        contentType: imageData.mimeType,
        upsert: true
      });

    if (error) {
      throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    // call supabase rpc handle_happyface_generation to save result and decrease credits
    const { error: rpcError } = await supabase.rpc('handle_happyface_generation', {
      p_user_id: userId,
      p_source_image_url: sourceImageUrl,
      p_prompt: prompt,
      p_result_image_url: publicUrl
    });
    if (rpcError) {
      throw new Error('Failed to handle happyface generation: ' + rpcError.message);
    }

    return {
      status: 'completed',
      progress: 100,
      url: publicUrl
    };
  }
  
  // If job is still processing
  if (!data[jobId]?.executing) {
    return {
      status: 'processing',
      progress: 0,
      currentStep: 'Processing'
    };
  }

  return {
    status: 'processing',
    progress: 20,
    currentStep: 'Processing'
  };
}

// Helper functions from selfie-pose generator
async function downloadImage(url: string): Promise<DownloadedImage> {
  const response = await fetch(url);
  let mimeType = response.headers.get('content-type') || 'image/jpeg';
  
  if (url.includes('.jpg') || url.includes('.jpeg')) {
    mimeType = 'image/jpeg';
  } else if (url.includes('.png')) {
    mimeType = 'image/png';
  } else if (url.includes('.webp')) {
    mimeType = 'image/webp';
  }

  const blob = await response.blob();
  const base64 = await blobToBase64(new Blob([blob], { type: mimeType }));
  
  return { blob, base64, mimeType };
}

async function uploadImage(imageData: DownloadedImage): Promise<string> {
  const formData = new FormData();
  formData.append('image', imageData.blob);
  
  const uploadResponse = await fetch(`${COMFY_API_HOST}/upload/image`, {
    method: 'POST',
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await uploadResponse.json();
  return data.name;
}

async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

// Add required types
type DownloadedImage = {
  blob: Blob;
  base64: string;
  mimeType: string;
};

type ComfyUIProgress = {
  status: 'completed' | 'processing' | 'error';
  progress: number;
  currentStep?: string;
  url?: string;
};