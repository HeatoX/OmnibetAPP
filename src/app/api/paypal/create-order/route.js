import { NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';

export async function POST(request) {
    try {
        const { tierId, amount } = await request.json();

        if (!tierId || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const order = await createPayPalOrder(tierId, amount);

        if (!order.id) {
            console.error('[PayPal API] Order creation failed:', order);
            return NextResponse.json({
                error: 'PayPal rejected order creation',
                details: order
            }, { status: 400 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('[PayPal Backend] Exception:', error);
        return NextResponse.json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
