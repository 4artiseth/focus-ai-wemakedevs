import { prisma } from "@/lib/prisma";
import { getPersonaResponse } from "@/lib/llm/orchestrator";
import { callLLM } from "@/lib/llm/api-client";
import {
  analyzeVanWestendorp,
  analyzeGaborGranger,
  runAdvancedPricingSimulation,
} from "@/lib/analysis/pricing";
import { runConjointSimulation } from "@/lib/analysis/conjoint-runner";
import { SYSTEM_PROMPTS } from "@/lib/llm/prompts";
import { pMap } from "@/lib/utils";
import { GOAL_QUESTIONS } from "./goals";
import {
  parsePersonaResponse,
  aggregateAnalysis,
  extractValidationInsights,
} from "@/lib/analysis/parser";

export async function createSession(projectId: string) {
  return await prisma.session.create({
    data: {
      projectId,
      status: "running",
    },
  });
}

export async function runSimulation(sessionId: string) {
  console.log(`[SIMULATION] Starting for session ${sessionId}`);

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) throw new Error("Session not found");
  const projectId = session.projectId;

  try {
    // 2. Fetch Project & Personas
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        personas: true,
        details: true,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    if (project.personas.length === 0) {
      throw new Error("No personas found - please generate personas first");
    }

    console.log(`[SIMULATION] Found ${project.personas.length} personas`);

    // --- GOAL-BASED ORCHESTRATION ---

    const goal = (
      project.researchGoal ||
      project.details?.researchGoal ||
      ""
    ).toLowerCase();
    console.log(`[SIMULATION] Detected Goal: ${goal}`);

    if (goal === "all") {
      console.log("[SIMULATION] Running ALL Modules in sequence...");

      // 1. Idea Validation
      console.log("--- Module 1: Idea Validation ---");
      await runStandardSession(
        session,
        project,
        GOAL_QUESTIONS.IDEA_VALIDATION,
        SYSTEM_PROMPTS.IDEA_VALIDATION_PARTICIPANT,
        "Idea Validation"
      );

      // 2. Pricing
      console.log("--- Module 2: Pricing Strategy ---");
      const pricingResults = await runAdvancedPricingSimulation(
        project,
        project.personas
      );
      await savePricingInsights(session.id, pricingResults);

      // 3. Conjoint
      console.log("--- Module 3: Feature Prioritization ---");
      const conjointResults = await runConjointSimulation(
        project,
        project.personas
      );
      await saveConjointInsights(session.id, conjointResults);

      // 4. Positioning
      console.log("--- Module 4: Positioning Strategy ---");
      await runStandardSession(
        session,
        project,
        GOAL_QUESTIONS.POSITIONING,
        SYSTEM_PROMPTS.POSITIONING_PARTICIPANT,
        "Positioning Strategy"
      );
    } else if (goal.includes("pricing") || goal.includes("price")) {
      console.log("[SIMULATION] Running Pricing Module...");

      // 1. Qualitative Discussion
      await runStandardSession(
        session,
        project,
        GOAL_QUESTIONS.PRICING,
        undefined, // Use default prompt
        "Pricing Discussion"
      );

      // 2. Quantitative Simulation
      const pricingResults = await runAdvancedPricingSimulation(
        project,
        project.personas
      );
      await savePricingInsights(session.id, pricingResults);
    } else if (
      goal.includes("prioritization") ||
      goal.includes("feature") ||
      goal.includes("conjoint")
    ) {
      console.log("[SIMULATION] Running Conjoint Module...");

      // 1. Qualitative Discussion with proper analysis prompt
      await runStandardSession(
        session,
        project,
        GOAL_QUESTIONS.FEATURE_PRIORITIZATION,
        SYSTEM_PROMPTS.CONJOINT_PARTICIPANT, // Use conjoint prompt for analysis structure
        "Feature Prioritization"
      );

      // 2. Quantitative Simulation
      const conjointResults = await runConjointSimulation(
        project,
        project.personas
      );
      await saveConjointInsights(session.id, conjointResults);
    } else if (goal.includes("validation") || goal.includes("idea")) {
      console.log("[SIMULATION] Running Idea Validation Module...");
      await runStandardSession(
        session,
        project,
        GOAL_QUESTIONS.IDEA_VALIDATION,
        SYSTEM_PROMPTS.IDEA_VALIDATION_PARTICIPANT,
        "Idea Validation"
      );
    } else if (goal.includes("positioning") || goal.includes("brand")) {
      console.log("[SIMULATION] Running Positioning Module...");
      await runStandardSession(
        session,
        project,
        GOAL_QUESTIONS.POSITIONING,
        SYSTEM_PROMPTS.POSITIONING_PARTICIPANT,
        "Positioning Strategy"
      );
    } else {
      // Default / Custom Questions
      console.log("[SIMULATION] Running Standard Custom Session...");
      let customQs: string[] = [];
      try {
        if (project.details?.customQuestions) {
          const raw = project.details.customQuestions.trim();
          if (raw.startsWith("[") && raw.endsWith("]")) {
            customQs = JSON.parse(raw);
          } else {
            customQs = raw.includes(",")
              ? raw
                  .split(",")
                  .map((q) => q.trim())
                  .filter((q) => q.length > 0)
              : [raw];
          }
        }
      } catch (e) {
        customQs = [
          project.details?.customQuestions || "What do you think about this?",
        ];
      }

      const defaultQuestions = [
        "What is your initial reaction to this product concept?",
        "How likely would you be to use this? (1-5)",
        ...customQs,
      ];

      await runStandardSession(
        session,
        project,
        defaultQuestions,
        undefined,
        "General Discussion"
      );
    }

    // Mark as completed
    await prisma.session.update({
      where: { id: session.id },
      data: { status: "completed" },
    });
    console.log("[SIMULATION] Simulation Completed successfully");
    return session;
  } catch (error: any) {
    console.error("[SIMULATION] Simulation Failed:", error);
    await prisma.session.update({
      where: { id: session.id },
      data: { status: "failed" },
    });
    throw error;
  }
}

