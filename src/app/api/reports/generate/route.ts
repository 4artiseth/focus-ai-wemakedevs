import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callLLM } from "@/lib/llm/api-client";
import {
  FEATURE_PRIORITIZATION_REPORT_PROMPT,
  PRICING_RESEARCH_REPORT_PROMPT,
  IDEA_VALIDATION_REPORT_PROMPT,
  MARKET_POSITIONING_REPORT_PROMPT,
} from "@/lib/analysis/report-templates";

export const maxDuration = 300; // 5 minutes timeout for report generation

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Fetch session with all related data
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        project: true,
        insights: true,
        messages: true,
        responses: true, // Needed for raw score calculation
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const project = session.project as any;
    const goal = (
      project?.researchGoal ||
      project?.details?.researchGoal ||
      "all"
    ).toLowerCase();
    const isPricing = goal.includes("pricing") || goal.includes("price");
    const isFeature =
      goal.includes("feature") ||
      goal.includes("priorit") ||
      goal.includes("conjoint");
    const isPositioning =
      goal.includes("position") ||
      goal.includes("market") ||
      goal.includes("brand");
    // Default to validation for "all" or "idea" or "validation" goals
    const isValidation =
      goal.includes("validation") ||
      goal.includes("idea") ||
      goal === "all" ||
      (!isPricing && !isFeature && !isPositioning);

    // Common Data
    const companyName = project?.name || "Company";
    const industry = project?.details?.industry || "Tech";
    const productInfo = project?.details?.description || "Product";
    const targetAudience =
      project?.details?.targetAudience || "General Audience";
    const currentDate = new Date().toLocaleDateString();
    const personaCount = project?.personas?.length || 0;

    let prompt = "";

    // Helper for global replacement with flexible whitespace
    const replaceAll = (str: string, key: string, value: string) => {
      // Matches {{key}}, {{ key }}, { { key } }, etc.
      const regex = new RegExp(`\\{\\s*\\{\\s*${key}\\s*\\}\\s*\\}`, "g");
      return str.replace(regex, () => value);
    };

    if (isValidation) {
      // --- IDEA VALIDATION REPORT LOGIC ---
      const validationInsights = session.insights.find(
        (i: any) => i.type === "validation_insights"
      );
      const aggregatedMetrics = session.insights.find(
        (i: any) => i.type === "aggregated_metrics"
      );
      const concernsBarriers = session.insights.find(
        (i: any) => i.type === "concerns_barriers"
      );

      let avgProblemIntensity = "Data not available";
      let avgConceptAppeal = "Data not available";
      let avgAdoptionLikelihood = "Data not available";
      let topBarriers = "[]";
      let featurePriorities = "{}";
      let emotionalSentiment = "{}";
      let topEmotions = "[]";
      let keyQuotes = "[]";

      // Parse Validation Insights
      if (validationInsights) {
        try {
          const vi = JSON.parse(validationInsights.content);
          if (vi.avg_problem_reality)
            avgProblemIntensity = vi.avg_problem_reality.toString();
          if (vi.avg_concept_appeal)
            avgConceptAppeal = vi.avg_concept_appeal.toString();
          if (vi.avg_adoption_likelihood)
            avgAdoptionLikelihood = vi.avg_adoption_likelihood.toString();
          if (vi.top_barriers) topBarriers = JSON.stringify(vi.top_barriers);
          if (vi.must_have_features) {
            featurePriorities = JSON.stringify({
              must_have: vi.must_have_features.map((f: any) => f.feature),
              nice_to_have: [], // AI to infer
              unnecessary: [], // AI to infer
            });
          }
        } catch (e) {
          console.error("Error parsing validation insights", e);
        }
      }

      // Parse Aggregated Metrics
      if (aggregatedMetrics) {
        try {
          const am = JSON.parse(aggregatedMetrics.content);
          if (am.top_emotions) topEmotions = JSON.stringify(am.top_emotions);
          if (am.key_quotes) keyQuotes = JSON.stringify(am.key_quotes);

          // Infer sentiment from emotions (simple heuristic)
          const positiveEmotions = [
            "excited",
            "happy",
            "curious",
            "hopeful",
            "interested",
          ];
          const negativeEmotions = [
            "skeptical",
            "confused",
            "angry",
            "disappointed",
            "worried",
          ];
          let positive = 0,
            negative = 0,
            neutral = 0;

          am.top_emotions.forEach((e: any) => {
            if (positiveEmotions.includes(e.emotion.toLowerCase()))
              positive += e.percentage;
            else if (negativeEmotions.includes(e.emotion.toLowerCase()))
              negative += e.percentage;
            else neutral += e.percentage;
          });

          emotionalSentiment = JSON.stringify({ positive, neutral, negative });
        } catch (e) {
          console.error("Error parsing aggregated metrics", e);
        }
      }

      // Parse Concerns/Barriers (if validation insights missed them)
      if (concernsBarriers && topBarriers === "[]") {
        try {
          const cb = JSON.parse(concernsBarriers.content);
          if (cb.barriers)
            topBarriers = JSON.stringify(
              cb.barriers.map((b: string) => ({
                barrier: b,
                mentions: 1,
                percentage: 10,
              }))
            );
        } catch (e) {}
      }

      // Raw Scores from Responses (for arrays)
      const problemScores = session.responses
        .map((r: any) => {
          try {
            return JSON.parse(r.analysis).core_metrics.pain_intensity;
          } catch (e) {
            return null;
          }
        })
        .filter((s: any) => s !== null);

      const appealScores = session.responses
        .map((r: any) => {
          try {
            return JSON.parse(r.analysis).session_specific.validation
              .concept_appeal;
          } catch (e) {
            return null;
          }
        })
        .filter((s: any) => s !== null);

      const adoptionScores = session.responses
        .map((r: any) => {
          try {
            return JSON.parse(r.analysis).session_specific.validation
              .adoption_likelihood;
          } catch (e) {
            return null;
          }
        })
        .filter((s: any) => s !== null);

      // Transcript
      const fullTranscript = session.messages
        .sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        .map((m: any) => `${m.sender}: ${m.content}`)
        .join("\n\n");

      prompt = IDEA_VALIDATION_REPORT_PROMPT;
      prompt = replaceAll(prompt, "companyName", companyName);
      prompt = replaceAll(prompt, "industry", industry);
      prompt = replaceAll(prompt, "productInfo", productInfo);
      prompt = replaceAll(prompt, "productDescription", productInfo); // Alias
      prompt = replaceAll(prompt, "targetAudience", targetAudience);
      prompt = replaceAll(
        prompt,
        "problemStatement",
        (project as any)?.details?.problem ||
          project?.description ||
          "the core problem"
      );
      prompt = replaceAll(prompt, "currentDate", currentDate);
      prompt = replaceAll(prompt, "persona_count", personaCount.toString());

      prompt = replaceAll(
        prompt,
        "average_problem_intensity",
        avgProblemIntensity
      );
      prompt = replaceAll(prompt, "average_concept_appeal", avgConceptAppeal);
      prompt = replaceAll(
        prompt,
        "average_adoption_likelihood",
        avgAdoptionLikelihood
      );

      prompt = replaceAll(
        prompt,
        "problem_intensity_scores",
        JSON.stringify(problemScores)
      );
      prompt = replaceAll(
        prompt,
        "concept_appeal_scores",
        JSON.stringify(appealScores)
      );
      prompt = replaceAll(
        prompt,
        "adoption_likelihood_scores",
        JSON.stringify(adoptionScores)
      );

      prompt = replaceAll(prompt, "adoption_barriers", topBarriers);
      prompt = replaceAll(prompt, "feature_priorities", featurePriorities);
      prompt = replaceAll(prompt, "emotional_sentiment", emotionalSentiment);
      prompt = replaceAll(prompt, "top_emotions", topEmotions);
      prompt = replaceAll(prompt, "key_quotes", keyQuotes);

      prompt = replaceAll(
        prompt,
        "validation_transcript",
        fullTranscript.substring(0, 40000)
      );

      // Fill remaining with "AI to infer"
      prompt = replaceAll(
        prompt,
        "problem_frequency",
        "Data not available - AI to infer from transcript"
      );
    } else if (isPricing) {
      // --- PRICING REPORT LOGIC ---
      const pricingVW = session.insights.find(
        (i: any) => i.type === "pricing_vw"
      );
      const pricingGG = session.insights.find(
        (i: any) => i.type === "pricing_gg"
      );
      const pricingReport = session.insights.find(
        (i: any) => i.type === "pricing_report"
      );

      let vwLow = "Data not available";
      let vwHigh = "Data not available";
      let vwOptimal = "Data not available";
      let ggMaxPrice = "Data not available";
      let ggElasticity = "Data not available";
      let ggPoints = "Data not available";

      // Parse VW Data
      if (pricingVW) {
        try {
          const vw = JSON.parse(pricingVW.content);
          if (vw.floor_price) vwLow = vw.floor_price.toString();
          if (vw.ceiling_price) vwHigh = vw.ceiling_price.toString();
          if (vw.optimal_price) vwOptimal = vw.optimal_price.toString();
        } catch (e) {}
      }

      // Parse GG Data
      if (pricingGG) {
        try {
          const gg = JSON.parse(pricingGG.content);
          if (gg.revenue_maximizing_price)
            ggMaxPrice = gg.revenue_maximizing_price.toString();
          if (gg.price_elasticity)
            ggElasticity = gg.price_elasticity.toString();
          if (gg.demand_curve)
            ggPoints = JSON.stringify(gg.demand_curve, null, 2);
        } catch (e) {}
      }

      // Transcripts (Split by type if possible, otherwise use full)
      // Ideally we'd filter messages by phase, but for now we'll pass the full transcript to both
      // and let the LLM extract relevant parts or just use the full context.
      const fullTranscript = session.messages
        .sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        .map((m: any) => `${m.sender}: ${m.content}`)
        .join("\n\n");

      prompt = PRICING_RESEARCH_REPORT_PROMPT;
      prompt = replaceAll(prompt, "companyName", companyName);
      prompt = replaceAll(prompt, "industry", industry);
      prompt = replaceAll(prompt, "productInfo", productInfo);
      prompt = replaceAll(prompt, "targetAudience", targetAudience);
      prompt = replaceAll(prompt, "pricingModel", "Subscription/License"); // Infer or default
      prompt = replaceAll(prompt, "currentDate", currentDate);
      prompt = replaceAll(prompt, "personaCount", personaCount.toString());
      prompt = replaceAll(prompt, "vw_low_end", vwLow);
      prompt = replaceAll(prompt, "vw_high_end", vwHigh);
      prompt = replaceAll(prompt, "vw_optimal", vwOptimal);
      prompt = replaceAll(
        prompt,
        "vw_transcript",
        fullTranscript.substring(0, 25000)
      );
      prompt = replaceAll(prompt, "gg_max_price", ggMaxPrice);
      prompt = replaceAll(prompt, "gg_elasticity", ggElasticity);
      prompt = replaceAll(prompt, "gg_optimal_revenue_points", ggPoints);
      prompt = replaceAll(
        prompt,
        "gg_transcript",
        fullTranscript.substring(0, 25000)
      );

      // Fill remaining input fields
      prompt = replaceAll(
        prompt,
        "competitors",
        "Data not available - AI to infer"
      );
    } else if (isPositioning) {
      // --- MARKET POSITIONING REPORT LOGIC ---
      const positioningInsight = session.insights.find(
        (i: any) => i.type === "positioning_insights"
      );
      const brandArchetype = session.insights.find(
        (i: any) => i.type === "brand_archetype"
      );
      const competitiveAnalysis = session.insights.find(
        (i: any) => i.type === "competitive_analysis"
      );

      let perceptualMap = "Data not available - AI to infer from transcript";
      let brandStrategy = "Data not available - AI to infer from transcript";
      let emotionalDriver = "Data not available - AI to infer from transcript";
      let wordAssociations = "Data not available - AI to infer from transcript";
      let brandArchetypeVote =
        "Data not available - AI to infer from transcript";
      let ladderingInsights =
        "Data not available - AI to infer from transcript";
      let positioningStatement =
        "Data not available - AI to infer from transcript";
      let taglinePreferences =
        "Data not available - AI to infer from transcript";
      let competitiveData = "Data not available - AI to infer from transcript";

      // Parse positioning insights
      if (positioningInsight) {
        try {
          const pi = JSON.parse(positioningInsight.content);
          if (pi.perceptual_map)
            perceptualMap = JSON.stringify(pi.perceptual_map);
          if (pi.positioning_statement)
            positioningStatement = pi.positioning_statement;
          if (pi.emotional_driver) emotionalDriver = pi.emotional_driver;
          if (pi.laddering) ladderingInsights = JSON.stringify(pi.laddering);
        } catch (e) {
          console.error("Error parsing positioning insights", e);
        }
      }

      // Parse brand archetype
      if (brandArchetype) {
        try {
          const ba = JSON.parse(brandArchetype.content);
          if (ba.archetype) brandArchetypeVote = JSON.stringify(ba);
          if (ba.word_associations)
            wordAssociations = JSON.stringify(ba.word_associations);
          if (ba.taglines) taglinePreferences = JSON.stringify(ba.taglines);
        } catch (e) {
          console.error("Error parsing brand archetype", e);
        }
      }

      // Parse competitive analysis
      if (competitiveAnalysis) {
        try {
          competitiveData = competitiveAnalysis.content;
        } catch (e) {}
      }

      // Full transcript
      const fullTranscript = session.messages
        .sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        .map((m: any) => `${m.sender}: ${m.content}`)
        .join("\n\n");

      prompt = MARKET_POSITIONING_REPORT_PROMPT;
      prompt = replaceAll(prompt, "companyName", companyName);
      prompt = replaceAll(prompt, "industry", industry);
      prompt = replaceAll(prompt, "productInfo", productInfo);
      prompt = replaceAll(prompt, "targetAudience", targetAudience);
      prompt = replaceAll(prompt, "currentDate", currentDate);
      prompt = replaceAll(prompt, "persona_count", personaCount.toString());

      prompt = replaceAll(prompt, "perceptual_map", perceptualMap);
      prompt = replaceAll(prompt, "brand_strategy", brandStrategy);
      prompt = replaceAll(prompt, "emotional_driver", emotionalDriver);
      prompt = replaceAll(prompt, "word_associations", wordAssociations);
      prompt = replaceAll(prompt, "brand_archetype_vote", brandArchetypeVote);
      prompt = replaceAll(prompt, "laddering_insights", ladderingInsights);
      prompt = replaceAll(
        prompt,
        "positioning_statement",
        positioningStatement
      );
      prompt = replaceAll(prompt, "tagline_preferences", taglinePreferences);
      prompt = replaceAll(prompt, "competitive_analysis", competitiveData);
      prompt = replaceAll(
        prompt,
        "positioning_transcript",
        fullTranscript.substring(0, 40000)
      );
    } else {
      // --- FEATURE REPORT LOGIC (Existing) ---
      const conjointReport = session.insights.find(
        (i: any) => i.type === "conjoint_report"
      );
      const conjointKano = session.insights.find(
        (i: any) => i.type === "conjoint_kano"
      );

      // Parse Kano Data
      let basicFeatures = "Data not available";
      let performanceFeatures = "Data not available";
      let delighterFeatures = "Data not available";

      if (conjointKano) {
        try {
          const kano = JSON.parse(conjointKano.content);
          if (kano.basic) basicFeatures = kano.basic.join(", ");
          if (kano.performance)
            performanceFeatures = kano.performance.join(", ");
          if (kano.delighters) delighterFeatures = kano.delighters.join(", ");
        } catch (e) {
          console.error("Error parsing Kano data", e);
        }
      }

      // Parse Report Data for MVP
      let mvpLaunch = "Data not available";
      let mvpNext = "Data not available";
      let mvpFuture = "Data not available";
      let lifeboatVotes = "Data not available";

      if (conjointReport) {
        const content = conjointReport.content;

        // Extract MVP sections using regex
        const mvpMatch = content.match(
          /MVP Features?:?\s*\n([\s\S]*?)(?:\n\n|Nice-to-Have|$)/i
        );
        if (mvpMatch) mvpLaunch = mvpMatch[1].trim();

        const niceMatch = content.match(
          /Nice-to-Have:?\s*\n([\s\S]*?)(?:\n\n|Unnecessary|$)/i
        );
        if (niceMatch) mvpNext = niceMatch[1].trim();

        const unnecessaryMatch = content.match(
          /Unnecessary:?\s*\n([\s\S]*?)(?:\n\n|$)/i
        );
        if (unnecessaryMatch) mvpFuture = unnecessaryMatch[1].trim();
      }

      // Simulate Lifeboat Votes if not present (based on MVP ranking)
      if (mvpLaunch !== "Data not available") {
        const features = mvpLaunch
          .split("\n")
          .map((l) => l.replace(/^[-•]\s*/, "").trim())
          .filter((f) => f);
        const votes = features.map((f, i) => ({
          feature: f,
          votes: Math.max(15 - i * 2, 1),
          total: 15,
        }));
        lifeboatVotes = JSON.stringify(votes, null, 2);
      }

      // Transcript
      const transcript = session.messages
        .sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        .map((m: any) => `${m.sender}: ${m.content}`)
        .join("\n\n");

      // Replace Placeholders
      prompt = FEATURE_PRIORITIZATION_REPORT_PROMPT.replace(
        "{{ companyName }}",
        companyName
      )
        .replace("{{ industry }}", industry)
        .replace("{{ productInfo }}", productInfo)
        .replace("{{ targetAudience }}", targetAudience)
        .replace("{{ currentDate }}", currentDate)
        .replace("{{ lifeboat_vote_counts }}", lifeboatVotes)
        .replace("{{ basic_features }}", basicFeatures)
        .replace("{{ performance_features }}", performanceFeatures)
        .replace("{{ delighter_features }}", delighterFeatures)
        .replace("{{ mvp_launch_features }}", mvpLaunch)
        .replace("{{ mvp_next_phase_features }}", mvpNext)
        .replace("{{ mvp_future_features }}", mvpFuture)
        .replace("{{ conjoint_transcript }}", transcript.substring(0, 50000));

      // Fill remaining placeholders
      prompt = prompt
        .replace(
          "{{ feature_utility_scores }}",
          "Data not available - AI to infer from transcript"
        )
        .replace(
          "{{ bundle_preferences }}",
          "Data not available - AI to infer from transcript"
        )
        .replace(
          "{{ deal_breaker_data }}",
          "Data not available - AI to infer from transcript"
        )
        .replace(
          "{{ churn_risk_feature }}",
          "Data not available - AI to infer from transcript"
        )
        .replace(
          "{{ churn_likelihood }}",
          "Data not available - AI to infer from transcript"
        )
        .replace(
          "{{ churn_risk_description }}",
          "Data not available - AI to infer from transcript"
        );
    }

    // Call LLM
    const html = await callLLM([
      {
        role: "system",
        content: "You are a Senior Product Strategy Consultant.",
      },
      { role: "user", content: prompt },
    ]);

    return NextResponse.json({ html });
  } catch (error: any) {
    console.error("Report generation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
