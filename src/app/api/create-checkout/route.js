import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_key');

export async function POST(request) {
    try {
        const { priceId, userId, email } = await request.json();

        if (!priceId || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: email,
            metadata: {
                userId,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (error) {
        console.error('Stripe error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
