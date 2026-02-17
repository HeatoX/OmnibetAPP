import { NextResponse } from 'next/server';
import { getRealMatches } from '../../../../lib/real-data-service.js';

export const dynamic = 'force-dynamic'; // Prevent caching
export const maxDuration = 60; // Allow 60 seconds (Vercel max for Hobby)

export async function GET(request) {
    try {
        console.log("⏰ Daily Analysis Cron Job Started...");

        // 1. Fetch valid upcoming matches
        // We might want to filter only for TODAY or TOMORROW to save resources
        const data = await getRealMatches('soccer'); // Default to soccer for now
        const upcoming = data.matches.filter(m => m.status === 'upcoming');

        console.log(`🔍 Found ${upcoming.length} upcoming matches.`);

        if (upcoming.length === 0) {
            return NextResponse.json({ message: "No upcoming matches to analyze." });
        }

        // 2. The 'getRealMatches' function NOW ALREADY CALLS THE ORCHESTRATOR internally
        // because we updated real-data-service.js to do so during transformation.
        // So simply fetching them triggers the analysis!

        // However, to ensure they are "saved" or "processed", we might want to log them or store them.
        // Since getRealMatches caches to redundancy DB, this effectively refreshes the cache with fresh predictions.

        const results = upcoming.map(m => ({
            match: `${m.home.name} vs ${m.away.name}`,
            prediction: m.prediction.text,
            score: m.prediction.exactScore,
            confidence: m.prediction.confidence
        }));

        console.log("✅ Daily Analysis Complete. Cache refreshed.");

        return NextResponse.json({
            success: true,
            analyzedCount: upcoming.length,
            results: results
        });

    } catch (error) {
        console.error("❌ Daily Analysis Failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
