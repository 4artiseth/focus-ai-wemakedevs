import { z } from 'zod';
import { SYSTEM_PROMPTS } from '@/lib/llm/prompts';
import { callLLM } from '@/lib/llm/api-client';
import { pMap, parseRelaxedJSON } from '@/lib/utils';

// --- Types & Schemas ---

export interface VanWestendorpData {
    tooCheap: number;
    cheap: number;
    expensive: number;
    tooExpensive: number;
}

export interface PricingResult {
    optimalPricePoint: number;
    indifferencePricePoint: number;
    pointOfMarginalCheapness: number;
    pointOfMarginalExpensiveness: number;
    acceptablePriceRange: { min: number; max: number };
    curveData: {
        price: number;
        tooCheap: number;
        cheap: number;
        expensive: number;
        tooExpensive: number;
    }[];
}

// --- Helper Functions ---

function findIntersection(
    x1: number, x2: number,
    y1_a: number, y2_a: number,
    y1_b: number, y2_b: number
): number {
    const slope_a = (y2_a - y1_a) / (x2 - x1);
    const slope_b = (y2_b - y1_b) / (x2 - x1);

    if (slope_a === slope_b) return (x1 + x2) / 2;

    const x = x1 + (y1_b - y1_a) / (slope_a - slope_b);
    return Math.max(x1, Math.min(x2, x));
}

// --- Main Logic ---

export function calculateVanWestendorp(responses: VanWestendorpData[]): PricingResult {
    if (!responses || responses.length === 0) {
        throw new Error("Cannot calculate Van Westendorp: No responses provided.");
    }

    // 1. Collect and Sort Unique Price Points
    const prices = new Set<number>();
    responses.forEach(r => {
        prices.add(r.tooCheap);
        prices.add(r.cheap);
        prices.add(r.expensive);
        prices.add(r.tooExpensive);
    });
    const sortedPrices = Array.from(prices).sort((a, b) => a - b);

    if (sortedPrices.length < 2) {
        const p = sortedPrices[0] || 0;
        return {
            optimalPricePoint: p,
            indifferencePricePoint: p,
            pointOfMarginalCheapness: p,
            pointOfMarginalExpensiveness: p,
            acceptablePriceRange: { min: p, max: p },
            curveData: []
        };
    }

    const total = responses.length;

    // 2. Calculate Cumulative Percentages
    const curveData = sortedPrices.map(price => {
        const tooCheapCount = responses.filter(r => r.tooCheap >= price).length;
        const cheapCount = responses.filter(r => r.cheap >= price).length;
        const expensiveCount = responses.filter(r => r.expensive <= price).length;
        const tooExpensiveCount = responses.filter(r => r.tooExpensive <= price).length;

        return {
            price,
            tooCheap: tooCheapCount / total,
            cheap: cheapCount / total,
            expensive: expensiveCount / total,
            tooExpensive: tooExpensiveCount / total,
        };
    });

    // 3. Find Intersections using Linear Interpolation
    const findRobustIntersection = (key1: keyof typeof curveData[0], key2: keyof typeof curveData[0]): number => {
        for (let i = 0; i < curveData.length - 1; i++) {
            const p1 = curveData[i];
            const p2 = curveData[i + 1];

            const y1_a = p1[key1];
            const y2_a = p2[key1];
            const y1_b = p1[key2];
            const y2_b = p2[key2];

            if ((y1_a - y1_b) * (y2_a - y2_b) <= 0) {
                return findIntersection(p1.price, p2.price, y1_a, y2_a, y1_b, y2_b);
            }
        }

        // Fallback: Find point of minimum distance
        let minDiff = Infinity;
        let bestPrice = sortedPrices[0];
        curveData.forEach(p => {
            const diff = Math.abs(p[key1] - p[key2]);
            if (diff < minDiff) {
                minDiff = diff;
                bestPrice = p.price;
            }
        });
        return bestPrice;
    };

    let opp = findRobustIntersection('tooCheap', 'tooExpensive');
    let ipp = findRobustIntersection('cheap', 'expensive');
    let pmc = findRobustIntersection('tooCheap', 'expensive');
    let pme = findRobustIntersection('tooExpensive', 'cheap');

    if (pmc > pme) {
        [pmc, pme] = [pme, pmc];
    }

    return {
        optimalPricePoint: opp,
        indifferencePricePoint: ipp,
        pointOfMarginalCheapness: pmc,
        pointOfMarginalExpensiveness: pme,
        acceptablePriceRange: { min: pmc, max: pme },
        curveData
    };
}

