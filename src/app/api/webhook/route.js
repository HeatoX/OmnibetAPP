import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_key');
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Webhook secret from Stripe Dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_secret';

export async function POST(request) {
    const payload = await request.text();
    const sig = request.headers.get('stripe-signature');

    let event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const userId = session.metadata?.userId;
            const priceId = session.line_items?.data?.[0]?.price?.id;

            if (userId) {
                // Determine tier based on priceId
                let tier = 'gold';
                if (priceId?.includes('diamond')) {
                    tier = 'diamond';
                }

                // Calculate subscription end date (1 month from now)
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 1);

                // Update user subscription in Supabase
                await supabase
                    .from('users')
                    .update({
                        subscription_tier: tier,
                        subscription_end: endDate.toISOString(),
                        stripe_customer_id: session.customer,
                        stripe_subscription_id: session.subscription,
                    })
                    .eq('id', userId);

                console.log(`User ${userId} subscribed to ${tier}`);
            }
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object;
            const customerId = subscription.customer;

            // Update subscription status
            if (subscription.status === 'active') {
                const endDate = new Date(subscription.current_period_end * 1000);

                await supabase
                    .from('users')
                    .update({
                        subscription_end: endDate.toISOString(),
                    })
                    .eq('stripe_customer_id', customerId);
            }
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const customerId = subscription.customer;

            // Downgrade to free
            await supabase
                .from('users')
                .update({
                    subscription_tier: 'free',
                    subscription_end: null,
                })
                .eq('stripe_customer_id', customerId);

            console.log(`Customer ${customerId} subscription cancelled`);
            break;
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object;
            console.log(`Payment failed for customer ${invoice.customer}`);
            // Could send email notification here
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
