'use server'
// Functions to handle NSFW image generation with ComfyUI workflow

import { createClient } from '@supabase/supabase-js'
import appConfig from './app-config'
import { getUserSubscriptionStatus } from './user-utils'
import nsfwGenerationWorkflowWithRef from '@/app/comfyui-workflows/flux-nsfw-pulid-upload-api.json'
import nsfwGenerationWorkflowNoRef from '@/app/comfyui-workflows/flux-nsfw-upload-api.json'

// Define JobStatusResponse interface
interface JobStatusResponse {
  status: string;
  result?: string;
  message?: string;
  url?: string;
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SECRET!
)

const COMFY_API_HOST = appConfig.comfyuiHostNsfwGenerator;

export async function submitNsfwGenerationJob(
  userId: string,
  referenceImages: string[],
  prompt: string,
  optimizeForSm: boolean = false,
  width: number = 1152,
  height: number = 896,
  highQuality: boolean = false
): Promise<string> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    // Check user subscription status first
    const subscription = await getUserSubscriptionStatus(userId);
    // If high quality is enabled, check if user has at least 2 credits
    const requiredCredits = highQuality ? 2 : 1;
    if (!subscription || subscription.credits < requiredCredits) {
      return 'Insufficient credits';
    }

    const defaultPrompt = "a beautiful woman, naked, detailed, high quality";
    let finalPrompt = prompt.trim() ? prompt : defaultPrompt;

    // Choose the appropriate workflow based on whether reference images are provided
    const workflow = JSON.parse(JSON.stringify(
      referenceImages.length > 0 ? nsfwGenerationWorkflowWithRef : nsfwGenerationWorkflowNoRef
    ));

    // Set random seed for noise generation (node 25)
    workflow[25].inputs.noise_seed = Math.floor(Math.random() * 1000000000000);
    
    // Set resolution dimensions in the workflow
    // Update EmptySD3LatentImage node (node 27)
    if (workflow[27] && workflow[27].class_type === "EmptySD3LatentImage") {
      workflow[27].inputs.width = width;
      workflow[27].inputs.height = height;
    }
    
    // Update ModelSamplingFlux node (node 30)
    if (workflow[30] && workflow[30].class_type === "ModelSamplingFlux") {
      workflow[30].inputs.width = width;
      workflow[30].inputs.height = height;
    }
    
    // Configure LoRA model and prompt postfix based on optimizeForSm flag
    if (workflow[75] && workflow[75].class_type === "LoraLoader") {
      if (optimizeForSm) {
        // Set petite-optimized LoRA and postfix
        workflow[75].inputs.lora_name = "NSFW_Flux_Petite-000002.safetensors";
        finalPrompt = finalPrompt + (finalPrompt.includes("petite") ? "" : ", petite");
      } else {
        // Set default LoRA and postfix
        workflow[75].inputs.lora_name = "NSFW_master.safetensors";
        finalPrompt = finalPrompt + (finalPrompt.includes("AiArtV") ? "" : ", AiArtV");
      }
    }
    
    // Set the reference image URLs in the workflow
    // Only modify reference image nodes if we're using the workflow with reference images
    if (referenceImages.length > 0) {
      // Limit to maximum 10 reference images
      const limitedReferenceImages = referenceImages.slice(0, 10);

      // when fewer than 2, duplicate the first image
      if (limitedReferenceImages.length < 2) {
        limitedReferenceImages.push(limitedReferenceImages[0]);
      }
      
      // Update node 74's inputcount with the number of images we're using
      if (workflow[74]) {
        workflow[74].inputs.inputcount = limitedReferenceImages.length;
        
        // First, update the individual LoadImageFromUrlOrPath nodes (76, 77, 80-87)
        const imageLoaderNodeIds = [76, 77, 80, 81, 82, 83, 84, 85, 86, 87];
        
        // Set each reference image URL to corresponding loader nodes
        limitedReferenceImages.forEach((imageUrl, index) => {
          const nodeId = imageLoaderNodeIds[index];
          if (workflow[nodeId]) {
            workflow[nodeId].inputs.url_or_path = imageUrl;
          }
        });
      }
    }
    
    // Set the prompt (node 6)
    workflow[6].inputs.text = finalPrompt;

    // Set Supabase URL and API key in the Supabase Storage Uploader node (node 78)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET;
    
    // Find the Supabase Storage Uploader node - it could be node 78 or another number
    // depending on which workflow we're using
    const supabaseUploaderNode = Object.entries(workflow).find(
      ([_, node]: [string, any]) => 
        node.class_type === "SupabaseStorageUploader"
    );
    
    if (supabaseUrl && supabaseKey && supabaseUploaderNode) {
      const [nodeId, node] = supabaseUploaderNode;
      // Update the Supabase configuration in the workflow
      workflow[nodeId].inputs.supabase_url = supabaseUrl;
      workflow[nodeId].inputs.supabase_key = supabaseKey;
      console.log(`Set Supabase credentials in workflow node ${nodeId}`);
    } else {
      console.warn("Could not set Supabase credentials in workflow: missing required values");
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
          prompt: finalPrompt,
          reference_images: referenceImages,
          comfyui_prompt_id: data.prompt_id,
          comfyui_server: COMFY_API_HOST,
          feature: 'nsfw-generator',
          credits: highQuality ? 2 : 1
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
    
  } catch (error) {
    console.error("Error submitting NSFW generation job:", error);
    throw error;
  }
}

