import { NextResponse } from 'next/server';
import { getRealMatches } from '@/lib/real-data-service';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("Starting Full Pipeline Debug Fetch...");
        const data = await getRealMatches();

        return NextResponse.json({
            count: data.matches?.length || 0,
            matches: data.matches?.slice(0, 5) || [],
            leagues: [...new Set(data.matches?.map(m => m.league))],
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error("Debug Route Failed:", error);
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
