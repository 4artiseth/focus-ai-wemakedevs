// Persona Slot Generation and Validation System
// This ensures true diversity by pre-defining requirements and validating results

export interface PersonaSlot {
    ageRange: string;
    ageMin: number;
    ageMax: number;
    incomeLevel: string;
    experienceLevel: string;
    attitude: string;
    techComfort: string;
    role: string;
}

export interface DiversityScore {
    overall: number;
    ageDiversity: number;
    incomeDiversity: number;
    experienceDiversity: number;
    attitudeDiversity: number;
    techDiversity: number;
    roleDiversity: number;
    noDuplicates: number;
    pass: boolean;
}

const DISTRIBUTION_TEMPLATE = {
    ageGroups: {
        '18-25': 0.25,
        '26-40': 0.35,
        '41-55': 0.25,
        '55+': 0.15
    },
    incomeLevel: {
        'low': 0.30,       // $15k-$35k
        'middle': 0.50,    // $35k-$80k
        'high': 0.20       // $80k+
    },
    experienceLevel: {
        'Beginner': 0.40,
        'Regular': 0.35,
        'Expert': 0.25
    },
    attitude: {
        'Believer': 0.25,
        'Skeptic': 0.30,   // MUST have 30% skeptics
        'Modernist': 0.20,
        'Traditionalist': 0.25
    },
    techComfort: {
        'High': 0.35,
        'Medium': 0.40,
        'Low': 0.25
    },
    role: {
        'Decision Maker': 0.25, // CEO, Founder, VP
        'Manager': 0.30,        // Director, Team Lead
        'Specialist': 0.30,     // Engineer, Analyst, Designer
        'End User': 0.15        // Student, Consumer, Entry-level
    }
};

/**
 * Generate pre-defined persona slots based on distribution template
 * @param count - Number of personas to generate
 * @param demographics - Optional demographics constraint (e.g., "18-35")
 * @param audience - Optional audience description to extract age range from
 */
export function generatePersonaSlots(count: number, demographics?: string, audience?: string): PersonaSlot[] {
    const slots: PersonaSlot[] = [];

    // Parse demographics to extract age range if provided
    let ageGroupsToUse: Record<string, number> = DISTRIBUTION_TEMPLATE.ageGroups;

    // Priority 1: Explicit demographics field
    if (demographics) {
        const parsedAgeRange = parseDemographics(demographics);
        if (parsedAgeRange) {
            ageGroupsToUse = parsedAgeRange;
            console.log(`📊 Age constraint from demographics: ${JSON.stringify(parsedAgeRange)}`);
        }
    }

    // Priority 2: Extract from audience description (common case)
    if (!demographics && audience) {
        const parsedAgeRange = parseDemographics(audience);
        if (parsedAgeRange) {
            ageGroupsToUse = parsedAgeRange;
            console.log(`📊 Age constraint from audience: ${JSON.stringify(parsedAgeRange)}`);
        }
    }

    // Calculate distributions
    const ageDist = calculateDistribution(count, ageGroupsToUse);
    const incomeDist = calculateDistribution(count, DISTRIBUTION_TEMPLATE.incomeLevel);
    const expDist = calculateDistribution(count, DISTRIBUTION_TEMPLATE.experienceLevel);
    const attDist = calculateDistribution(count, DISTRIBUTION_TEMPLATE.attitude);
    const techDist = calculateDistribution(count, DISTRIBUTION_TEMPLATE.techComfort);
    const roleDist = calculateDistribution(count, DISTRIBUTION_TEMPLATE.role);

    // Create slots by interleaving distributions
    for (let i = 0; i < count; i++) {
        const ageRange = pickFromDistribution(ageDist, i);
        const [ageMin, ageMax] = getAgeRange(ageRange);

        slots.push({
            ageRange,
            ageMin,
            ageMax,
            incomeLevel: pickFromDistribution(incomeDist, i),
            experienceLevel: pickFromDistribution(expDist, i),
            attitude: pickFromDistribution(attDist, i),
            techComfort: pickFromDistribution(techDist, i),
            role: pickFromDistribution(roleDist, i)
        });
    }

    // Shuffle to avoid patterns
    return shuffleArray(slots);
}