export async function checkNsfwGenerationStatus(
  jobId: string, 
  userId: string,
  referenceImages: string[],
  prompt: string,
  optimizeForSm: boolean = false,
  width: number = 1152,
  height: number = 896,
  highQuality: boolean = false
): Promise<{ status: string; url?: string }> {
  console.log('checkNsfwGenerationStatus', jobId, userId, referenceImages, prompt, optimizeForSm, width, height, highQuality);
  try {
    if (!jobId || !userId) {
      throw new Error("Job ID and User ID are required");
    }

    // Check queue status first
    const queueResponse = await fetch(`${COMFY_API_HOST}/queue`, {
      signal: AbortSignal.timeout(15000) // 15 seconds timeout
    });

    if (!queueResponse.ok) {
      console.error('Failed to check queue status', queueResponse);
      return {
        status: 'processing'
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
        status: 'processing'
      };
    }

    if (isInPendingQueue) {
      return {
        status: 'pending'
      };
    }

    // If not in queue, check history
    const response = await fetch(`${COMFY_API_HOST}/history/${jobId}`, {
      // Add timeout options to prevent hanging indefinitely
      signal: AbortSignal.timeout(15000) // 15 seconds timeout
    });
    
    if (!response.ok) {
      console.error('Failed to check job status', response);

      // when there's unknown error, return 'processing' as we don't know the status of the server
      return {
        status: 'processing'
      };
    }

    const data = await response.json();
    
    // Add check for empty data
    if (Object.keys(data).length === 0) {
      try {
        // Update generation status in database
        await supabase.from('happyface_generations')
          .update({ generation: 'job_error' })
          .eq('comfyui_prompt_id', jobId);

        console.log('job not found, updated generation status in database:', jobId);
      } catch (dbError) {
        console.error('Failed to update generation status in database:', dbError);
      }

      return {
        status: 'job_error'
      };
    }

    // Add check for job error status
    if (data['status']?.status_str === 'error') {
      console.error('Job error', data['status']);
      
      try {
        // Update generation status in database
        await supabase.from('happyface_generations')
          .update({ generation: 'job_error' })
          .eq('comfyui_prompt_id', jobId);
      } catch (dbError) {
        console.error('Failed to update generation status in database:', dbError);
      }

      return {
        status: 'job_error'
      };
    }

    // Check if job is completed
    // We need to find the Display Any node connected to the Supabase Storage Uploader
    if (Object.keys(data).length > 0 && data[jobId]?.outputs) {
      // Method 1: If the workflow metadata is preserved in the output, find by class_type
      let displayAnyNodeId = null;
      
      // Try to find the node by looking for class_type = "Display Any (rgthree)" in the workflow definition
      if (data[jobId]?.prompt) {
        for (const [nodeId, nodeValue] of Object.entries(data[jobId].prompt)) {
          const node = nodeValue as any;
          if (node.class_type === "Display Any (rgthree)" || 
              (node._meta && node._meta.title && node._meta.title.includes("Display Any"))) {
            displayAnyNodeId = nodeId;
            break;
          }
        }
      }
      
      // Method 2: If workflow definition not available, find nodes with text output that likely came from SupabaseStorageUploader
      if (!displayAnyNodeId) {
        for (const [nodeId, outputValue] of Object.entries(data[jobId].outputs)) {
          const output = outputValue as any;
          // Check if this node has a text output with URLs
          if (output.text && 
              output.text.length > 0 && 
              typeof output.text[0] === 'string' && 
              output.text[0].startsWith('http')) {
            displayAnyNodeId = nodeId;
            break;
          }
        }
      }
      
      // If we found a Display Any node with text output
      if (displayAnyNodeId && data[jobId].outputs[displayAnyNodeId]?.text?.length > 0) {
        const imageUrl = data[jobId].outputs[displayAnyNodeId].text[0];

        // if imageUrl is not a valid url, return 'job_error'
        if (!imageUrl.startsWith('http')) {
          // update db with job_error
          await supabase.from('happyface_generations')
            .update({ generation: 'job_error' })
            .eq('comfyui_prompt_id', jobId);

          return {
            status: 'job_error'
          };
        }
        
        // Add retry logic for the job completed case
        const MAX_RETRIES = 3;
        let retryCount = 0;
        let lastError: unknown = null;

        while (retryCount < MAX_RETRIES) {
          try {
            // log handle nsfw generation time
            const handleStartTime = new Date();
            // call supabase rpc to save result and decrease credits
            const { error: rpcError } = await supabase.rpc('handle_nsfw_generation_with_credits', {
              p_user_id: userId,
              p_reference_images: referenceImages,
              p_prompt: prompt,
              p_result_image_url: imageUrl,
              p_comfyui_prompt_id: jobId,
              p_credits: highQuality ? 2 : 1,
              p_result_image_hq_url: ''
            });
            const handleEndTime = new Date();
            const handleTime = handleEndTime.getTime() - handleStartTime.getTime();
            console.log('Handle nsfw generation time', handleTime);
            
            if (rpcError) {
              throw new Error(`Failed to handle nsfw generation: ${rpcError.message}`);
            }

            console.log('Total time', handleTime, 'returning:', imageUrl);

            return {
              status: 'completed',
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
        return {
          status: 'error'
        };
      }
    }
    
    // If job is still processing
    return {
      status: 'processing'
    };
  } catch (error) {
    console.error("Error checking NSFW generation status:", error);
    
    // Check if it's a timeout error
    const isTimeoutError = 
      (error instanceof Error && error.name === 'AbortError') || 
      (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'UND_ERR_CONNECT_TIMEOUT') ||
      (error instanceof Error && error.cause && 
       typeof error.cause === 'object' && 'code' in error.cause && 
       (error.cause as NodeJS.ErrnoException).code === 'UND_ERR_CONNECT_TIMEOUT');
    
    // for unknown error or timeout error, return 'processing' as we don't know the status of the server
    return {
      status: 'error'
    };
  }
} 
