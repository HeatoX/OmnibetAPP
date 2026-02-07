import { NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';

export async function POST(request) {
    try {
        const { tierId, amount } = await request.json();

        if (!tierId || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const order = await createPayPalOrder(tierId, amount);

        return NextResponse.json(order);
    } catch (error) {
        console.error('PayPal Order Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
