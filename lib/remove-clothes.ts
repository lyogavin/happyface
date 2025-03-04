'use server'
import { createClient } from '@supabase/supabase-js'
import appConfig from './app-config'
import { getUserSubscriptionStatus } from './user-utils'
import removeClothesWorkflow from '@/app/comfyui-workflows/agfluxnsfw-fill-inpaint-api.json'
import sharp from 'sharp'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SECRET!
)

const COMFY_API_HOST = appConfig.comfyuiHostClothesRemover;

export async function submitRemoveClothesJob(
  userId: string,
  sourceImageUrl: string,
  maskImageUrl: string,
  prompt?: string
): Promise<string> {
  console.log('submitRemoveClothesJob', userId, sourceImageUrl, maskImageUrl, prompt);
  // Check user subscription status first
  const subscription = await getUserSubscriptionStatus(userId);
  if (!subscription || subscription.credits < 1) {
    return 'Insufficient credits';
  }

  // Load the workflow (create a deep copy to avoid modifying the original)
  const workflow = JSON.parse(JSON.stringify(removeClothesWorkflow));
  
  // Set random seed for KSampler (node 3)
  workflow[3].inputs.seed = Math.floor(Math.random() * 1000000000000);
  
  // Set the source image URL in the workflow (node 45)
  workflow[45].inputs.url_or_path = sourceImageUrl;
  
  // Set the mask image URL in the workflow (node 46)
  workflow[46].inputs.url_or_path = maskImageUrl;
  
  // Set prompt
  const defaultPrompt = "top fully naked girl";
  workflow[23].inputs.text = prompt || defaultPrompt;
  
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

export async function checkRemoveClothesStatus(jobId: string, userId: string, sourceImageUrl: string, prompt: string): Promise<ComfyUIProgress> {
  const response = await fetch(`${COMFY_API_HOST}/history/${jobId}`);
  
  if (!response.ok) {
    console.error('Failed to check job status', response);
    throw new Error('Failed to check job status');
  }

  const data = await response.json();
  
  // Check if job is completed - node 9 is the SaveImage node in this workflow
  if (Object.keys(data).length > 0 && data[jobId]?.outputs?.[9]?.images?.[0]) {
    const comfyUrl = `${COMFY_API_HOST}/view?filename=${data[jobId].outputs[9].images[0].filename}`;
    
    // Download the image from ComfyUI
    const startTime = new Date();
    const imageData = await downloadImage(comfyUrl);
    const endTime = new Date();
    const downloadTime = endTime.getTime() - startTime.getTime();
    console.log('Download time', downloadTime);
    
    // Upload to Supabase with UUID filename
    const fileName = `${crypto.randomUUID()}.${imageData.mimeType.split('/')[1]}`;
    const filePath = `public/removeclothes/${fileName}`;
    
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

    // log handle remove clothes generation time
    const handleStartTime = new Date();
    // call supabase rpc to save result and decrease credits
    const { error: rpcError } = await supabase.rpc('handle_clothes_remover', {
      p_user_id: userId,
      p_source_image_url: sourceImageUrl,
      p_prompt: prompt,
      p_result_image_url: publicUrl
    });
    const handleEndTime = new Date();
    const handleTime = handleEndTime.getTime() - handleStartTime.getTime();
    console.log('Handle remove clothes time', handleTime);
    if (rpcError) {
      console.error('Failed to handle remove clothes generation', rpcError);
      throw new Error('Failed to handle remove clothes generation: ' + rpcError.message);
    }

    console.log('Total time', downloadTime + uploadTime + handleTime, 'returning:', publicUrl);

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

// Helper functions
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


async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

// Types
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
