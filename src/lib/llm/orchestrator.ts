import { z } from 'zod';
import { SYSTEM_PROMPTS } from './prompts';
import { prisma } from '../prisma';
import { callLLM } from './api-client';
import { pMap } from '../utils';
import { FAST_LLM_CONFIG } from './config';

// --- BEHAVIORAL CONSTANTS ---

const COMMUNICATION_PROFILES = {
    "articulate": {
        weight: 0.15,
        instructions: `
- **SENTENCE LENGTH**: Long, complex sentences (20+ words).
- **MANDATORY VOCABULARY**: Use at least 2 of these: "nuance", "perspective", "framework", "efficacy", "paradigm", "context".
- **FORBIDDEN**: Slang, abbreviations, short sentences.
- **TONE**: Academic, precise, slightly arrogant.
`
    },
    "average": {
        weight: 0.50,
        instructions: `
- **SENTENCE LENGTH**: Medium (10-15 words).
- **VOCABULARY**: Everyday conversational English.
- **FILLERS**: Use "I think", "maybe", "kind of", "you know".
- **TONE**: Casual, friendly, normal.
`
    },
    "brief": {
        weight: 0.25,
        instructions: `
- **SENTENCE LENGTH**: VERY SHORT (3-8 words).
- **VOCABULARY**: Simple, direct. No big words.
- **STYLE**: Blunt. Do not explain yourself unless asked.
- **EXAMPLE**: "It's too expensive." (NOT "I feel that the price point is a bit high.")
`
    },
    "rambling": {
        weight: 0.10,
        instructions: `
- **SENTENCE LENGTH**: Run-on sentences with no clear end.
- **BEHAVIOR**: Go off-topic. Tell a small irrelevant story.
- **FILLERS**: "I mean...", "Like...", "Basically...", "To be honest..."
- **TONE**: Unfocused, chatty.
`
    }
};

const AGE_PATTERNS = {
    "18-25": `
- **MANDATORY SLANG**: Use at least 1: "vibe", "honestly", "lowkey", "cringe", "literally".
- **BANNED WORDS**: "Cognitive", "Reframing", "Agency", "Nuance", "Perspective". (You are 21, not a professor).
- **STYLE**: Casual, lowercase energy.
- **CONCERNS**: "Is it cool?", "Is it cheap?"
- **AVOID**: Formal grammar.
`,
    "26-40": `
- **VOCABULARY**: "bandwidth", "value", "efficient", "stress", "work".
- **STYLE**: Busy professional. Direct but polite.
- **CONCERNS**: "Does this save time?", "Is it worth the money?"
`,
    "41-55": `
- **VOCABULARY**: "quality", "reliable", "family", "sensible".
- **STYLE**: Grounded, skeptical of hype.
- **CONCERNS**: Long-term value, safety.
`,
    "55+": `
- **PHRASES**: "In my day...", "These days...", "Proper...", "I don't understand...".
- **BANNED WORDS**: "Tech stack", "Interface", "User experience", "Algorithm".
- **STYLE**: Formal, polite, slightly confused by tech.
- **CONCERNS**: Privacy, simplicity, "not being scammed".
`
};

function getAgePattern(age: number): string {
    if (age <= 25) return AGE_PATTERNS["18-25"];
    if (age <= 40) return AGE_PATTERNS["26-40"];
    if (age <= 55) return AGE_PATTERNS["41-55"];
    return AGE_PATTERNS["55+"];
}

function assignCommunicationStyle(): string {
    const rand = Math.random();
    let cumulative = 0;
    for (const [style, profile] of Object.entries(COMMUNICATION_PROFILES)) {
        cumulative += profile.weight;
        if (rand < cumulative) return style;
    }
    return "average";
}

// Schema for Persona Generation (Reference only, manual parsing used)
const PersonaSchema = z.object({
    personas: z.array(z.object({
        name: z.string(),
        age: z.number(),
        occupation: z.string(),
        income: z.string(),
        location: z.string(),
        bio: z.string(),
        traits: z.string(),
    }))
});

