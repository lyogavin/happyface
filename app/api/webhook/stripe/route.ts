import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { appConfig } from '@/lib/app-config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const buf = await req.arrayBuffer();
  const sig = req.headers.get('stripe-signature') as string;

  let event;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Stripe webhook secret is not defined');
    return NextResponse.json({ error: 'Webhook secret is not defined' }, { status: 500 });
  }

  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig, webhookSecret);
  } catch {
    console.log(`⚠️  Webhook signature verification failed.`);
    return NextResponse.json({ error: `Webhook Error` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.client_reference_id) {
        const stripeId = session.customer as string;
        const userId = session.client_reference_id;
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;

        if (!priceId) {
          console.error('Price ID not found in session');
          return NextResponse.json({ error: 'Price ID not found' }, { status: 400 });
        }

        // Find credits amount from app config
        const priceConfig = appConfig.prices.find(p => p.priceId === priceId);
        if (!priceConfig) {
          console.error('Price configuration not found');
          return NextResponse.json({ error: 'Price configuration not found' }, { status: 400 });
        }

        const creditsToAdd = priceConfig.credits;

        // Update user in Clerk
        await clerkClient.users.updateUser(userId, {
          privateMetadata: { stripe_id: stripeId },
          publicMetadata: { stripe_email: session.customer_email },
        });

        // get user clerk email
        const user = await clerkClient.users.getUser(userId);
        const clerkEmail = user.emailAddresses[0].emailAddress;

        // update user in supabase
        const { error } = await supabaseClient
          .from('happyface_users')
          .update({ clerk_email: clerkEmail, stripe_id: stripeId, stripe_email: session.customer_email })
          .eq('clerk_id', userId);

        if (error) {
          // if error, don't stop, continue...
          console.warn('Error updating user in supabase:', error);
        }

        // Replace the direct update with RPC call
        let attempts = 0;
        const maxAttempts = 3;
        let lastErrorMessage = 'Unknown error';
        
        while (attempts < maxAttempts) {
          attempts++;
          
          try {
            const result = await supabaseClient
              .rpc('add_credits', {
                p_clerk_id: userId,
                p_credits: creditsToAdd
              });
            
            const data = result.data;
            const rpcError = result.error;
            
            if (!rpcError && data && data.length > 0) {
              // Process the result inside the loop
              const { success, new_balance, error_message } = data[0];
              
              if (success) {
                console.log(`Successfully added ${creditsToAdd} credits. New balance: ${new_balance}`);
                // Success - exit the retry loop and the entire switch case
                return NextResponse.json({ received: true });
              } else {
                console.error(`RPC attempt ${attempts} returned success=false:`, error_message);
                // Store this error message as it's likely the most useful one
                lastErrorMessage = error_message || 'Failed to add credits (RPC returned success=false)';
                // This is a logical failure (not a connection error), so we should retry
              }
            } else {
              if (!data || data.length === 0) {
                console.error(`RPC attempt ${attempts} returned empty data`);
                lastErrorMessage = 'Empty response from server';
              } else {
                console.error(`RPC attempt ${attempts} returned error:`, rpcError);
                lastErrorMessage = rpcError?.message || 'Database error occurred';
              }
            }
          } catch (error) {
            console.error(`RPC attempt ${attempts} threw an exception:`, error);
            lastErrorMessage = error instanceof Error ? error.message : 'Exception during RPC call';
          }
          
          if (attempts < maxAttempts) {
            // Exponential backoff: 500ms, 1000ms, 2000ms, etc.
            const backoffTime = 500 * Math.pow(2, attempts - 1);
            console.log(`Retrying in ${backoffTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          }
        }

        // If we got here, all attempts failed
        console.error(`Failed to add credits after ${maxAttempts} attempts: ${lastErrorMessage}`);
        return NextResponse.json({ 
          error: `Error adding credits: ${lastErrorMessage}` 
        }, { status: 500 });
      }
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      const stripeId = subscription.customer as string;
      
      const { error } = await supabaseClient
        .from('happyface_users')
        .update({ 
          has_subscription: false,
          subscription_status: 'cancelled'
        })
        .eq('stripe_id', stripeId);

      if (error) {
        console.error('Error updating subscription status:', error);
        return NextResponse.json({ error: 'Error updating subscription: ' + error.message }, { status: 500 });
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
} 