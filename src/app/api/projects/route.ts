import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Helper to sanitize input (strip HTML and potential control characters)
const sanitize = (str: string) => {
    if (!str) return str;
    return str
        .replace(/<[^>]*>?/gm, '') // Strip HTML
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Strip control characters
        .trim();
};

// Re-using the schema logic (simplified for API)
const createProjectSchema = z.object({
    name: z.string().transform(sanitize),
    description: z.string().transform(sanitize),
    category: z.string().transform(sanitize),
    audience: z.string().transform(sanitize),
    researchGoal: z.string().transform(sanitize),
    panelSize: z.number(),
    problem: z.string().optional().transform(val => val ? sanitize(val) : val),

    // Details
    priceExpected: z.number().optional(),
    priceMin: z.number().optional(),
    priceMax: z.number().optional(),
    pricingModel: z.string().optional().transform(val => val ? sanitize(val) : val),
    customQuestions: z.string().optional().transform(val => val ? sanitize(val) : val),
    featuresCore: z.string().optional().transform(val => val ? sanitize(val) : val),
    featuresPremium: z.string().optional().transform(val => val ? sanitize(val) : val),
    featuresFuture: z.string().optional().transform(val => val ? sanitize(val) : val),
    conjointFeatures: z.string().optional().transform(val => val ? sanitize(val) : val),
    competitors: z.string().optional().transform(val => val ? sanitize(val) : val),
    personaConstraints: z.string().optional().transform(val => val ? sanitize(val) : val),

    // Settings
    toneFormality: z.number(),
    toneSkepticism: z.number(),
    analysisDepth: z.string().transform(sanitize),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = createProjectSchema.parse(body);

        const project = await prisma.project.create({
            data: {
                name: data.name,
                description: data.description,
                category: data.category,
                audience: data.audience,
                researchGoal: data.researchGoal,
                panelSize: data.panelSize,

                details: {
                    create: {
                        problem: data.problem,
                        priceExpected: data.priceExpected,
                        priceMin: data.priceMin,
                        priceMax: data.priceMax,
                        pricingModel: data.pricingModel,
                        customQuestions: data.customQuestions,
                        coreFeatures: data.featuresCore,
                        premiumFeatures: data.featuresPremium,
                        futureFeatures: data.featuresFuture,
                        conjointFeatures: data.conjointFeatures,
                        competitors: data.competitors,
                        personaConstraints: data.personaConstraints,
                        toneFormality: data.toneFormality,
                        toneSkepticism: data.toneSkepticism,
                        analysisDepth: data.analysisDepth,
                    }
                }
            }
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error("Project creation failed:", error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