export async function generatePersonas(projectId: string, count: number = 8) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { details: true }
    });

    if (!project) throw new Error("Project not found");

    console.log(`Starting slot-based persona generation for ${count} personas...`);

    // Import slot generation functions
    const { generatePersonaSlots, checkForDuplicates, validateDiversity } = await import('./persona-slots');

    // Step 1: Pre-define persona slots WITH DEMOGRAPHICS & AUDIENCE
    let slots = generatePersonaSlots(count, project.demographics || undefined, project.audience);
    console.log(`Generated ${slots.length} persona slots for target: ${project.demographics || project.audience || 'all ages'}`);

    let allSavedPersonas: any[] = [];
    let diversityScore: any;
    let generationAttempts = 0;
    const MAX_GENERATION_RETRIES = 1; // User requested max 2 tries total (Initial + 1 Retry)
    const MAX_RETRIES_PER_SLOT = 3;

    // Shared state for duplicate detection across parallel slots
    const reservedNames = new Set<string>();

    // Load existing personas if any (unless we just wiped them)
    if (generationAttempts === 0) {
        const existing = await prisma.persona.findMany({
            where: { projectId },
            select: { name: true }
        });
        existing.forEach(p => reservedNames.add(p.name.toLowerCase()));
    }

    // Step 1.5: Pre-generate UNIQUE names to prevent race conditions
    console.time('NamePreGeneration');
    const neededNames = count;
    const existingNamesArray = Array.from(reservedNames);

    let assignedNames: string[] = [];
    try {
        const namePrompt = `
Generate ${neededNames} UNIQUE, realistic full names for a market research panel.
Target Audience: ${project.audience}
Existing Names (DO NOT USE): ${existingNamesArray.join(', ')}

Rules:
1. Return a JSON array of strings: ["Name 1", "Name 2", ...]
2. Ensure high diversity in ethnicity and gender based on the audience.
3. NO duplicates within the list or with existing names.
4. Names must be VISUALLY and PHONETICALLY distinct (avoid "John S." vs "John D." or "Sarah" vs "Sara").
`;
        // Use FAST_LLM_CONFIG.model for speed
        const nameResponse = await callLLM([
            { role: 'system', content: "You are a name generator. Return ONLY a JSON array of strings." },
            { role: 'user', content: namePrompt }
        ], true, FAST_LLM_CONFIG.model);

        const cleanJson = nameResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        assignedNames = JSON.parse(cleanJson);

        if (!Array.isArray(assignedNames) || assignedNames.length < neededNames) {
            throw new Error("Failed to generate enough names");
        }
        console.log(`✓ Pre-generated ${assignedNames.length} unique names`);
    } catch (e) {
        console.warn("Name pre-generation failed, falling back to on-the-fly generation", e);
        assignedNames = [];
    }
    console.timeEnd('NamePreGeneration');

    console.time('TotalGenerationTime');

    do {
        console.time(`GenerationAttempt_${generationAttempts + 1}`);
        generationAttempts++;
        if (generationAttempts > 1) {
            console.log(`\n[Retry ${generationAttempts - 1}/${MAX_GENERATION_RETRIES}] Regenerating personas due to low diversity score...`);
            await prisma.persona.deleteMany({ where: { projectId } });
            allSavedPersonas = [];
            reservedNames.clear();

            // RE-GENERATE SLOTS to ensure structural diversity
            console.log("Re-shuffling persona slots for better diversity...");
            slots = generatePersonaSlots(count, project.demographics || undefined, project.audience);
        }

        // Step 2: Generate personas in PARALLEL
        // Concurrency: 20 (Safe limit for rate limiting)
        console.time('ParallelExecution');
        await pMap(slots, async (slot, i) => {
            let personaSaved = false;
            let attempts = 0;

            while (!personaSaved && attempts < MAX_RETRIES_PER_SLOT) {
                attempts++;

                try {
                    // Build existing personas summary for duplicate prevention
                    const existingNamesList = Array.from(reservedNames).join(', ');

                    // Add random entropy to force diversity
                    const entropy = Math.random().toString(36).substring(7);

                    // Use pre-assigned name if available, otherwise generate on fly
                    const assignedName = assignedNames[i];
                    const nameInstruction = assignedName
                        ? `USE THIS EXACT NAME: "${assignedName}"`
                        : `Generate a UNIQUE name (NOT in: ${existingNamesList})`;

                    // Create SPECIFIC prompt for this slot
                    const slotPrompt = `
Generate EXACTLY ONE persona with these MANDATORY requirements:

⚠️ CRITICAL VALIDATION ⚠️
**THE AGE MUST BE BETWEEN ${slot.ageMin} AND ${slot.ageMax} YEARS OLD**
This is a HARD CONSTRAINT derived from the target audience. 
If the user specified "aged 18-35", you MUST generate someone aged ${slot.ageMin}-${slot.ageMax}.
DO NOT generate ages outside this range under ANY circumstances.

MANDATORY ATTRIBUTES:
- Age: Must be between ${slot.ageMin} and ${slot.ageMax} years old
- Income Level: ${slot.incomeLevel} (${getIncomeDescription(slot.incomeLevel)})
- Experience Level: ${slot.experienceLevel}
- Attitude: ${slot.attitude}
- Tech Comfort: ${slot.techComfort}
- ROLE / ARCHETYPE: ${slot.role} (MUST align occupation with this role)
${nameInstruction}

Product Context:
- Product: ${project.name}
- Description: ${project.description}

TARGET AUDIENCE (MUST FIT THIS EXACTLY):
${project.audience}

CRITICAL EXCLUSIONS:
1. Are OUTSIDE the age range ${slot.ageMin}-${slot.ageMax}
2. Already have what the product offers
3. Are the OPPOSITE of the target audience description

ALREADY GENERATED / RESERVED NAMES (DO NOT USE):
${existingNamesList || 'None yet'}

STRICT RULES:
1. Age must be EXACT number within ${slot.ageMin}-${slot.ageMax}
2. Name must be UNIQUE and NOT in the list above.
3. Occupation must be DIFFERENT from existing and MATCH THE ASSIGNED ROLE (${slot.role}).
4. Bio must show this person FITS the target audience and NEEDS the product
5. Location must be specific city

RANDOM SEED: ${entropy}

Return ONLY valid JSON:
{
  "name": "${assignedName || 'string'}",
  "age": number (MUST be ${slot.ageMin}-${slot.ageMax}),
  "occupation": "string",
  "income": "string",
  "location": "string",
  "bio": "string",
  "traits": "string",
  "hidden_agenda": "string",
  "shopping_habits": "string",
  "experience_level": "${slot.experienceLevel}",
  "attitude": "${slot.attitude}",
  "motivation": "string",
  "tech_comfort": "${slot.techComfort}",
  "role": "${slot.role}",
  "life_values": "string",
  "communication_style": "string"
}
`;
                    const startLLM = Date.now();
                    const content = await callLLM([
                        { role: 'system', content: SYSTEM_PROMPTS.PERSONA_GENERATOR.replace('{count}', '1') },
                        { role: 'user', content: slotPrompt }
                    ], true);

                    let personaData: any;
                    try {
                        const parsed = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
                        personaData = parsed.personas ? parsed.personas[0] : parsed;
                    } catch (e) {
                        console.warn("Failed to parse persona JSON", e);
                        continue;
                    }

                    // --- CRITICAL VALIDATION: FORCE AGE CLAMP ---
                    // The LLM sometimes ignores age limits for "diversity". We must force it.
                    if (personaData.age < slot.ageMin || personaData.age > slot.ageMax) {
                        console.warn(`Age ${personaData.age} out of range ${slot.ageMin}-${slot.ageMax}, retrying...`);
                        continue;
                    }

                    // Thread-Safe Duplicate Check
                    const lowerName = personaData.name.toLowerCase();
                    if (reservedNames.has(lowerName)) {
                        console.warn(`Race condition duplicate detected: ${personaData.name}. Retrying...`);
                        // If we had an assigned name and it still collided (rare), we must retry without it
                        if (assignedName) {
                            console.warn("Assigned name collision! Falling back to random generation.");
                            assignedNames[i] = ""; // Clear assigned name for next attempt
                        }
                        continue;
                    }

                    // Similarity Check
                    const { isDuplicate, similarityScore } = checkForDuplicates(personaData, allSavedPersonas);
                    if (isDuplicate) {
                        console.warn(`Similarity duplicate detected (score: ${similarityScore}%), retrying...`);
                        continue;
                    }

                    // Reserve the name IMMEDIATELY
                    reservedNames.add(lowerName);

                    // Save to DB
                    const savedPersona = await prisma.persona.create({
                        data: {
                            projectId,
                            name: personaData.name,
                            age: personaData.age,
                            occupation: personaData.occupation,
                            income: personaData.income,
                            location: personaData.location,
                            bio: personaData.bio,
                            traits: JSON.stringify({
                                traits: personaData.traits,
                                hidden_agenda: personaData.hidden_agenda,
                                shopping_habits: personaData.shopping_habits,
                                experience_level: personaData.experience_level,
                                attitude: personaData.attitude,
                                motivation: personaData.motivation,
                                tech_comfort: personaData.tech_comfort,
                                role: personaData.role || slot.role,
                                life_values: personaData.life_values,
                                communication_style: assignCommunicationStyle() // Assign weighted style
                            })
                        }
                    });

                    allSavedPersonas.push(savedPersona);
                    personaSaved = true;

                } catch (error) {
                    console.error(`Attempt ${attempts} failed:`, error);
                }
            }
        }, 20);
        console.timeEnd('ParallelExecution');

        // Step 3: Validate overall diversity
        console.log('\n=== Validation Results ===');
        diversityScore = validateDiversity(allSavedPersonas);
        console.log(`Overall Diversity Score: ${diversityScore.overall.toFixed(2)}%`);
        console.log('Breakdown:');
        Object.entries(diversityScore).forEach(([key, value]) => {
            if (typeof value === 'number' && key !== 'overall') {
                // Format key: "ageDiversity" -> "Age Diversity"
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                console.log(`  ${label}: ${(value as number).toFixed(2)}%`);
            }
        });
        console.log(`PASS: ${diversityScore.pass ? 'YES ✓' : 'NO ✗'}`);

        if (!diversityScore.pass) {
            console.warn(`WARNING: Diversity score below 85% (Attempt ${generationAttempts}).`);
        }
        console.timeEnd(`GenerationAttempt_${generationAttempts}`);

    } while (!diversityScore.pass && generationAttempts <= MAX_GENERATION_RETRIES);

    console.timeEnd('TotalGenerationTime');

    if (!diversityScore.pass) {
        console.error("Failed to meet diversity requirements after max retries. Returning best effort.");
    }

    if (allSavedPersonas.length === 0) {
        throw new Error("Failed to generate any personas.");
    }

    return allSavedPersonas;
}

