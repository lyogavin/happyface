'use server'

import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';
import appConfig from './app-config';

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
  if (process.env.NODE_ENV === 'development') {
    return { 
      status: 'active',
      type: 'pro',
      credits: 1000
    };
  }

  // Get user data from supabase
  const { data, error } = await supabaseClient
    .from('happyface_users')
    .select('stripe_id, credits')
    .eq('clerk_id', user_id)
    .single();

  if (error) {
    console.error("Error fetching user data:", error);
    return { 
      status: 'inactive',
      type: 'free',
      credits: 0
    };
  }

  // Check credits first
  if (data.credits > 0) {
    return {
      status: 'active',
      type: 'credits',
      credits: data.credits
    };
  }

  // Check Stripe subscription if stripe_id exists
  if (data.stripe_id) {
    try {
      const subscriptions = await stripeClient.subscriptions.list({
        customer: data.stripe_id,
        limit: 1
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        const priceId = subscription.items.data[0].price.id;
        
        // Match with your pricing configuration
        const plan = appConfig.prices.find(p => 
          p.monthlyPriceId === priceId || p.yearlyPriceId === priceId
        );

        return {
          status: subscription.status,
          type: plan?.name.toLowerCase() || 'unknown',
          credits: 0
        };
      }
    } catch (error) {
      console.error("Error fetching Stripe subscription:", error);
    }
  }

  // Default return for users with no subscription or credits
  return {
    status: 'inactive',
    type: 'free',
    credits: 0
  };
};
