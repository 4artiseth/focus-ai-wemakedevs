import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function check() {
    try {
        const count = await prisma.response.count({
            where: { reasoning: { not: null } }
        });
        console.log(`Responses with reasoning: ${count}`);

        if (count > 0) {
            const response = await prisma.response.findFirst({
                where: { reasoning: { not: null } },
                include: { persona: true }
            });
            console.log("\n--- Sample Response ---");
            console.log(`Persona: ${response?.persona.name}`);
            console.log(`Reasoning: ${response?.reasoning}`);
            console.log(`Answer: ${response?.answer}`);
        }
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
