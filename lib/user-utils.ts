'use server'

import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';

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
    const { error } = await supabaseClient
      .from('happyface_users')
      .insert({ clerk_id: user_id, credits: 5 }); // default credits to 5

    if (error) {
      console.error("Error creating new row for user", user_id, error);
    }

    const remainingCredits = 5;
    
    console.log("created new row for user", user_id);
    return {
      status: remainingCredits > 0 ? 'active' : 'inactive',
      type: 'credits',
      credits: Math.max(0, remainingCredits)
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

export const getUserGenerations = async (user_id: string) => {
  const { data, error } = await supabaseClient
    .from('happyface_generations')
    .select('generation')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(20); // Limit to most recent 20 generations

  if (error) {
    console.error("Error fetching user generations:", error);
    return [];
  }

  return data.map(generation => generation.generation);
};
