import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const personas = await prisma.persona.findMany({
            where: { projectId: id },
            // orderBy: { id: 'asc' } // Optional: sort by ID (CUID is roughly time-ordered)
        });
        return NextResponse.json({ personas });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch personas" }, { status: 500 });
    }
}
