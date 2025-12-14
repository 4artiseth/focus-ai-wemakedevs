import 'dotenv/config';
import { generatePersonas } from './src/lib/llm/orchestrator';
import { prisma } from './src/lib/prisma';

async function debug() {
    try {
        console.log("Fetching first project...");
        const project = await prisma.project.findFirst();

        if (!project) {
            console.error("No projects found.");
            return;
        }

        console.log(`Found project: ${project.name}`);
        console.log("Generating personas with new intelligence...");

        const personas = await generatePersonas(project.id, 3);

        console.log("\n--- Generated Personas ---");
        for (const p of personas) {
            const traits = JSON.parse(p.traits as string);
            console.log(`\nName: ${p.name}`);
            console.log(`Role: ${p.occupation}`);
            console.log(`Hidden Agenda: ${traits.hidden_agenda}`);
            console.log(`Shopping Habits: ${traits.shopping_habits}`);
        }

    } catch (error) {
        console.error("DEBUG ERROR:", error);
    } finally {
        await prisma.$disconnect();
    }
}

debug();
