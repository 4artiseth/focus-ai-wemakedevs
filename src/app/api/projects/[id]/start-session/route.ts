import { NextResponse } from 'next/server';
import { createSession, runSimulation } from '@/lib/simulation/engine';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        // 1. Create Session immediately
        const session = await createSession(id);

        // 2. Run Simulation in background (fire and forget)
        // Note: In Vercel serverless, this might be killed if not using waitUntil, 
        // but for local dev and standard Node environments, this works.
        runSimulation(session.id).catch(e => {
            console.error(`[BACKGROUND] Simulation failed for session ${session.id}:`, e);
        });

        return NextResponse.json({ session });
    } catch (error) {
        console.error("Failed to start session:", error);
        return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
    }
}
