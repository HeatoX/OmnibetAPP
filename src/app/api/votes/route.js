import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for server-side
);

/**
 * GET /api/votes?matchId=xxx
 * Get vote counts for a specific match
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const matchId = searchParams.get('matchId');

        if (!matchId) {
            return NextResponse.json({ error: 'matchId required' }, { status: 400 });
        }

        // Get aggregated votes
        const { data, error } = await supabase
            .from('prediction_votes')
            .select('vote')
            .eq('match_id', matchId);

        if (error) throw error;

        const votes = data.reduce((acc, row) => {
            if (row.vote === 'agree') acc.agree++;
            if (row.vote === 'disagree') acc.disagree++;
            return acc;
        }, { agree: 0, disagree: 0 });

        return NextResponse.json({ matchId, votes });

    } catch (error) {
        console.error('Error fetching votes:', error);
        return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
    }
}

/**
 * POST /api/votes
 * Submit or update a vote (requires authentication)
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { matchId, vote, userId } = body;

        if (!matchId || !vote || !userId) {
            return NextResponse.json(
                { error: 'matchId, vote, and userId required' },
                { status: 400 }
            );
        }

        if (!['agree', 'disagree'].includes(vote)) {
            return NextResponse.json(
                { error: 'vote must be "agree" or "disagree"' },
                { status: 400 }
            );
        }

        // Upsert vote (update if exists, insert if not)
        const { data, error } = await supabase
            .from('prediction_votes')
            .upsert({
                user_id: userId,
                match_id: matchId,
                vote,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,match_id'
            });

        if (error) throw error;

        // Return updated counts
        const { data: votesData } = await supabase
            .from('prediction_votes')
            .select('vote')
            .eq('match_id', matchId);

        const votes = (votesData || []).reduce((acc, row) => {
            if (row.vote === 'agree') acc.agree++;
            if (row.vote === 'disagree') acc.disagree++;
            return acc;
        }, { agree: 0, disagree: 0 });

        return NextResponse.json({ success: true, votes });

    } catch (error) {
        console.error('Error submitting vote:', error);
        return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
    }
}
