import { NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role for admin updates
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    try {
        const { orderID, userId, tierId } = await request.json();

        if (!orderID || !userId || !tierId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Capture payment from PayPal
        const captureData = await capturePayPalOrder(orderID);

        if (captureData.status === 'COMPLETED') {
            // 2. Update user tier in Supabase
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    subscription_tier: tierId,
                    last_payment_date: new Date().toISOString(),
                    subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    last_payment_id: orderID
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            return NextResponse.json({
                success: true,
                data,
                message: `Plan ${tierId.toUpperCase()} activado correctamente`
            });
        } else {
            return NextResponse.json({
                error: 'Payment not completed',
                details: captureData
            }, { status: 400 });
        }
    } catch (error) {
        console.error('PayPal Capture Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
