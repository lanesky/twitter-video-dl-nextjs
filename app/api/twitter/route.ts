import { NextRequest, NextResponse } from 'next/server';
import { TwitterAPIClient } from '@/lib/twitter';

export async function POST(request: NextRequest) {
    try {
        const { tweetUrl } = await request.json();

        if (!tweetUrl) {
            return NextResponse.json(
                { error: 'Tweet URL is required' },
                { status: 400 }
            );
        }

        const client = new TwitterAPIClient();
        const variants = await client.getTweetDetails(tweetUrl);
        const bestVariant = client.getBestVideoVariant(variants);

        return NextResponse.json({ videoUrl: bestVariant.url });
    } catch (error: unknown) {
        console.error('Error processing tweet:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to process tweet' },
            { status: 500 }
        );
    }
}