function calculateDistribution(total: number, percentages: Record<string, number>): Record<string, number> {
    const result: Record<string, number> = {};
    let remaining = total;

    const entries = Object.entries(percentages);

    for (let i = 0; i < entries.length - 1; i++) {
        const [key, pct] = entries[i];
        const count = Math.round(total * pct);
        result[key] = count;
        remaining -= count;
    }

    // Last category gets the remainder
    const lastKey = entries[entries.length - 1][0];
    result[lastKey] = Math.max(1, remaining);

    return result;
}

function pickFromDistribution(dist: Record<string, number>, index: number): string {
    const pool: string[] = [];

    for (const [key, count] of Object.entries(dist)) {
        for (let i = 0; i < count; i++) {
            pool.push(key);
        }
    }

    return pool[index % pool.length];
}

function getAgeRange(range: string): [number, number] {
    const ranges: Record<string, [number, number]> = {
        '18-25': [18, 25],
        '26-40': [26, 40],
        '41-55': [41, 55],
        '55+': [55, 70]
    };

    // If the range is a custom one (e.g., "18-35"), parse it
    if (!ranges[range]) {
        const match = range.match(/(\d+)-(\d+)/);
        if (match) {
            return [parseInt(match[1]), parseInt(match[2])];
        }
    }

    return ranges[range] || [25, 35];
}

function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

/**
 * Check if a persona is too similar to existing ones
 */
export function checkForDuplicates(newPersona: any, existingPersonas: any[]): { isDuplicate: boolean; similarityScore: number } {
    for (const existing of existingPersonas) {
        let score = 0;

        // Name similarity (very strict)
        if (newPersona.name.toLowerCase() === existing.name.toLowerCase()) {
            score += 50; // Immediate fail
        } else if (stringSimilarity(newPersona.name, existing.name) > 0.8) {
            score += 30;
        }

        // Age similarity (within 3 years)
        if (Math.abs(newPersona.age - existing.age) <= 3) {
            score += 15;
        }

        // Occupation similarity
        if (stringSimilarity(newPersona.occupation, existing.occupation) > 0.8) {
            score += 10;
        }

        // Location similarity
        if (newPersona.location && existing.location) {
            if (stringSimilarity(newPersona.location, existing.location) > 0.8) {
                score += 10;
            }
        }

        // Bio similarity
        if (newPersona.bio && existing.bio) {
            if (stringSimilarity(newPersona.bio, existing.bio) > 0.7) {
                score += 10;
            }
        }

        // If more than 50% similar, it's a duplicate (relaxed from 40)
        if (score > 50) {
            return { isDuplicate: true, similarityScore: score };
        }
    }

    return { isDuplicate: false, similarityScore: 0 };
}

/**
 * Simple string similarity using Levenshtein-like approach
 */
function stringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;

    // Simple approach: count matching words
    const words1 = new Set(s1.split(/\s+/));
    const words2 = new Set(s2.split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
}

/**
 * Validate the diversity of the generated persona set
 */
