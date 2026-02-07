import { NextResponse } from 'next/server';
import { getRealMatches } from '@/lib/real-data-service';
import { broadcastDiamondAlert } from '@/lib/telegram-service';

export const dynamic = 'force-dynamic'; // Always fetch fresh data

export async function GET() {
    try {
        console.log('API: Fetching matches via Proxy...');
        const data = await getRealMatches();

        const count = data.matches?.length || 0;
        console.log(`API Result: ${count} matches found. Source: ${data.source || 'unknown'}`);

        // V30: Telegram Alert Hook (Shadow-Broadcasting)
        // Solo enviamos alertas de partidos Diamond que no sean LIVE todavía
        const diamondPicks = data.matches?.filter(m => m.prediction?.confidence === 'diamond' && !m.isLive);
        if (diamondPicks && diamondPicks.length > 0) {
            // En un entorno real, aquí usaríamos una lista de Chat IDs de una DB
            // Por ahora, usamos un env var para pruebas o canal principal
            const mainChannelId = process.env.TELEGRAM_MAIN_CHANNEL;
            if (mainChannelId) {
                diamondPicks.forEach(pick => {
                    broadcastDiamondAlert(pick, [mainChannelId]).catch(e => console.error("Telegram Broadcast Error:", e));
                });
            }
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("API Proxy Error:", error);
        return NextResponse.json({ matches: [], lastUpdated: null, error: error.message }, { status: 500 });
    }
}
