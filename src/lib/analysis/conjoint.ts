import { z } from 'zod';
import { SYSTEM_PROMPTS } from '@/lib/llm/prompts';

export interface ConjointAttribute {
    name: string;
    levels: string[];
}

export interface ConjointProfile {
    id: string;
    attributes: Record<string, string>;
}

export interface ConjointTask {
    id: string;
    options: ConjointProfile[]; // Usually 3 options
}

export interface ConjointResponse {
    personaId: string;
    taskId: string;
    choiceId: string; // ID of the selected profile, or "NONE"
}

// Zod schema for LLM response validation
const ConjointResponseSchema = z.object({
    choice: z.string(),
    reasoning: z.string().optional()
});

/**
 * Generates a balanced set of Choice Tasks (CBC).
 * Uses a "Balanced Overlap" strategy:
 * 1. Level Balance: Each level appears roughly equally across all tasks.
 * 2. Minimal Overlap: Levels within a task are distinct (no "Basic" vs "Basic" for the same attribute).
 */
export function generateChoiceTasks(attributes: ConjointAttribute[], numTasks: number = 8): ConjointTask[] {
    const tasks: ConjointTask[] = [];
    const profilesPerTask = 3;

    // Track usage of each level to ensure balance
    const levelUsage: Record<string, Record<string, number>> = {};
    attributes.forEach(attr => {
        levelUsage[attr.name] = {};
        attr.levels.forEach(lvl => levelUsage[attr.name][lvl] = 0);
    });

    for (let t = 0; t < numTasks; t++) {
        const options: ConjointProfile[] = [];

        // For each profile in the task
        for (let o = 0; o < profilesPerTask; o++) {
            const profile: ConjointProfile = {
                id: `task_${t + 1}_option_${o + 1}`,
                attributes: {}
            };

            // For each attribute, pick a level
            attributes.forEach(attr => {
                // Strategy: Pick the level that has been used the LEAST so far
                // To add randomness, pick from the bottom N least used, or just shuffle the least used.

                // 1. Get current usage for this attribute
                const usage = levelUsage[attr.name];

                // 2. Filter out levels already used IN THIS TASK (Minimal Overlap)
                const usedInTask = options.map(opt => opt.attributes[attr.name]);
                const availableLevels = attr.levels.filter(l => !usedInTask.includes(l));

                // If we ran out of unique levels (e.g. 3 options but only 2 levels), we must reuse.
                // But ideally we prefer unique.
                const candidates = availableLevels.length > 0 ? availableLevels : attr.levels;

                // 3. Sort candidates by global usage (ascending)
                candidates.sort((a, b) => usage[a] - usage[b]);

                // 4. Pick one of the least used (random tie-break)
                // Find all with same min usage
                const minVal = usage[candidates[0]];
                const bestCandidates = candidates.filter(c => usage[c] === minVal);
                const selected = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];

                // 5. Assign and Increment
                profile.attributes[attr.name] = selected;
                levelUsage[attr.name][selected]++;
            });

            options.push(profile);
        }

        tasks.push({
            id: `task_${t + 1}`,
            options
        });
    }

    return tasks;
}

/**
 * Calculates Part-Worth Utilities using a simplified Logit-like approach.
 * Instead of raw probability, we use "Zero-Centered Diff Scores" which are more standard for relative importance.
 */
