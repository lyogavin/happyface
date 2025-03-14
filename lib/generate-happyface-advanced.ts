'use server'
import { createClient } from '@supabase/supabase-js'
import appConfig from './app-config'
import { getUserSubscriptionStatus } from './user-utils'
import cumfaceInstidIpadapterWorkflow from '@/app/comfyui-workflows/cumface-instid-ipadpt-v2-supa-advanced-api.json'
import cumfaceInstidIpadapterInpaintWorkflow from '@/app/comfyui-workflows/cumface-instid-ipadpt-v2-supa-advanced-inpaint-api.json'
import cumfaceWorkflow from '@/app/comfyui-workflows/cumface-supa-api.json'
import sharp from 'sharp'
// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SECRET!
)

const MOCK_LOCAL = false;
let COMFY_API_HOST = '';
if (MOCK_LOCAL && process.env.NODE_ENV === 'development') {
  COMFY_API_HOST = 'http://171.226.37.71:23025';
} else {
  COMFY_API_HOST = appConfig.comfyuiHost;
}

export async function submitHappyFaceJobAdvanced(
  userId: string,
  sourceImageUrl: string | null,
  prompt?: string,
  cumStrength?: number,
  orgasmStrength?: number, 
  onlyModifyFace?: boolean
): Promise<string> {
  console.log('submitHappyFaceJob', userId, sourceImageUrl, prompt, cumStrength, orgasmStrength, onlyModifyFace);

  // Check user subscription status first
  const subscription = await getUserSubscriptionStatus(userId);
  if (!subscription || subscription.credits < 1) {
    return 'Insufficient credits';
  }

  let workflow;
  let orgasmStrengthModelFactor = 1.0;
  let orgasmStrengthClipFactor = 1.0;
  let cumStrengthModelFactor = 1.0;
  let cumStrengthClipFactor = 1.0;
  
  if (sourceImageUrl) {
    

    // Connect the appropriate mask based on onlyModifyFace parameter
    if (onlyModifyFace) {
      // Advanced workflow with source image
      workflow = JSON.parse(JSON.stringify(cumfaceInstidIpadapterInpaintWorkflow));
      orgasmStrengthModelFactor = 1.0;
      orgasmStrengthClipFactor = 1.0;
      cumStrengthModelFactor = 1.0;
      cumStrengthClipFactor = 1.0;
    } else {
      // Advanced workflow with source image
      workflow = JSON.parse(JSON.stringify(cumfaceInstidIpadapterWorkflow));
      orgasmStrengthModelFactor = 1.0;
      orgasmStrengthClipFactor = 1.0;
      cumStrengthModelFactor = 1.0;
      cumStrengthClipFactor = 1.0;
    }

    // Configure source image and upscaling
    workflow[94].inputs.image_url = sourceImageUrl;
    workflow[94].inputs.recraft_api_key = process.env.RECRFT_API_KEY!;
    //workflow[76].inputs.pixels = ["94", 0];
    //workflow[72].inputs.weight = 0.97; // ipadapter strength

  } else {
    orgasmStrengthModelFactor = 0.5;
    orgasmStrengthClipFactor = 0.5;
    cumStrengthModelFactor = 0.5;
    cumStrengthClipFactor = 0.5;
    // Basic workflow without source image
    workflow = JSON.parse(JSON.stringify(cumfaceWorkflow));

    workflow[40].inputs.text = "ugly, organ, dick, cock, multiple person";
    
  }

  // Common configurations for both workflows
  
  // Set random seed for node 3 (KSampler)
  workflow[3].inputs.seed = Math.floor(Math.random() * 1000000);

  // Set Supabase configuration
  workflow[91].inputs.supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  workflow[91].inputs.supabase_key = process.env.NEXT_PUBLIC_SUPABASE_SECRET!;
  workflow[91].inputs.storage_bucket = 'images';
  workflow[91].inputs.storage_path = 'public/happyface/';
  workflow[91].inputs.filename_prefix = `comfy_${crypto.randomUUID()}_`;

  // Set LoRA strengths if provided
  if (cumStrength !== undefined) {
    //const cumStrengthModelFactor = 2.0;
    //const cumStrengthClipFactor = 2.0;
    workflow[78].inputs.strength_model = cumStrength * cumStrengthModelFactor;
    workflow[78].inputs.strength_clip = cumStrength * cumStrengthClipFactor;
  }

  if (orgasmStrength !== undefined) {
    //const orgasmStrengthModelFactor = 1.0;
    //const orgasmStrengthClipFactor = 1.0;
    workflow[73].inputs.strength_model = orgasmStrength * orgasmStrengthModelFactor;
    workflow[73].inputs.strength_clip = orgasmStrength * orgasmStrengthClipFactor;
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
    workflow[39].inputs.text = mergedPrompt;
  } else {
    workflow[39].inputs.text = `${cumPart} ${orgasmPart}`;
  }

  // Add retry logic for submitting the job to ComfyUI
  const MAX_RETRIES = 5;
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < MAX_RETRIES) {
    try {
      // Submit the job to ComfyUI with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // console.log('Submitting job to ComfyUI', `${COMFY_API_HOST}/prompt`, 'workflow', workflow);
      
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

export async function checkHappyFaceStatusAdvanced(jobId: string, userId: string, sourceImageUrl: string | null, prompt: string): Promise<ComfyUIProgress> {
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

    //console.log('queueData', queueData);
    
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

    // Add check for empty data
    if (Object.keys(data).length === 0) {
      try {
        // Update generation status in database
        await supabase.from('happyface_generations')
          .update({ generation: 'job_error' })
          .eq('comfyui_prompt_id', jobId);
      } catch (dbError) {
        console.error('Failed to update generation status in database:', dbError);
      }
      
      return {
        status: 'job_error',
        progress: 0,
        currentStep: 'Error',
        message: 'Job not found.'
      };
    }

    if (data['status']?.status_str === 'error') {
      console.error('Job error', data['status']);
      // try catch to set message in case format is not correct
      let message = 'Unknown error';
      try {
        message = data[jobId]['status']['messages'][2][1]['exception_message'];
      } catch (error) {
        console.error('Error getting message', error);
      }

      try {
        // Update generation status in database
        await supabase.from('happyface_generations')
          .update({ generation: 'job_error' })
          .eq('comfyui_prompt_id', jobId);
      } catch (dbError) {
        console.error('Failed to update generation status in database:', dbError);
      }

      return {
        status: 'job_error',
        progress: 0,
        currentStep: 'Error',
        message: message
      };
    }
    // Check if job is completed - now looking for text output from Display Any node (92)
    if (Object.keys(data).length > 0 && data[jobId]?.outputs?.[92]?.text?.length > 0 && data[jobId]?.outputs?.[92]?.text[0]) {
      const imageUrl = data[jobId].outputs[92].text[0];
      
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
  status: 'completed' | 'processing' | 'error' | 'pending' | 'job_error';
  progress: number;
  currentStep?: string;
  url?: string;
  message?: string;
};
