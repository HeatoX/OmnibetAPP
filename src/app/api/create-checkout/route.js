import { NextResponse } from 'next/server';
export async function POST() {
    return NextResponse.json({ error: "Stripe Checkout is disabled. Use /api/paypal/create-order" }, { status: 410 });
}
