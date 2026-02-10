import { NextResponse } from 'next/server';
import { getRecentPredictions } from '@/lib/history-tracker';

export const dynamic = 'force-dynamic';

/**
 * PUBLIC API: Get History
 * Returns recent prediction records from DB.
 * URL: /api/history?limit=50
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        const predictions = await getRecentPredictions(limit);

        return NextResponse.json(predictions);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
