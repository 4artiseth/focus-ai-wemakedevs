import { prisma } from '@/lib/prisma';
import { callLLM } from '@/lib/llm/api-client';
import { SYSTEM_PROMPTS } from '@/lib/llm/prompts';
import { getPersonaResponse } from '@/lib/llm/orchestrator';
import { generateChoiceTasks, ConjointAttribute } from './conjoint';
import { pMap } from '@/lib/utils';

interface ConjointResult {
    kano: any;
    lifeboat: any;
    bundles: any;
    dealBreakers: any;
    report: string;
}

async function extractFeatures(project: any): Promise<string[]> {
    // If features are explicitly listed in details, use them
    if (project.details?.features && Array.isArray(project.details.features) && project.details.features.length > 0) {
        return project.details.features;
    }

    // Otherwise, extract from description
    const prompt = `
    Extract a list of 5-8 distinct FEATURES from this product description.
    Return ONLY a JSON array of strings.
    
    Product: ${project.name}
    Description: ${project.description}
    `;

    const response = await callLLM([
        { role: 'system', content: 'You are a feature extractor. Return JSON array only.' },
        { role: 'user', content: prompt }
    ], true);

    try {
        const features = JSON.parse(response.replace(/```json/g, '').replace(/```/g, '').trim());
        return features.slice(0, 8); // Limit to 8 max
    } catch (e) {
        console.error("Failed to extract features", e);
        return ["Core Functionality", "Ease of Use", "Speed", "Reliability", "Support"]; // Fallback
    }
}

// --- SCORING HELPERS ---

function parseResponse(response: string): any {
    try {
        // Clean markdown code blocks
        const clean = response.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean);
    } catch (e) {
        return null; // Failed to parse
    }
}

function calculateKanoScores(results: any[], features: string[]) {
    const scores: Record<string, { mustHave: number, performance: number, delighter: number, indifferent: number }> = {};

    features.forEach(f => scores[f] = { mustHave: 0, performance: 0, delighter: 0, indifferent: 0 });

    results.forEach(r => {
        const parsed = parseResponse(r.response);
        if (parsed?.classifications) {
            Object.entries(parsed.classifications).forEach(([feature, category]: [string, any]) => {
                const cat = String(category).toLowerCase();
                if (scores[feature]) {
                    if (cat.includes('must')) scores[feature].mustHave++;
                    else if (cat.includes('perform')) scores[feature].performance++;
                    else if (cat.includes('delight')) scores[feature].delighter++;
                    else scores[feature].indifferent++;
                }
            });
        }
    });

    return scores;
}

function calculateLifeboatScores(results: any[], features: string[]) {
    const saves: Record<string, number> = {};
    features.forEach(f => saves[f] = 0);

    results.forEach(r => {
        const parsed = parseResponse(r.response);
        if (parsed?.saved && Array.isArray(parsed.saved)) {
            parsed.saved.forEach((f: string) => {
                // Fuzzy match feature name
                const match = features.find(feat => f.toLowerCase().includes(feat.toLowerCase()));
                if (match) saves[match]++;
            });
        }
    });

    return saves;
}

function calculateDealBreakerScore(results: any[]) {
    let churnCount = 0;
    results.forEach(r => {
        const parsed = parseResponse(r.response);
        if (parsed?.cancel === true || String(parsed?.cancel).toLowerCase() === 'true') {
            churnCount++;
        }
    });
    return { churnCount, total: results.length, churnRate: churnCount / results.length };
}


