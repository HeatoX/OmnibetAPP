
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    try {
        const response = await fetch(targetUrl);
        if (!response.ok) {
            return NextResponse.json({ error: 'Fetch failed' }, { status: response.status });
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
