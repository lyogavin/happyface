'use server'
import { createClient } from '@supabase/supabase-js'
import appConfig from './app-config'
import { getUserSubscriptionStatus } from './user-utils'
import cumfaceInstidIpadapterWorkflow from '@/app/comfyui-workflows/cumface-instid-ipadpt-v2-api.json'
import sharp from 'sharp'
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
  console.log('submitHappyFaceJob', userId, sourceImageUrl, prompt, cumStrength, orgasmStrength);
  // Check user subscription status first
  const subscription = await getUserSubscriptionStatus(userId);
  if (!subscription || subscription.credits < 1) {
    return 'Insufficient credits';
  }

  // Load the workflow (create a deep copy to avoid modifying the original)
  const workflow = JSON.parse(JSON.stringify(cumfaceInstidIpadapterWorkflow));
  
  // Set negative prompt
  workflow[7].inputs.text = "ugly, organ, dick, cock, multiple person";

  // Set random seed for node 73 (KSampler)
  workflow[73].inputs.seed = Math.floor(Math.random() * 1000000);

  if (sourceImageUrl) {
    // Download and upload the source image
    const sourceImage = await downloadImage(sourceImageUrl);
    const sourceName = await uploadImage(sourceImage);
    workflow[221].inputs.image = sourceName;
    // set ipadapter strength to 1.12
    workflow[206].inputs.weight = 1.12;
  
  } else {
    // If no source image, set weights to 0
    workflow[206].inputs.weight = 0;
    workflow[237].inputs.weight = 0;
  }

  // Set LoRA strengths if provided
  if (cumStrength !== undefined) {
    const cumStrengthModelFactor = 0.92;
    const cumStrengthClipFactor = 1.3;
    workflow[240].inputs.strength_model = cumStrength * cumStrengthModelFactor;
    workflow[240].inputs.strength_clip = cumStrength * cumStrengthClipFactor;
  }

  if (orgasmStrength !== undefined) {
    const orgasmStrengthModelFactor = 0.77;
    const orgasmStrengthClipFactor = 0.77;
    workflow[241].inputs.strength_model = orgasmStrength * orgasmStrengthModelFactor;
    workflow[241].inputs.strength_clip = orgasmStrength * orgasmStrengthClipFactor;
  }

  // Set prompt if provided
  const cumPart = cumStrength && cumStrength > 0.2 ? 'cum on face, ' : '';
  const orgasmPart = orgasmStrength && orgasmStrength > 0.2 ? 'orgasm, ' : '';
  if (prompt) {
    let mergedPrompt = prompt;
    if (!prompt.startsWith("cum on face")) {
      mergedPrompt = `${cumPart} ${prompt}`;
    }
    if (!prompt.endsWith("orgasm, cum on face")) {
      mergedPrompt = `${prompt} ${orgasmPart} ${cumPart}`;
    }
    workflow[190].inputs.text = mergedPrompt;
  } else {
    workflow[190].inputs.text = `${cumPart} ${orgasmPart}`;
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
    console.error('Failed to submit ComfyUI job', response);
    throw new Error('Failed to submit ComfyUI job');
  }

  const data = await response.json();
  console.log('ComfyUI job submitted, data', data);
  return data.prompt_id;
}

export async function checkHappyFaceStatus(jobId: string, userId: string, sourceImageUrl: string | null, prompt: string): Promise<ComfyUIProgress> {
  const response = await fetch(`${COMFY_API_HOST}/history/${jobId}`);
  
  if (!response.ok) {
    console.error('Failed to check job status', response);
    throw new Error('Failed to check job status');
  }

  const data = await response.json();
  
  // Check if job is completed - node 242 is now the SaveImage node
  if (Object.keys(data).length > 0 && data[jobId]?.outputs?.[242]?.images?.[0]) {
    const comfyUrl = `${COMFY_API_HOST}/view?filename=${data[jobId].outputs[242].images[0].filename}`;
    
    // Download the image from ComfyUI
    // log download image time
    const startTime = new Date();
    const imageData = await downloadImage(comfyUrl);
    const endTime = new Date();
    const downloadTime = endTime.getTime() - startTime.getTime();
    console.log('Download time', downloadTime);
    
    // Upload to Supabase with UUID filename
    const fileName = `${crypto.randomUUID()}.${imageData.mimeType.split('/')[1]}`;
    const filePath = `public/happyface/${fileName}`;
    
    // log upload time
    const uploadStartTime = new Date();
    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, imageData.blob, {
        contentType: imageData.mimeType,
        upsert: true
      });
    const uploadEndTime = new Date();
    const uploadTime = uploadEndTime.getTime() - uploadStartTime.getTime();
    console.log('Upload time', uploadTime);
    if (error) {
      console.error('Failed to upload to Supabase', error);
      throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    // log handle happyface generation time
    const handleHappyfaceStartTime = new Date();
    // call supabase rpc handle_happyface_generation to save result and decrease credits
    const { error: rpcError } = await supabase.rpc('handle_happyface_generation', {
      p_user_id: userId,
      p_source_image_url: sourceImageUrl,
      p_prompt: prompt,
      p_result_image_url: publicUrl
    });
    const handleHappyfaceEndTime = new Date();
    const handleHappyfaceTime = handleHappyfaceEndTime.getTime() - handleHappyfaceStartTime.getTime();
    console.log('Handle happyface time', handleHappyfaceTime);
    if (rpcError) {
      console.error('Failed to handle happyface generation', rpcError);
      throw new Error('Failed to handle happyface generation: ' + rpcError.message);
    }

    console.log('Total time', downloadTime + uploadTime + handleHappyfaceTime, 'returning:', publicUrl);

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

  const originalBuffer = await response.arrayBuffer();
  
  // Process image with sharp to make it square with padding
  const image = sharp(Buffer.from(originalBuffer), { failOn: 'truncated' });
  const metadata = await image.metadata();
  
  if (!metadata.width || !metadata.height) {
    console.error('Could not get image dimensions', metadata);
    throw new Error('Could not get image dimensions');
  }

  const maxDimension = Math.max(metadata.width, metadata.height);
  
  const paddedImage = await image
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .toBuffer();

  const blob = new Blob([paddedImage], { type: mimeType });
  const base64 = await blobToBase64(new Blob([paddedImage], { type: mimeType }));
  
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
