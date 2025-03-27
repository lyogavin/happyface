"use server"

import { createClient } from '@supabase/supabase-js';

// Add Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables are not configured');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to handle base64 data URLs
const base64ToBlob = async (dataUrl: string) => {
  const response = await fetch(dataUrl);
  return response.blob();
};

// Updated downloadImage function to handle both URLs and base64
const downloadImage = async (url: string) => {
  console.log("downloadImage url:", url.slice(0, 100));
  if (url.startsWith('data:')) {
    const blob = await base64ToBlob(url);
    return new Response(blob, {
      headers: {
        'Content-Type': blob.type
      }
    });
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'image/*'
    },
    cache: 'no-store'
  });
  return response;
}

// Recraft API for upscaling
const RECRAFT_API_KEY = process.env.RECRFT_API_KEY;
if (!RECRAFT_API_KEY) {
  throw new Error('Recraft API key is not configured');
}

export async function upscaleAndDownload(imageUrl: string): Promise<string> {
  // Download the image
  const downloadResponse = await downloadImage(imageUrl);
  const blob = await downloadResponse.blob();

  // Convert blob to FormData
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('response_format', 'b64_json');

  // Submit to Recraft API
  const response = await fetch('https://external.api.recraft.ai/v1/images/clarityUpscale', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RECRAFT_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upscale image');
  }

  const data = await response.json();
  const base64Data = data.image.b64_json;
  const upscaledBlob = await base64ToBlob(`data:image/png;base64,${base64Data}`);
  
  // Upload to Supabase
  const fileName = `${crypto.randomUUID()}.png`;
  const filePath = `public/upscaled/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, upscaledBlob, {
      contentType: 'image/png',
      upsert: true
    });

  if (uploadError) {
    throw new Error(`Failed to upload to Supabase: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return publicUrl;
}