export async function runConjointSimulation(project: any, personas: any[]): Promise<ConjointResult> {
    console.log(`[CONJOINT] Starting simulation for ${project.name} with ${personas.length} personas`);

    const features = await extractFeatures(project);
    console.log(`[CONJOINT] Testing features: ${features.join(', ')}`);

    // 1. Kano Sort
    console.log('[CONJOINT] Running Kano Sort...');
    const kanoResults = await pMap(personas, async (persona) => {
        const question = `
        Here are the features: ${features.join(', ')}.
        For EACH feature, classify it as:
        - MUST HAVE (I won't buy without it)
        - PERFORMANCE (The better it is, the more I pay)
        - DELIGHTER (Nice surprise, but not needed)
        - INDIFFERENT (I don't care)
        
        Return JSON: { "classifications": { "Feature Name": "Category" } }
        `;
        const response = await getPersonaResponse(persona.id, question, SYSTEM_PROMPTS.CONJOINT_PARTICIPANT.replace('{productName}', project.name));

        // SAVE PARTIAL RESULT
        await prisma.response.create({
            data: {
                sessionId: 'temp', // TODO: Pass session ID
                personaId: persona.id,
                question: 'Kano Sort',
                answer: response.answer,
                reasoning: response.reasoning,
                metadata: JSON.stringify({ type: 'kano', parsed: parseResponse(response.answer) })
            }
        });

        return { personaId: persona.id, response: response.answer };
    }, 10);

    // 2. Lifeboat Game
    console.log('[CONJOINT] Running Lifeboat Game...');
    const lifeboatResults = await pMap(personas, async (persona) => {
        const question = `
        The ship is sinking. You can only save 3 features from this list: ${features.join(', ')}.
        Which 3 do you save?
        Return JSON: { "saved": ["Feature 1", "Feature 2", "Feature 3"] }
        `;
        const response = await getPersonaResponse(persona.id, question, SYSTEM_PROMPTS.CONJOINT_PARTICIPANT.replace('{productName}', project.name));
        return { personaId: persona.id, response: response.answer };
    }, 10);

    // 3. Bundle Choice (Simplified CBC)
    console.log('[CONJOINT] Running Bundle Choice...');
    const attributes: ConjointAttribute[] = features.slice(0, 5).map(f => ({
        name: f,
        levels: ["Included", "Not Included"]
    }));
    const tasks = generateChoiceTasks(attributes, 4);

    const bundleResults = await pMap(personas, async (persona) => {
        const choices = [];
        for (const task of tasks) {
            const optionsText = task.options.map((opt, i) =>
                `Option ${i + 1}: ${Object.entries(opt.attributes).filter(([k, v]) => v === 'Included').map(([k, v]) => k).join(', ')}`
            ).join('\n');

            const question = `
            Which option do you prefer?
            ${optionsText}
            Option 4: None of these
            
            Return JSON: { "choice": "Option X" }
            `;
            const response = await getPersonaResponse(persona.id, question, SYSTEM_PROMPTS.CONJOINT_PARTICIPANT.replace('{productName}', project.name));
            choices.push({ taskId: task.id, response: response.answer });
        }
        return { personaId: persona.id, choices };
    }, 5);

    // 4. Deal Breaker
    console.log('[CONJOINT] Running Deal Breaker...');
    const dealBreakerResults = await pMap(personas, async (persona) => {
        const question = `
        I am removing "${features[0]}" from the product but keeping the price the same.
        Do you cancel your order? (Yes/No)
        
        Return JSON: { "cancel": boolean, "reason": string }
        `;
        const response = await getPersonaResponse(persona.id, question, SYSTEM_PROMPTS.CONJOINT_PARTICIPANT.replace('{productName}', project.name));
        return { personaId: persona.id, response: response.answer };
    }, 10);

    // --- CALCULATE SCORES ---
    const kanoScores = calculateKanoScores(kanoResults, features);
    const lifeboatScores = calculateLifeboatScores(lifeboatResults, features);
    const dealBreakerScore = calculateDealBreakerScore(dealBreakerResults);

    // Generate Report
    console.log('[CONJOINT] Generating Report...');
    const reportPrompt = `
    Analyze these Conjoint Analysis results for ${project.name}.
    Features Tested: ${features.join(', ')}
    
    Kano Scores: ${JSON.stringify(kanoScores)}
    Lifeboat Saves: ${JSON.stringify(lifeboatScores)}
    Deal Breaker Churn: ${JSON.stringify(dealBreakerScore)}
    
    Write a "Feature Prioritization Report".
    Sections:
    1. Executive Summary (What to build first)
    2. Must-Have Features (Kano/Lifeboat)
    3. Nice-to-Have Features
    4. Deal Breakers
    5. Recommended MVP Scope
    `;

    const report = await callLLM([
        { role: 'system', content: 'You are a Product Strategy Expert.' },
        { role: 'user', content: reportPrompt }
    ], true);

    return {
        kano: kanoScores,
        lifeboat: lifeboatScores,
        bundles: bundleResults,
        dealBreakers: dealBreakerScore,
        report
    };
}