function getIncomeDescription(level: string): string {
    const descriptions: Record<string, string> = {
        'low': '$15k-$35k/year - Students, budget-conscious',
        'middle': '$35k-$80k/year - Core market',
        'high': '$80k+/year - Premium buyers'
    };
    return descriptions[level] || 'Middle income';
}

export async function getPersonaResponse(personaId: string, question: string, context: string, useSearch: boolean = false) {
    const persona = await prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) throw new Error("Persona not found");

    // Check if 'context' is actually a full system prompt override (used by Pricing/Conjoint)
    // Heuristic: If it contains "You are" and "JSON", it's likely a full prompt.
    const isPromptOverride = context.includes("You are") && context.includes("JSON");

    let systemPrompt = "";

    if (isPromptOverride) {
        systemPrompt = context;
    } else {
        let traits: any = {};
        try {
            traits = persona.traits ? JSON.parse(persona.traits) : {};
        } catch (e) {
            traits = { traits: persona.traits };
        }

        const commStyle = traits.communication_style || 'average';
        const commProfile = COMMUNICATION_PROFILES[commStyle as keyof typeof COMMUNICATION_PROFILES] || COMMUNICATION_PROFILES['average'];
        const agePattern = getAgePattern(persona.age);

        systemPrompt = SYSTEM_PROMPTS.FOCUS_GROUP_PARTICIPANT
            .replace('{name}', persona.name)
            .replace('{age}', persona.age.toString())
            .replace('{occupation}', persona.occupation)
            .replace('{location}', persona.location || 'Unknown')
            .replace('{bio}', persona.bio)
            .replace('{traits}', traits.traits || '')
            .replace('{hidden_agenda}', traits.hidden_agenda || 'None')
            .replace('{shopping_habits}', traits.shopping_habits || 'None')
            .replace('{life_values}', traits.life_values || 'None')
            .replace('{communication_style}', commStyle)
            .replace('{communication_instructions}', commProfile.instructions)
            .replace('{age_patterns}', agePattern)
            .replace('{experience_level}', traits.experience_level || 'Average')
            .replace('{attitude}', traits.attitude || 'Neutral')
            .replace('{motivation}', traits.motivation || 'Curiosity')
            .replace('{productName}', context);
    }

    const responseContent = await callLLM([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
    ], true, undefined, useSearch);

    const cleanText = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();

    // Attempt to parse JSON regardless of mode
    let parsed: any = null;
    try {
        // Find JSON object if embedded in text
        const jsonMatch = cleanText.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[1]);
        } else {
            parsed = JSON.parse(cleanText);
        }
    } catch (e) {
        // If parsing fails and it was NOT an override, we might want to warn.
        // But for override, it might just be text.
        if (!isPromptOverride) {
            console.warn("Failed to parse participant JSON, falling back to raw text");
        }
    }

    if (parsed) {
        return {
            answer: parsed.answer || cleanText,
            reasoning: parsed.reasoning || null,
            metadata: parsed // Return full object as metadata
        };
    }

    // Fallback for non-JSON responses
    return {
        answer: cleanText,
        reasoning: null,
        metadata: null
    };
}
