import { NextResponse } from 'next/server';
export async function POST() {
    return NextResponse.json({ message: "Stripe Webhook is disabled. Migrated to PayPal." });
}
