import { NextResponse } from 'next/server';
import { fetchLatestNews } from '@/lib/news-service';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const news = await fetchLatestNews();
        return NextResponse.json({ news });
    } catch (error) {
        return NextResponse.json({ news: [], error: error.message }, { status: 500 });
    }
}
