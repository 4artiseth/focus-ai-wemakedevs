import { NextResponse } from 'next/server';
import { generatePersonas } from '@/lib/llm/orchestrator';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

        // Delete existing personas if any (for regeneration)
        const existingCount = await prisma.persona.count({ where: { projectId: id } });
        if (existingCount > 0) {
            console.log(`Deleting ${existingCount} existing personas for regeneration...`);
            await prisma.persona.deleteMany({ where: { projectId: id } });
        }

        // Generate new personas
        const personas = await generatePersonas(id, project.panelSize);

        return NextResponse.json({ personas, regenerated: existingCount > 0 });
    } catch (error: any) {
        console.error("Persona generation failed:", error);
        return NextResponse.json({
            error: error.message || "Failed to generate personas",
            details: error.toString()
        }, { status: 500 });
    }
}