/**
 * Run Van Westendorp analysis for a project (Individual Persona Mode)
 */
export async function analyzeVanWestendorp(
    personas: any[],
    productName: string,
    category: string,
    details: any,
    getPersonaResponseFn: (personaId: string, question: string, context: string) => Promise<{ answer: string; reasoning: string }>
): Promise<{ result: PricingResult; rawResponses: any[]; transcript: string }> {
    console.log(`[VW] Starting analysis for ${personas.length} personas (Parallel)...`);

    // Parallelize VW Requests (Concurrency: 20)
    const results = await pMap(personas, async (persona) => {
        try {
            const promptTemplate = SYSTEM_PROMPTS.PRICING_VAN_WESTENDORP_INDIVIDUAL
                .replace('{name}', persona.name)
                .replace('{age}', persona.age.toString())
                .replace('{occupation}', persona.occupation)
                .replace('{bio}', persona.bio)
                .replace('{income}', persona.income)
                .replace('{shopping_habits}', persona.shopping_habits || 'Average shopper')
                .replace('{productName}', productName)
                .replace('{description}', details.description || category)
                .replace('{competitors}', details.competitors || 'None specified')
                .replace('{pricingModel}', details.pricingModel || 'One-time purchase');

            const { answer, reasoning } = await getPersonaResponseFn(persona.id, "Please evaluate the pricing.", promptTemplate);

            if (!answer) throw new Error("Empty response from persona");

            let parsed: any;
            try {
                parsed = parseRelaxedJSON(answer);
            } catch (e) {
                console.warn(`Invalid JSON from persona ${persona.id}:`, answer);
                return null;
            }

            // Validate logic
            if (parsed.too_cheap < parsed.cheap && parsed.cheap < parsed.expensive && parsed.expensive < parsed.too_expensive) {
                return {
                    data: {
                        tooCheap: parsed.too_cheap,
                        cheap: parsed.cheap,
                        expensive: parsed.expensive,
                        tooExpensive: parsed.too_expensive
                    },
                    raw: { persona: persona.name, ...parsed },
                    transcriptEntry: `**${persona.name}** (${persona.age}, ${persona.occupation}):\n"My initial reaction: ${parsed.initial_reaction || 'Interesting concept.'}"\n\n"Regarding the price... ${parsed.reasoning || reasoning}"\n\n- Too Cheap: $${parsed.too_cheap}\n- Bargain: $${parsed.cheap}\n- Expensive: $${parsed.expensive}\n- Too Expensive: $${parsed.too_expensive}\n\n---\n\n`
                };
            } else {
                console.warn(`Illogical pricing data from persona ${persona.id}:`, parsed);
                return null;
            }
        } catch (error) {
            console.error(`VW Error for ${persona.name}:`, error);
            return null;
        }
    }, 5);

    // Filter out nulls
    const validResults = results.filter(r => r !== null) as any[];

    const responses: VanWestendorpData[] = validResults.map(r => r.data);
    const rawResponses = validResults.map(r => r.raw);
    const transcript = validResults.map(r => r.transcriptEntry).join("");

    if (responses.length === 0) {
        throw new Error("Analysis failed: No valid responses collected from personas.");
    }

    // Outlier Detection (IQR)
    if (responses.length >= 4) {
        const values = responses.map(r => (r.cheap + r.expensive) / 2).sort((a, b) => a - b);
        const q1 = values[Math.floor(values.length * 0.25)];
        const q3 = values[Math.floor(values.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        const filteredResponses = responses.filter(r => {
            const val = (r.cheap + r.expensive) / 2;
            return val >= lowerBound && val <= upperBound;
        });

        if (filteredResponses.length >= 4 && filteredResponses.length < responses.length) {
            console.log(`Removed ${responses.length - filteredResponses.length} outliers.`);
            return {
                result: calculateVanWestendorp(filteredResponses),
                rawResponses,
                transcript
            };
        }
    }

    return {
        result: calculateVanWestendorp(responses),
        rawResponses,
        transcript
    };
}

/**
 * Run Gabor-Granger pricing analysis (Laddering Mode)
 */
export async function analyzeGaborGranger(
    personas: any[],
    productName: string,
    details: any,
    vwResult: PricingResult,
    getPersonaResponseFn: (personaId: string, question: string, context: string) => Promise<{ answer: string; reasoning: string }>
): Promise<{ revenueData: any; transcript: string }> {
    // Use user constraints if available, otherwise fallback to VW results
    let floor = details.priceMin ? Number(details.priceMin) : vwResult.pointOfMarginalCheapness;
    let ceiling = details.priceMax ? Number(details.priceMax) : vwResult.pointOfMarginalExpensiveness * 1.5;

    // Generate 5-7 price points
    const step = (ceiling - floor) / 6;
    const pricePoints = Array.from({ length: 7 }, (_, i) => Math.round(floor + i * step));

    console.log(`[GG] Starting laddering for ${personas.length} personas across range $${floor} - $${ceiling} (Parallel)...`);

    // Parallelize GG Requests (Concurrency: 20)
    const results = await pMap(personas, async (persona) => {
        // Binary search / Laddering to find max WTP
        // Simplified approach: Start middle, go up/down
        let low = 0;
        let high = pricePoints.length - 1;
        let maxWTP = 0; // 0 means wouldn't buy at lowest price

        // We'll ask at most 3 questions to narrow it down
        let currentIdx = Math.floor((low + high) / 2);
        let attempts = 0;
        let personaTranscript = `**${persona.name}** Session:\n`;

        while (low <= high && attempts < 4) {
            const price = pricePoints[currentIdx];
            const promptTemplate = SYSTEM_PROMPTS.PRICING_GABOR_GRANGER_INDIVIDUAL
                .replace('{name}', persona.name)
                .replace('{age}', persona.age.toString())
                .replace('{occupation}', persona.occupation)
                .replace('{income}', persona.income)
                .replace('{productName}', productName)
                .replace('{price}', price.toString())
                .replace('{pricingModel}', details.pricingModel || 'One-time purchase');

            try {
                const { answer } = await getPersonaResponseFn(persona.id, `Would you buy at $${price}?`, promptTemplate);

                if (!answer) throw new Error("Empty response");

                // Clean up response (handle JSON if present)
                let cleanAnswer = answer;
                let decision = "NO";

                try {
                    const parsed = parseRelaxedJSON(answer);
                    decision = parsed.decision || "NO";
                    cleanAnswer = parsed.reasoning || parsed.answer || answer;
                } catch (e) {
                    // Fallback: Text analysis if JSON fails completely
                    if (answer.toUpperCase().includes("YES")) decision = "YES";
                }

                // Format for Transcript: "Persona: [Decision] Reasoning..."
                personaTranscript += `**${persona.name}**: [${decision} at $${price}] ${cleanAnswer}\n\n`;

                if (decision === "YES") {
                    maxWTP = price; // They buy at this price, try higher
                    low = currentIdx + 1;
                } else {
                    high = currentIdx - 1; // Too expensive, try lower
                }
                currentIdx = Math.floor((low + high) / 2);

            } catch (e) {
                console.error(`GG Error for ${persona.name}:`, e);
                break;
            }
            attempts++;
        }
        personaTranscript += `-> Max WTP: $${maxWTP}\n\n`;

        return { maxWTP, transcript: personaTranscript };
    }, 5);

    const maxWTPs = results.map(r => r.maxWTP);
    const transcript = results.map(r => r.transcript).join("");

    // Calculate Revenue Curve
    const revenueCurve = pricePoints.map(price => {
        // Demand: % of people whose Max WTP >= price
        const demandCount = maxWTPs.filter(wtp => wtp >= price).length;
        const demandPct = demandCount / personas.length;
        return {
            price,
            purchase_probability: demandPct,
            revenue: price * demandPct * 1000 // Projected revenue per 1,000 potential customers
        };
    });

    // Find Max Revenue
    const maxRevenuePoint = revenueCurve.reduce((prev, current) => (prev.revenue > current.revenue) ? prev : current);

    return {
        revenueData: {
            gg_revenue_max_price: maxRevenuePoint.price,
            gg_optimal_revenue_points: revenueCurve
        },
        transcript
    };
}

/**
 * Run Advanced Pricing Simulation (Orchestrator)
 */
export async function runAdvancedPricingSimulation(
    project: any,
    personas: any[],
    llmCaller: (messages: any[]) => Promise<string> = callLLM
): Promise<{ vw: any; gg: any; transcript: string; report: string }> {
    console.log('[PRICING] Starting Advanced Pricing Simulation (Agent Mode)...');

    // 1. Run Van Westendorp
    // We need to import getPersonaResponse here if we want to use it directly, 
    // OR rely on the passed function. The signature of this function in the original file 
    // didn't take a callback, it took `llmCaller`. 
    // But `analyzeVanWestendorp` DOES take a callback.
    // I need to update `runAdvancedPricingSimulation` to accept `getPersonaResponseFn`.

    // To avoid breaking the signature expected by engine.ts (which calls this),
    // I will import `getPersonaResponse` from orchestrator.
    const { getPersonaResponse } = require('@/lib/llm/orchestrator');

    const vwResults = await analyzeVanWestendorp(
        personas,
        project.name,
        project.category,
        project.details || {},
        getPersonaResponse
    );

    // 2. Run Gabor-Granger
    const ggResults = await analyzeGaborGranger(
        personas,
        project.name,
        project.details || {},
        vwResults.result,
        getPersonaResponse
    );

    // 3. Generate Report
    // We allow a large context window (50k chars) to capture most details
    const transcriptSummary = `
    ### Van Westendorp Session
    ${vwResults.transcript.substring(0, 50000)}

    ### Gabor-Granger Session
    ${ggResults.transcript.substring(0, 50000)}
    `;

    const reportPrompt = SYSTEM_PROMPTS.PRICING_REPORT
        .replace('{productName}', project.name)
        .replace('{description}', project.description)
        .replace('{vwData}', JSON.stringify(vwResults.result, null, 2))
        .replace('{ggData}', JSON.stringify(ggResults.revenueData, null, 2))
        .replace('{transcriptSummary}', transcriptSummary);

    console.log('[PRICING] Generating Final Report (using Fast Model)...');

    let reportResponse = "Report generation failed or timed out. Please review the raw data and transcripts below.";
    try {
        // Use FAST_LLM_CONFIG.model for speed with large context
        // Note: llmCaller might not support model override if it's just 'callLLM' passed by reference without wrapper.
        // But in engine.ts it calls callLLM directly. 
        // To be safe, we import callLLM and use it directly here if we want to force the model, 
        // OR we assume llmCaller is flexible. 
        // Given the architecture, it's safer to use the imported callLLM with the specific model config.
        const { callLLM } = require('@/lib/llm/api-client');
        const { FAST_LLM_CONFIG } = require('@/lib/llm/config');

        reportResponse = await callLLM([
            { role: 'system', content: "You are a Senior Pricing Strategy Consultant." },
            { role: 'user', content: reportPrompt }
        ], false, FAST_LLM_CONFIG.model);
    } catch (e) {
        console.error("[PRICING] Report generation failed:", e);
        reportResponse += `\n\nError details: ${(e as Error).message}`;
    }

    return {
        vw: vwResults.result,
        gg: ggResults.revenueData,
        report: reportResponse,
        transcript: `### Van Westendorp Session\n\n${vwResults.transcript}\n\n---\n\n### Gabor-Granger Session\n\n${ggResults.transcript}`
    };
}
