import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const agentId = process.env.NEXT_PUBLIC_AGENT_ID;
        const apiKey = process.env.ELEVENLABS_API_KEY;

        console.log('[API] Agent ID:', agentId ? 'Present' : 'Missing');
        console.log('[API] API Key:', apiKey ? 'Present' : 'Missing');

        if (!agentId || !apiKey) {
            console.error('[API] Configuration missing');
            return NextResponse.json(
                { error: 'Missing configuration' },
                { status: 500 }
            );
        }

        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
            {
                headers: {
                    'xi-api-key': apiKey,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[API] ElevenLabs Error:', response.status, errorText);
            throw new Error(`ElevenLabs API failed with status ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json({ signedUrl: data.signed_url });
    } catch (error: any) {
        console.error("Failed to generate signed URL:", error);
        return NextResponse.json(
            { error: 'Failed to generate signed URL', details: error.message },
            { status: 500 }
        );
    }
}