// --- HELPER FUNCTIONS ---

async function savePricingInsights(sessionId: string, results: any) {
  await prisma.insight.create({
    data: {
      sessionId,
      type: "pricing_vw",
      content: JSON.stringify(results.vw),
      confidence: 0.9,
      citations: JSON.stringify(["Van Westendorp"]),
    },
  });
  await prisma.insight.create({
    data: {
      sessionId,
      type: "pricing_gg",
      content: JSON.stringify(results.gg),
      confidence: 0.9,
      citations: JSON.stringify(["Gabor-Granger"]),
    },
  });
  await prisma.insight.create({
    data: {
      sessionId,
      type: "pricing_report",
      content: results.report,
      confidence: 1.0,
      citations: JSON.stringify(["Pricing Report"]),
    },
  });
}

async function saveConjointInsights(sessionId: string, results: any) {
  await prisma.insight.create({
    data: {
      sessionId,
      type: "conjoint_kano",
      content: JSON.stringify(results.kano),
      confidence: 0.9,
      citations: JSON.stringify(["Kano Sort"]),
    },
  });
  await prisma.insight.create({
    data: {
      sessionId,
      type: "conjoint_report",
      content: results.report,
      confidence: 1.0,
      citations: JSON.stringify(["Conjoint Report"]),
    },
  });
}

