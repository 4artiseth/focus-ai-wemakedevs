import 'dotenv/config';
import { runSimulation } from './src/lib/simulation/engine';
import { prisma } from './src/lib/prisma';

async function debug() {
    try {
        console.log("Fetching project...");
        const project = await prisma.project.findFirst({
            include: { personas: true }
        });

        if (!project || project.personas.length === 0) {
            console.error("No project or personas found.");
            return;
        }

        console.log(`Starting simulation for ${project.name}...`);
        const session = await runSimulation(project.id);

        console.log("\n--- Simulation Results ---");
        const responses = await prisma.response.findMany({
            where: { sessionId: session.id },
            include: { persona: true },
            take: 3 // Just check the first few
        });

        for (const r of responses) {
            console.log(`\nPersona: ${r.persona.name}`);
            console.log(`Question: ${r.question}`);
            console.log(`INNER MONOLOGUE: ${r.reasoning}`);
            console.log(`ANSWER: ${r.answer}`);
        }

    } catch (error) {
        console.error("DEBUG ERROR:", error);
    } finally {
        await prisma.$disconnect();
    }
}

debug();
