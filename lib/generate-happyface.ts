'use server'
import { createClient } from '@supabase/supabase-js'
import appConfig from './app-config'
import { getUserSubscriptionStatus } from './user-utils'
import cumfaceInstidIpadapterWorkflow from '@/app/comfyui-workflows/cumface-instid-ipadpt-v2-supa-api.json'
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
    // Directly set the source image URL in the workflow
    workflow[244].inputs.url_or_path = sourceImageUrl;
    // set ipadapter strength to 1.12
    workflow[206].inputs.weight = 0.97;
  } else {
    // If no source image, set weights to 0
    workflow[206].inputs.weight = 0;
    workflow[237].inputs.weight = 0;
  }

  // Set LoRA strengths if provided
  if (cumStrength !== undefined) {
    const cumStrengthModelFactor = 1.12;
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
  const cumPart = cumStrength && cumStrength > 0.2 ? 'cum on face, a lot of cum on face, ' : '';
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
        prompt: prompt,
        upload_image: sourceImageUrl,
        comfyui_prompt_id: data.prompt_id,
        comfyui_server: COMFY_API_HOST,
        feature: 'cum-face',
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

export async function checkHappyFaceStatus(jobId: string, userId: string, sourceImageUrl: string | null, prompt: string): Promise<ComfyUIProgress> {
  try {
    // Check queue status first
    const queueResponse = await fetch(`${COMFY_API_HOST}/queue`, {
      signal: AbortSignal.timeout(15000) // 15 seconds timeout
    });

    //console.log('queueResponse', queueResponse);
    
    if (!queueResponse.ok) {
      console.error('Failed to check queue status', queueResponse);
      return {
        status: 'processing',
        progress: 0,
        currentStep: 'Processing'
      };
    }
    
    const queueData = await queueResponse.json();

    console.log('queueData', queueData);
    
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

      // when there's unknown error, return 'processing' as we don't know the status of the server, might be just busy, so that client can try again later
      return {
        status: 'processing',
        progress: 0,
        currentStep: 'Processing'
      };
    }

    const data = await response.json();

    console.log('data', data, 'jobId', jobId);
    
    // Check if job is completed - node 243 is now the SupabaseStorageUploader node
    if (Object.keys(data).length > 0 && data[jobId]?.outputs?.[250]?.text.length > 0 && data[jobId]?.outputs?.[250]?.text[0]) {
      const imageUrl = data[jobId].outputs[250].text[0];
      
      // Add retry logic for the job completed case
      const MAX_RETRIES = 3;
      let retryCount = 0;
      let lastError: unknown = null;

      while (retryCount < MAX_RETRIES) {
        try {
          // log handle happyface generation time
          const handleHappyfaceStartTime = new Date();
          // call supabase rpc handle_happyface_generation to save result and decrease credits
          const { error: rpcError } = await supabase.rpc('handle_happyface_generation', {
            p_user_id: userId,
            p_source_image_url: sourceImageUrl,
            p_prompt: prompt,
            p_result_image_url: imageUrl,
            p_comfyui_prompt_id: jobId,
          });
          const handleHappyfaceEndTime = new Date();
          const handleHappyfaceTime = handleHappyfaceEndTime.getTime() - handleHappyfaceStartTime.getTime();
          console.log('Handle happyface time', handleHappyfaceTime);
          
          if (rpcError) {
            throw new Error(`Failed to handle happyface generation: ${rpcError.message}`);
          }

          console.log('Total time', handleHappyfaceTime, 'returning:', imageUrl);

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
    console.error('Error checking HappyFace status:', error);
    
    // Check if it's a timeout error
    const isTimeoutError = 
      (error instanceof Error && error.name === 'AbortError') || 
      (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'UND_ERR_CONNECT_TIMEOUT') ||
      (error instanceof Error && error.cause && 
       typeof error.cause === 'object' && 'code' in error.cause && 
       (error.cause as NodeJS.ErrnoException).code === 'UND_ERR_CONNECT_TIMEOUT');
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // for unkonwn error or timeout error, or connection error, return 'processing' as we don't know the status of the server, might be just busy, so that client can try again later
    return {
      status: 'processing',
      progress: 0,
      currentStep: isTimeoutError 
        ? 'Connection timeout: The server is taking too long to respond. Please try again later.'
        : `Error checking job status: ${errorMessage}`
    };
  }
}

// Export the helper functions so they're not flagged as unused
export async function downloadImage(url: string): Promise<DownloadedImage> {
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

export async function uploadImage(imageData: DownloadedImage): Promise<string> {
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
  status: 'completed' | 'processing' | 'error' | 'pending';
  progress: number;
  currentStep?: string;
  url?: string;
};