async function runStandardSession(
  session: any,
  project: any,
  questions: string[],
  systemPromptOverride?: string,
  phaseName: string = "Discussion"
) {
  console.log(
    `[${phaseName}] Starting Q&A with ${questions.length} questions...`
  );
  const transcript: string[] = [];

  // Add product introduction at the start
  const productIntro = `
PRODUCT: ${project.name}
DESCRIPTION: ${project.description}
PROBLEM SOLVED: ${project.details?.problem || "Not specified"}
CATEGORY: ${project.category}
TARGET AUDIENCE: ${project.audience}
${
  project.details?.coreFeatures
    ? `CORE FEATURES: ${project.details.coreFeatures}`
    : ""
}
${
  project.details?.priceExpected
    ? `EXPECTED PRICE: $${project.details.priceExpected}`
    : ""
}
`.trim();

  // Save introduction to database
  const introMessage = `Welcome everyone! Today we're discussing ${project.name}.\n\n${productIntro}`;
  transcript.push(`MODERATOR: ${introMessage}`);

  await prisma.message.create({
    data: {
      sessionId: session.id,
      sender: "Moderator",
      content: introMessage,
    },
  });

  for (const question of questions) {
    // Inject placeholders into the question
    const processedQuestion = question
      .replace(/{productName}/g, project.name)
      .replace(/{category}/g, project.details?.category || "this product")
      .replace(/{problem}/g, project.details?.problem || "the core problem")
      .replace(
        /{coreFeatures}/g,
        project.details?.coreFeatures || "the features"
      )
      .replace(/{competitors}/g, project.details?.competitors || "competitors")
      .replace(
        /{priceExpected}/g,
        project.details?.priceExpected
          ? `$${project.details.priceExpected}`
          : "the price"
      );

    // Skip if question was already asked (exact match)
    if (transcript.some((t) => t.includes(processedQuestion))) {
      console.log(
        `[${phaseName}] Skipping repeated question: ${processedQuestion}`
      );
      continue;
    }

    console.log(`[${phaseName}] Asking: ${processedQuestion}`);

    // 1. Moderator asks
    transcript.push(`MODERATOR: ${processedQuestion}`);
    await prisma.message.create({
      data: {
        sessionId: session.id,
        sender: "Moderator",
        content: processedQuestion,
      },
    });

    // 2. Personas respond (SEQUENTIAL now, so they hear each other)
    // We use pMap with concurrency 1 to ensure they speak one by one and context updates
    const responses = await pMap(
      project.personas,
      async (persona: any) => {
        // Inject Human Noise (5% chance)
        if (Math.random() < 0.05) {
          const noise = [
            "(Coughs)",
            "(Adjusts mic)",
            "Sorry, can you repeat?",
            "My internet is laggy",
          ][Math.floor(Math.random() * 4)];
          return {
            name: persona.name,
            answer: noise,
            reasoning: "Distracted",
            success: true,
            persona,
          };
        }

        // Build rich context with product details + conversation history
        // CRITICAL: We now include the VERY LATEST transcript messages so they react to previous speakers
        const productContext = `
🚨 CRITICAL: DO NOT HALLUCINATE FEATURES 🚨
Only discuss features explicitly listed below. Do NOT invent features based on the product category.

PRODUCT CONTEXT:
- Name: ${project.name}
- Description: ${project.description}
- Problem Solved: ${project.details?.problem || "Not specified"}
- Category: ${project.category}
- Target Audience: ${project.audience}
${
  project.details?.coreFeatures
    ? `- Core Features (ONLY THESE EXIST): ${project.details.coreFeatures}`
    : ""
}
${
  project.details?.premiumFeatures
    ? `- Premium Features: ${project.details.premiumFeatures}`
    : ""
}
${
  project.details?.priceExpected
    ? `- Expected Price: $${project.details.priceExpected} (${
        project.details.pricingModel || "one-time"
      })`
    : ""
}
${
  project.details?.competitors
    ? `- Competitors: ${project.details.competitors}`
    : ""
}

⚠️ REMINDER: If a feature is NOT in the list above, it does NOT exist. Stay on topic.

🎯 YOUR UNIQUE PERSPECTIVE MANDATE:
You are ${persona.name}, ${persona.age} years old, working as ${
          persona.occupation
        }.
Your income: ${persona.income}
Your bio: ${persona.bio}

BEFORE you consider what others said, think about:
1. How does this product fit YOUR specific daily life as a ${
          persona.occupation
        }?
2. What does YOUR ${persona.income} budget tell you about this?
3. Based on YOUR ${
          persona.age
        } years of life experience, what's YOUR authentic take?
4. What unique concern or insight would someone with YOUR background have that others might miss?

CONVERSATION SO FAR (Read to find where others might be missing YOUR perspective):
${transcript.slice(-3).join("\n")}

CURRENT QUESTION: ${processedQuestion}

🚨 CRITICAL: Your response must reflect YOUR unique background and life experiences.
Do NOT echo what others said. Bring a fresh perspective that ONLY someone with YOUR specific life would have.
`.trim();

        // Use Override Prompt if provided
        const promptToUse = systemPromptOverride
          ? systemPromptOverride
              .replace("{name}", persona.name)
              .replace("{age}", persona.age.toString())
              .replace("{occupation}", persona.occupation)
              .replace("{bio}", persona.bio)
              .replace("{traits}", persona.traits || "")
              .replace("{productName}", project.name)
          : productContext;

        // CRITICAL: Ensure conversation history is ALWAYS present, even with overrides
        let effectiveContext = promptToUse;
        if (systemPromptOverride) {
          effectiveContext += `\n\n🚨 PRODUCT FEATURES (DO NOT HALLUCINATE): ${
            project.details?.coreFeatures || "See product description"
          }

🎯 YOUR UNIQUE PERSPECTIVE:
You are ${persona.name}, ${persona.age} years old, ${
            persona.occupation
          }, earning ${persona.income}.
Think about how YOUR specific life experiences shape your view of this product.
What would someone with YOUR background notice that others might miss?

CONVERSATION SO FAR (Read to find where others might be missing YOUR perspective):
${transcript.slice(-3).join("\n")}

🚨 Do NOT echo what others said. Bring YOUR unique perspective based on YOUR life.`;
        }

        const isPricingQuestion = /price|cost|pay|subscription|money/i.test(
          question
        );
        const isResearcher = isPricingQuestion || Math.random() < 0.1;

        try {
          const res = await getPersonaResponse(
            persona.id,
            question,
            effectiveContext,
            isResearcher
          );

          // Parse response with new analysis parser
          const parsedResponse = parsePersonaResponse(res);
          let finalAnswer = parsedResponse.displayText;
          let finalReasoning = parsedResponse.reasoning || res.reasoning;
          let parsedMetadata: any = parsedResponse.rawMetadata || {
            reasoning: res.reasoning,
          };
          let analysisData = parsedResponse.analysis;

          // Handle JSON responses (legacy compatibility)
          if (
            typeof res.answer === "string" &&
            res.answer.trim().startsWith("{")
          ) {
            try {
              // Sanitize common LLM JSON errors
              const sanitizedAnswer = res.answer
                .replace(/\\([^"\\/bfnrtu])/g, "$1") // Fix invalid escapes like \$
                .replace(/^Return JSON:[\s\S]*?(?={)/i, ""); // Remove prefixes

              let parsed;
              try {
                parsed = JSON.parse(sanitizedAnswer);
              } catch {
                // Parsing failed, try regex extraction for "answer" as backup
                const answerMatch = sanitizedAnswer.match(
                  /"answer"\s*:\s*"((?:[^"\\]|\\.|[\r\n])*)"/
                );
                if (answerMatch && answerMatch[1]) {
                  parsed = {
                    answer: answerMatch[1]
                      .replace(/\\"/g, '"')
                      .replace(/\\n/g, "\n"),
                  };
                } else {
                  // Only throw if we strictly needed JSON (which we treat as an enhancement here).
                  // If we fail, we fall back to raw string.
                  throw new Error(
                    "JSON parse failed and regex fallback failed"
                  );
                }
              }

              if (parsed.answer) finalAnswer = parsed.answer;
              else if (parsed.reasoning) finalAnswer = parsed.reasoning;
              else if (parsed.x !== undefined && parsed.y !== undefined) {
                finalAnswer = `I'd place this at X: ${parsed.x} (Budget->Premium), Y: ${parsed.y} (Simple->Advanced)`;
              } else if (parsed.problem_score !== undefined) {
                finalAnswer = `Problem Intensity: ${parsed.problem_score}/10, Likelihood to Buy: ${parsed.buy_score}/10`;
              } else if (parsed.decision) {
                finalAnswer = `Decision: ${parsed.decision}. ${parsed.reasoning}`;
              } else if (parsed.ranking) {
                finalAnswer = `My Ranking: ${parsed.ranking.join(", ")}`;
              }

              if (parsed.reasoning) finalReasoning = parsed.reasoning;
              parsedMetadata = { ...parsedMetadata, ...parsed };
            } catch (e) {
              // ignore
              console.warn(
                `[SIMULATION] Failed to parse structured answer for ${persona.name}`,
                e
              );
            }
          }

          // IMMEDIATE SAVE & UPDATE TRANSCRIPT (So next persona sees it)
          if (typeof finalAnswer === "object") {
            finalAnswer = JSON.stringify(finalAnswer);
          }
          transcript.push(`${persona.name}: ${finalAnswer}`);

          await prisma.response.create({
            data: {
              sessionId: session.id,
              personaId: persona.id,
              question: question,
              answer: finalAnswer,
              reasoning: finalReasoning,
              metadata: JSON.stringify(parsedMetadata),
              analysis: analysisData ? JSON.stringify(analysisData) : null,
            } as any,
          });

          await prisma.message.create({
            data: {
              sessionId: session.id,
              sender: persona.name,
              content: finalAnswer,
              metadata: JSON.stringify(parsedMetadata),
            },
          });

          return {
            success: true,
            answer: finalAnswer,
            reasoning: finalReasoning,
            persona,
            metadata: parsedMetadata,
            analysis: analysisData,
          };
        } catch (e) {
          console.error(`Persona ${persona.id} failed`, e);
          return { success: false, persona };
        }
      },
      1 // SEQUENTIAL EXECUTION (Concurrency 1)
    );

    // --- REBUTTAL PHASE (New Feature) ---
    // Check if the LAST response disagreed with someone and mentioned them
    const lastResponse = responses[responses.length - 1];
    if (lastResponse && lastResponse.success && lastResponse.answer) {
      const answerText = lastResponse.answer.toLowerCase();
      const disagreementKeywords = [
        "disagree",
        "not sure",
        "wrong",
        "however",
        "but",
        "actually",
        "don't think",
        "skeptical",
      ];
      const isDisagreement = disagreementKeywords.some((kw) =>
        answerText.includes(kw)
      );

      if (isDisagreement) {
        // Check if any OTHER persona was mentioned
        const mentionedPersona = project.personas.find(
          (p: any) =>
            p.id !== lastResponse.persona.id &&
            answerText.includes(p.name.toLowerCase())
        );

        if (mentionedPersona) {
          // 20% Chance to Rebut
          if (Math.random() < 0.2) {
            console.log(
              `[${phaseName}] Rebuttal triggered: ${mentionedPersona.name} responding to ${lastResponse.persona.name}...`
            );

            const rebuttalContext = `
REBUTTAL CONTEXT:
${lastResponse.persona.name} just said: "${lastResponse.answer}"
They mentioned you and seemed to disagree.

INSTRUCTION:
- Respond directly to ${lastResponse.persona.name}.
- Defend your point or clarify.
- Keep it short (1-2 sentences).
- Be natural.
`;
            try {
              const rebuttalRes = await getPersonaResponse(
                mentionedPersona.id,
                "Respond to the disagreement",
                rebuttalContext,
                false
              );

              if (rebuttalRes.answer) {
                transcript.push(
                  `${mentionedPersona.name} (rebuttal): ${rebuttalRes.answer}`
                );
                await prisma.message.create({
                  data: {
                    sessionId: session.id,
                    sender: `${mentionedPersona.name} (rebuttal)`,
                    content: rebuttalRes.answer,
                  },
                });
              }
            } catch (e) {
              console.warn(`Rebuttal failed for ${mentionedPersona.name}`, e);
            }
          }
        }
      }
    }

    // 4. REACTION PHASE - Group Dynamics (30% chance per question)
    if (Math.random() < 0.3 && responses.filter((r) => r.success).length > 2) {
      console.log(`[${phaseName}] Triggering reaction phase...`);

      // Pick 2 random personas to react
      const successfulResponses = responses.filter((r) => r.success);
      const shuffled = successfulResponses.sort(() => Math.random() - 0.5);
      const reactors = shuffled.slice(0, 2);

      for (const reactor of reactors) {
        const reactionContext = `
RECENT DISCUSSION:
${transcript.slice(-8).join("\n")}

INSTRUCTION: You just heard everyone's responses. Do you have a STRONG reaction to what someone said?
- If you STRONGLY AGREE or DISAGREE with someone, respond naturally
- If you have nothing strong to say, just say "PASS"
- Be conversational: "Wait, I totally disagree with [Name]..." or "Yeah, [Name] is right about..."
- Keep it brief (1-2 sentences)
`;

        try {
          const reactionRes = await getPersonaResponse(
            reactor.persona.id,
            "React to the discussion",
            reactionContext,
            false
          );

          if (
            reactionRes.answer &&
            !reactionRes.answer.includes("PASS") &&
            reactionRes.answer.length > 10
          ) {
            transcript.push(
              `${reactor.persona.name} (reacting): ${reactionRes.answer}`
            );

            await prisma.message.create({
              data: {
                sessionId: session.id,
                sender: `${reactor.persona.name} (reacting)`,
                content: reactionRes.answer,
              },
            });
          }
        } catch (e) {
          console.warn(`Reaction failed for ${reactor.persona.name}`, e);
        }
      }
    }
  } // End of questions loop

  // 4. Generate Insight/Summary for this phase
  console.log(`[${phaseName}] Generating Summary...`);
  const summaryPrompt = `
    Summarize this focus group discussion on "${phaseName}".
    Transcript:
    ${transcript.join("\n")}
    
    Identify key themes, sentiment, and consensus.
    `;

  const summary = await callLLM(
    [
      { role: "system", content: "You are a Research Analyst." },
      { role: "user", content: summaryPrompt },
    ],
    true
  );

  await prisma.insight.create({
    data: {
      sessionId: session.id,
      type: "discussion_summary",
      content: summary,
      confidence: 0.9,
      citations: JSON.stringify([phaseName]),
    },
  });

  // 5. AUTOMATED INSIGHTS (Concerns & Barriers)
  if (phaseName === "Idea Validation" || phaseName === "Positioning Strategy") {
    console.log(`[${phaseName}] Extracting Concerns & Barriers...`);
    const concernsPrompt = `
        Analyze the transcript and extract:
        1. Top 3 Concerns (Specific worries)
        2. Top 3 Barriers to Adoption (Why they won't buy)
        
        Return JSON:
        {
            "concerns": ["Concern 1", "Concern 2", "Concern 3"],
            "barriers": ["Barrier 1", "Barrier 2", "Barrier 3"]
        }
        `;

    try {
      const concernsRes = await callLLM(
        [
          {
            role: "system",
            content: "You are a Research Analyst. Return JSON only.",
          },
          {
            role: "user",
            content:
              concernsPrompt + `\n\nTranscript:\n${transcript.join("\n")}`,
          },
        ],
        true
      );

      const parsedConcerns = JSON.parse(
        concernsRes
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim()
      );

      await prisma.insight.create({
        data: {
          sessionId: session.id,
          type: "concerns_barriers",
          content: JSON.stringify(parsedConcerns),
          confidence: 0.85,
          citations: JSON.stringify(["Transcript Analysis"]),
        },
      });
    } catch (e) {
      console.warn("Failed to extract concerns", e);
    }
  }

  // 6. AGGREGATE ANALYSIS DATA (New Feature)
  console.log(`[${phaseName}] Aggregating analysis metrics...`);
  try {
    // Fetch all responses with analysis data for this session
    const allResponses = await prisma.response.findMany({
      where: { sessionId: session.id },
      select: { analysis: true } as any,
    });

    const analyses = allResponses
      .filter((r: any) => r.analysis)
      .map((r: any) => JSON.parse(r.analysis!));

    if (analyses.length > 0) {
      // Aggregate core metrics
      const aggregated = aggregateAnalysis(analyses);

      await prisma.insight.create({
        data: {
          sessionId: session.id,
          type: "aggregated_metrics",
          content: JSON.stringify(aggregated),
          confidence: 0.95,
          citations: JSON.stringify([`${analyses.length} persona responses`]),
        },
      });

      // Extract validation-specific insights if applicable
      if (phaseName === "Idea Validation") {
        const validationInsights = extractValidationInsights(analyses);
        if (validationInsights) {
          await prisma.insight.create({
            data: {
              sessionId: session.id,
              type: "validation_insights",
              content: JSON.stringify(validationInsights),
              confidence: 0.9,
              citations: JSON.stringify([
                `${analyses.length} validation responses`,
              ]),
            },
          });
        }
      }

      console.log(
        `[${phaseName}] Analysis aggregation complete: ${analyses.length} responses analyzed`
      );
    }
  } catch (e) {
    console.warn("Failed to aggregate analysis data", e);
  }
}
// End of engine.ts
