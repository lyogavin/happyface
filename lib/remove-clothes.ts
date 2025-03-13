'use server'
import { createClient } from '@supabase/supabase-js'
import appConfig from './app-config'
import { getUserSubscriptionStatus } from './user-utils'
import removeClothesWorkflow from '@/app/comfyui-workflows/agfluxnsfw-fill-inpaint-supabase-api.json'
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
  const defaultPrompt = "fully naked, fully nude, no clothes";
  workflow[23].inputs.text = prompt || defaultPrompt;
  
  // Add retry logic for submitting the job to ComfyUI
  const MAX_RETRIES = 3;
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < MAX_RETRIES) {
    try {
      // Submit the job to ComfyUI with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${COMFY_API_HOST}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: workflow,
          client_id: crypto.randomUUID(),
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to submit ComfyUI job: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('ComfyUI job submitted, data', data);

      // after submit, fill db with the job id and comfyui server address
      const { error: dbError } = await supabase.from('happyface_generations').insert({
        user_id: userId,
        prompt: prompt || defaultPrompt,
        upload_image: sourceImageUrl,
        mask_image: maskImageUrl,
        comfyui_prompt_id: data.prompt_id,
        comfyui_server: COMFY_API_HOST,
        feature: 'clothes-remover',
      });
      
      if (dbError) {
        console.error('Failed to insert into happyface_generations', dbError);
      }

      return data.prompt_id;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retryCount++;
      
      console.error(`Failed to submit ComfyUI job (attempt ${retryCount}/${MAX_RETRIES}):`, lastError.message);
      
      if (retryCount < MAX_RETRIES) {
        // Exponential backoff: wait longer between each retry
        const backoffTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
        console.log(`Retrying job submission in ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }

  // If we've exhausted all retries, throw the last error
  if (lastError) {
    console.error('Exhausted all retries for ComfyUI job submission');
    throw new Error(`Failed to submit ComfyUI job after ${MAX_RETRIES} attempts: ${lastError.message}`);
  }
  
  // This should never be reached, but TypeScript requires a return
  throw new Error('Unexpected error in job submission');
}

export async function checkRemoveClothesStatus(jobId: string, userId: string, sourceImageUrl: string, prompt: string): Promise<ComfyUIProgress> {
  try {
    // Check queue status first
    const queueResponse = await fetch(`${COMFY_API_HOST}/queue`, {
      signal: AbortSignal.timeout(15000) // 15 seconds timeout
    });
    
    if (!queueResponse.ok) {
      console.error('Failed to check queue status', queueResponse);
      return {
        status: 'processing',
        progress: 0,
        currentStep: 'Processing'
      };
    }
    
    const queueData = await queueResponse.json();
    
    // Check if job is in queue
    const isInRunningQueue = queueData.queue_running.some(
      (item: any[]) => item[1] === jobId
    );
    const isInPendingQueue = queueData.queue_pending.some(
      (item: any[]) => item[1] === jobId
    );

    if (isInRunningQueue) {
      return {
        status: 'processing',
        progress: 50,
        currentStep: 'Processing'
      };
    }

    if (isInPendingQueue) {
      return {
        status: 'pending',
        progress: 10,
        currentStep: 'Waiting in queue'
      };
    }

    // If not in queue, check history as before
    const response = await fetch(`${COMFY_API_HOST}/history/${jobId}`, {
      // Add timeout options to prevent hanging indefinitely
      signal: AbortSignal.timeout(15000) // 15 seconds timeout
    });
    
    if (!response.ok) {
      console.error('Failed to check job status', response);

      // when there's unknown error, return 'processing' as we don't know the status of the server
      return {
        status: 'processing',
        progress: 0,
        currentStep: 'Processing'
      };
    }

    const data = await response.json();
    
    // Add check for job error status
    if (data['status']?.status_str === 'error') {
      console.error('Job error', data['status']);
      // try catch to set message in case format is not correct
      let message = 'Unknown error';
      try {
        message = data[jobId]['status']['messages'][2][1]['exception_message'];
      } catch (error) {
        console.error('Error getting message', error);
      }
      return {
        status: 'job_error',
        progress: 0,
        currentStep: 'Error',
        message: message
      };
    }

    // Check if job is completed - node 47 is the SupabaseStorageUploader node
    if (Object.keys(data).length > 0 && data[jobId]?.outputs?.[49]?.text.length > 0 && data[jobId]?.outputs?.[49]?.text[0]) {
      const imageUrl = data[jobId].outputs[49].text[0];
      
      // Add retry logic for the job completed case
      const MAX_RETRIES = 3;
      let retryCount = 0;
      let lastError: unknown = null;

      while (retryCount < MAX_RETRIES) {
        try {
          // log handle remove clothes generation time
          const handleStartTime = new Date();
          // call supabase rpc to save result and decrease credits
          const { error: rpcError } = await supabase.rpc('handle_clothes_remover', {
            p_user_id: userId,
            p_source_image_url: sourceImageUrl,
            p_prompt: prompt,
            p_result_image_url: imageUrl,
            p_comfyui_prompt_id: jobId,
          });
          const handleEndTime = new Date();
          const handleTime = handleEndTime.getTime() - handleStartTime.getTime();
          console.log('Handle remove clothes time', handleTime);
          
          if (rpcError) {
            throw new Error(`Failed to handle remove clothes generation: ${rpcError.message}`);
          }

          console.log('Total time', handleTime, 'returning:', imageUrl);

          return {
            status: 'completed',
            progress: 100,
            url: imageUrl
          };
        } catch (error: unknown) {
          lastError = error;
          retryCount++;
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error(`Error processing completed image (attempt ${retryCount}/${MAX_RETRIES}):`, errorMessage);
          
          if (retryCount < MAX_RETRIES) {
            // Exponential backoff: wait longer between each retry
            const backoffTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
            console.log(`Retrying in ${backoffTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          }
        }
      }
      
      // If we've exhausted all retries, return an error
      const errorMessage = lastError instanceof Error ? lastError.message : 'Unknown error occurred';
      console.error('Exhausted all retries for processing completed image:', errorMessage);
      return {
        status: 'error',
        progress: 0,
        currentStep: `Error processing the completed image after ${MAX_RETRIES} attempts: ${errorMessage}`
      };
    }
    
    // If job is still processing
    if (!data[jobId]?.executing) {
      return {
        status: 'processing',
        progress: 20,
        currentStep: 'Processing'
      };
    }

    return {
      status: 'processing',
      progress: 20,
      currentStep: 'Processing'
    };
  } catch (error: unknown) {
    // Handle connection timeout and other network errors
    console.error('Error checking Remove Clothes status:', error);
    
    // Check if it's a timeout error
    const isTimeoutError = 
      (error instanceof Error && error.name === 'AbortError') || 
      (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'UND_ERR_CONNECT_TIMEOUT') ||
      (error instanceof Error && error.cause && 
       typeof error.cause === 'object' && 'code' in error.cause && 
       (error.cause as NodeJS.ErrnoException).code === 'UND_ERR_CONNECT_TIMEOUT');
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // for unknown error or timeout error, return 'processing' as we don't know the status of the server
    return {
      status: 'processing',
      progress: 0,
      currentStep: isTimeoutError 
        ? 'Connection timeout: The server is taking too long to respond. Please try again later.'
        : `Error checking job status: ${errorMessage}`
    };
  }
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
  status: 'completed' | 'processing' | 'pending' | 'error' | 'job_error';
  progress: number;
  currentStep?: string;
  url?: string;
  message?: string;
};
