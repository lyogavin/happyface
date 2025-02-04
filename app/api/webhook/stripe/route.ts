import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClerkClient } from '@clerk/backend';
import { createClient } from '@supabase/supabase-js';

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
  } catch (err: any) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.client_reference_id) {
        const stripeId = session.customer as string;
        const userId = session.client_reference_id;

        // Update user in Clerk
        await clerkClient.users.updateUser(userId, {
          privateMetadata: { stripe_id: stripeId },
          publicMetadata: { stripe_email: session.customer_email },
        });

        // Update user in Supabase
        const { error } = await supabaseClient
          .from('happyface_users')
          .upsert({
            clerk_id: userId,
            stripe_id: stripeId,
            stripe_email: session.customer_email,
            has_access: true,
          }, { onConflict: 'clerk_id' });

        if (error) {
          console.error('Error updating user:', error);
          return NextResponse.json({ error: 'Error updating user: ' + error.message }, { status: 500 });
        }
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