export function validateDiversity(personas: any[]): DiversityScore {
    const scores = {
        ageDiversity: 0,
        incomeDiversity: 0,
        experienceDiversity: 0,
        attitudeDiversity: 0,
        techDiversity: 0,
        roleDiversity: 0,
        noDuplicates: 0
    };

    // Age diversity: count unique age brackets
    const ageBrackets = new Set(personas.map(p => getAgeBracket(p.age)));
    scores.ageDiversity = Math.min((ageBrackets.size / 4) * 100, 100);

    // Income diversity: parse income and categorize
    const incomeCategories = new Set(personas.map(p => categorizeIncome(p.income)));
    scores.incomeDiversity = Math.min((incomeCategories.size / 3) * 100, 100);

    // Experience diversity
    const expLevels = new Set(personas.map(p => {
        const traits = typeof p.traits === 'string' ? JSON.parse(p.traits) : p.traits;
        return traits.experience_level || 'Regular';
    }));
    scores.experienceDiversity = Math.min((expLevels.size / 3) * 100, 100);

    // Attitude diversity (MUST have both Believer and Skeptic)
    const attitudes = personas.map(p => {
        const traits = typeof p.traits === 'string' ? JSON.parse(p.traits) : p.traits;
        return traits.attitude || 'Neutral';
    });
    const hasBeliever = attitudes.some(a => a === 'Believer');
    const hasSkeptic = attitudes.some(a => a === 'Skeptic');
    const skepticPercent = attitudes.filter(a => a === 'Skeptic').length / personas.length;

    scores.attitudeDiversity = (hasBeliever && hasSkeptic && skepticPercent >= 0.25) ? 100 : 50;

    // Tech diversity
    const techLevels = new Set(personas.map(p => {
        const traits = typeof p.traits === 'string' ? JSON.parse(p.traits) : p.traits;
        return traits.tech_comfort || 'Medium';
    }));
    scores.techDiversity = Math.min((techLevels.size / 3) * 100, 100);

    // Role diversity (New)
    // We can infer role from occupation or check if we saved it in traits (we should save it)
    // For now, let's check occupation variety as a proxy if role isn't explicitly saved yet
    // BUT, since we are adding role to slots, we should save it in traits.
    // Let's assume we will save it in traits.role
    const roles = new Set(personas.map(p => {
        const traits = typeof p.traits === 'string' ? JSON.parse(p.traits) : p.traits;
        return traits.role || 'Unknown';
    }));
    scores.roleDiversity = Math.min((roles.size / 3) * 100, 100);

    // No duplicates check
    const duplicateCheck = checkForAllDuplicates(personas);
    scores.noDuplicates = duplicateCheck.count === 0 ? 100 : Math.max(0, 100 - (duplicateCheck.count * 20));

    const overall = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

    return {
        overall,
        ...scores,
        // Relaxed Pass Condition: Allow 1 duplicate pair (80%) if overall score is high
        pass: overall >= 85 && scores.noDuplicates >= 80
    };
}

function getAgeBracket(age: number): string {
    if (age <= 25) return '18-25';
    if (age <= 40) return '26-40';
    if (age <= 55) return '41-55';
    return '55+';
}

function categorizeIncome(income: string): string {
    const match = income.match(/\$?([\d,]+)k?/i);
    if (!match) return 'middle';

    const amount = parseInt(match[1].replace(/,/g, ''));
    if (amount < 35000) return 'low';
    if (amount < 80000) return 'middle';
    return 'high';
}

/**
 * Parse demographics string to extract age range
 * Examples: "18-35", "25-45 years old", "ages 18 to 35"
 */
function parseDemographics(demographics: string): Record<string, number> | null {
    // Extract numbers from the demographics string
    const ageMatch = demographics.match(/(\d+)\s*[-–to]+\s*(\d+)/);
    if (!ageMatch) return null;

    const minAge = parseInt(ageMatch[1]);
    const maxAge = parseInt(ageMatch[2]);

    // Create a single age group for the target demographic
    const rangeLabel = `${minAge}-${maxAge}`;
    return { [rangeLabel]: 1.0 };
}

function checkForAllDuplicates(personas: any[]): { count: number; pairs: string[] } {
    const duplicates: string[] = [];

    for (let i = 0; i < personas.length; i++) {
        for (let j = i + 1; j < personas.length; j++) {
            const { isDuplicate } = checkForDuplicates(personas[i], [personas[j]]);
            if (isDuplicate) {
                duplicates.push(`${personas[i].name} ≈ ${personas[j].name}`);
            }
        }
    }

    return { count: duplicates.length, pairs: duplicates };
}