export function calculatePartWorths(responses: ConjointResponse[], tasks: ConjointTask[], attributes: ConjointAttribute[]) {
    // 1. Count Wins and Exposures
    const levelCounts: Record<string, Record<string, number>> = {}; // Shown
    const levelWins: Record<string, Record<string, number>> = {};   // Chosen

    attributes.forEach(attr => {
        levelCounts[attr.name] = {};
        levelWins[attr.name] = {};
        attr.levels.forEach(lvl => {
            levelCounts[attr.name][lvl] = 0;
            levelWins[attr.name][lvl] = 0;
        });
    });

    responses.forEach(r => {
        const task = tasks.find(t => t.id === r.taskId);
        if (!task) return;

        // Record Exposures
        task.options.forEach(opt => {
            Object.entries(opt.attributes).forEach(([attr, lvl]) => {
                if (levelCounts[attr]) levelCounts[attr][lvl]++;
            });
        });

        // Record Win
        if (r.choiceId !== 'NONE') {
            const chosen = task.options.find(o => o.id === r.choiceId);
            if (chosen) {
                Object.entries(chosen.attributes).forEach(([attr, lvl]) => {
                    if (levelWins[attr]) levelWins[attr][lvl]++;
                });
            }
        }
    });

    // 2. Calculate Raw Utilities (Win Rate)
    const rawUtilities: Record<string, Record<string, number>> = {};
    attributes.forEach(attr => {
        rawUtilities[attr.name] = {};
        attr.levels.forEach(lvl => {
            const shown = levelCounts[attr.name][lvl];
            const wins = levelWins[attr.name][lvl];
            // Laplace smoothing to avoid 0/0 or 100% issues with small samples
            rawUtilities[attr.name][lvl] = (wins + 0.5) / (shown + 1.0);
        });
    });

    // 3. Zero-Center Utilities (Standard Conjoint Practice)
    // The average utility for an attribute should be 0.
    const finalUtilities: Record<string, Record<string, number>> = {};
    const attributeRanges: Record<string, number> = {};

    attributes.forEach(attr => {
        finalUtilities[attr.name] = {};
        const utils = Object.values(rawUtilities[attr.name]);
        const avgUtil = utils.reduce((a, b) => a + b, 0) / utils.length;

        let minU = Infinity;
        let maxU = -Infinity;

        attr.levels.forEach(lvl => {
            const centered = rawUtilities[attr.name][lvl] - avgUtil;
            finalUtilities[attr.name][lvl] = centered; // This is the "Part Worth"

            if (centered < minU) minU = centered;
            if (centered > maxU) maxU = centered;
        });

        attributeRanges[attr.name] = maxU - minU;
    });

    // 4. Calculate Relative Importance
    // Importance = Range / Sum(Ranges)
    const totalRange = Object.values(attributeRanges).reduce((a, b) => a + b, 0);
    const attributeImportance: Record<string, number> = {};

    attributes.forEach(attr => {
        attributeImportance[attr.name] = totalRange > 0
            ? (attributeRanges[attr.name] / totalRange) * 100
            : 0;
    });

    return {
        attributeImportance,
        levelUtilities: finalUtilities
    };
}

/**
 * Run Choice-Based Conjoint (CBC) analysis
 */
export async function analyzeConjoint(
    personas: any[],
    productName: string,
    attributes: ConjointAttribute[],
    getPersonaResponseFn: (personaId: string, question: string, context: string) => Promise<{ answer: string; reasoning: string }>
): Promise<{ responses: ConjointResponse[]; profiles: ConjointProfile[] }> {

    // Generate ONE set of balanced tasks for the whole group? 
    // OR generate unique tasks per user?
    // Standard practice: A "Design Block" is often repeated or we use a large design split across users.
    // For simplicity and "Group" aggregation, we'll use ONE robust design for everyone, 
    // or generate a fresh balanced design for each user (Randomized Block).
    // Let's do a fresh balanced design for each user to maximize coverage of the total space.

    const responses: ConjointResponse[] = [];
    const allProfilesMap = new Map<string, ConjointProfile>();

    // We'll use a concurrency limit here if personas are many, but engine handles that usually.
    // Actually engine calls this once. We should loop.

    for (const persona of personas) {
        // Generate a balanced set SPECIFIC to this user (Randomized Design)
        const tasks = generateChoiceTasks(attributes, 8);

        // Store profiles for reference
        tasks.forEach(t => t.options.forEach(p => allProfilesMap.set(p.id, p)));

        for (const task of tasks) {
            try {
                const optionsText = task.options.map((opt, idx) => {
                    const attrStr = Object.entries(opt.attributes)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ');
                    return `Option ${idx + 1} (ID: ${opt.id}): [ ${attrStr} ]`;
                }).join('\n');

                const prompt = `
You are participating in a Choice-Based Conjoint (CBC) exercise for ${productName}.
Please review the following 3 options and choose the one you would be MOST likely to purchase.
Compare the features carefully.
If none are acceptable, you may choose "NONE".

${optionsText}

Respond with valid JSON only:
{
  "choice": "ID_OF_CHOSEN_OPTION" or "NONE",
  "reasoning": "Brief explanation of why you chose this over others."
}
`;
                const { answer } = await getPersonaResponseFn(persona.id, "Which option do you prefer?", prompt);

                let parsed: any;
                try {
                    parsed = JSON.parse(answer);
                } catch (e) {
                    console.warn(`Invalid JSON from persona ${persona.id} in CBC:`, answer);
                    continue;
                }

                const validation = ConjointResponseSchema.safeParse(parsed);
                if (validation.success) {
                    const choice = validation.data.choice;
                    // Loose matching for ID (sometimes LLM adds spaces)
                    const validId = task.options.find(o => o.id === choice.trim())?.id || (choice.includes('NONE') ? 'NONE' : null);

                    if (validId) {
                        responses.push({
                            personaId: persona.id,
                            taskId: task.id,
                            choiceId: validId
                        });
                    } else {
                        console.warn(`Persona ${persona.id} chose invalid ID: ${choice}`);
                    }
                }

            } catch (error) {
                console.error(`CBC Task failed for persona ${persona.id}:`, error);
            }
        }
    }

    return {
        responses,
        profiles: Array.from(allProfilesMap.values())
    };
}


