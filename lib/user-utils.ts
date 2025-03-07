'use server'

import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';
import appConfig from '@/lib/app-config';
import { checkHappyFaceStatus } from './generate-happyface';
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);



export const getStripePortalSession = async (stripe_id: string | null, email: string) => {;

  if (!stripe_id) {
      console.log("No stripe_id found, trying to search by email");
      const customer = await stripeClient.customers.search({
          query: `email:"${email}"`,
          limit: 1
      });
      if (customer.data.length > 0) {
          stripe_id = customer.data[0].id;
      } else {
          console.error("No customer found");
          return null;
      }
  }
  console.log("creating stripe portal session for ", stripe_id);
  const session = await stripeClient.billingPortal.sessions.create({
      customer: stripe_id,
      return_url: 'https://cumfaceai.com/editor', // return to current page
  });
  return session;
}



export const getUserSubscriptionStatus = async (user_id: string) => {
  // Check if in local development
  const MOCK_LOCAL = true;
  if (MOCK_LOCAL && process.env.NODE_ENV === 'development') {
    return { 
      status: 'active',
      type: 'pro',
      credits: 1000
    };
  }

  console.log("getting user subscription status for ", user_id);

  // Get user data from supabase
  const { data: userData, error: userError } = await supabaseClient
    .from('happyface_users')
    .select('stripe_id, credits')
    .eq('clerk_id', user_id);

  if (userError) {
    console.error("Error fetching user data:", userError);
    return { 
      status: 'inactive',
      type: 'free',
      credits: 0
    };
  }
  // check no rows found in userData
  if (userData && userData.length === 0) {
    // when no rows found, create a new row
    const freeCredits = appConfig.freeCredits;
    const { error } = await supabaseClient
      .from('happyface_users')
      .insert({ clerk_id: user_id, credits: freeCredits }); // default credits to 5

    if (error) {
      console.error("Error creating new row for user", user_id, error);
    }

    
    console.log("created new row for user", user_id);
    return {
      status: 'active',
      type: 'credits',
      credits: freeCredits
    };
  }

  // Calculate remaining credits
  const remainingCredits = userData[0].credits;

  // Check credits
  if (remainingCredits > 0) {
    return {
      status: 'active',
      type: 'credits',
      credits: remainingCredits
    };
  }

  // Default return for users with no subscription or credits
  return {
    status: 'inactive',
    type: 'free',
    credits: 0
  };
};

export type UserGeneration = {
  generation: string;
  upload_image: string;
  comfyui_prompt_id: string;
  comfyui_server: string;
  prompt: string;
}

export const getUserGenerations = async (user_id: string, feature: string, limit: number = 20): Promise<UserGeneration[]> => {
  const { data, error } = await supabaseClient
    .from('happyface_generations')
    .select('generation, upload_image, comfyui_prompt_id, comfyui_server, prompt')
    .eq('user_id', user_id)
    .eq('feature', feature)
    .order('created_at', { ascending: false })
    .limit(limit); // Limit to most recent 20 generations

  if (error) {
    console.error("Error fetching user generations:", error);
    return [];
  }

  return data.map(generation => ({
    generation: generation.generation,
    upload_image: generation.upload_image,
    comfyui_prompt_id: generation.comfyui_prompt_id,
    comfyui_server: generation.comfyui_server,
    prompt: generation.prompt
  }));
};
