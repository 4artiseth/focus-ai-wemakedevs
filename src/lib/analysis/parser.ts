/**
 * Analysis Parser - Extracts structured analysis data from persona responses
 *
 * This module handles the extraction and validation of hidden analysis tags
 * that personas include in their responses for dashboard metrics.
 */

export interface CoreMetrics {
  pain_intensity: number;
  pain_description: string;
  primary_emotion: string;
  emotion_intensity: number;
  confidence_in_product: number;
  segment_identity: string;
}

export interface ValidationAnalysis {
  problem_reality_score: number;
  problem_frequency: string;
  problem_trigger: string;
  concept_appeal: number;
  concept_reaction: string;
  concept_clarity: number;
  adoption_likelihood: number;
  adoption_timeframe: string;
  adoption_barriers: string[];
  feature_priorities: {
    must_have: string[];
    nice_to_have: string[];
    unnecessary: string[];
  };
  comparison_to_current_solution: string;
}

export interface PricingPSMAnalysis {
  too_cheap_reasoning: string;
  bargain_reasoning: string;
  expensive_reasoning: string;
  too_expensive_reasoning: string;
  willingness_at_anchor: string;
  price_sensitivity: string;
  competitor_price_reference: string;
}

export interface PricingGGAnalysis {
  maximum_acceptable_price: string;
  switch_point_trigger: string;
  price_elasticity_perception: string;
  premium_feature_justification: string;
}

export interface FeaturePriorityAnalysis {
  lifeboat_saves: string[];
  lifeboat_reasoning: string;
  bundle_choice: string;
  bundle_reasoning: string;
  deal_breakers_if_removed: Array<{
    feature: string;
    would_cancel: boolean;
    intensity: number;
  }>;
  feature_classifications: {
    basic_expectations: string[];
    performance_drivers: string[];
    delighters: string[];
  };
  mvp_recommendation: string;
}

export interface PositioningAnalysis {
  perceptual_map: {
    x_price: number;
    y_complexity: number;
    closest_competitor: string;
    white_space_opportunity: string;
  };
  word_associations: {
    words_we_should_own: string[];
    words_competitors_own: Record<string, string>;
  };
  laddering: {
    feature_level: string;
    functional_benefit: string;
    emotional_driver: string;
  };
  brand_archetype_vote: string;
  brand_archetype_reasoning: string;
  positioning_statement_elements: {
    target: string;
    need: string;
    category: string;
    benefit: string;
    differentiation: string;
  };
  tagline_preference: string;
}

export interface MetaAnalysis {
  key_quote: string;
  biggest_concern: string;
  response_quality: number;
}

export interface StructuredAnalysis {
  core_metrics: CoreMetrics;
  session_specific:
    | { validation?: ValidationAnalysis }
    | { pricing_psm?: PricingPSMAnalysis }
    | { pricing_gg?: PricingGGAnalysis }
    | { feature_priority?: FeaturePriorityAnalysis }
    | { positioning?: PositioningAnalysis }
    | Record<string, any>;
  meta: MetaAnalysis;
}

export interface ParsedResponse {
  displayText: string;
  reasoning?: string;
  analysis?: StructuredAnalysis;
  rawMetadata?: any;
}

/**
 * Parse a persona response and extract analysis data
 */
export function parsePersonaResponse(rawResponse: any): ParsedResponse {
  // Handle string responses (legacy format)
  if (typeof rawResponse === "string") {
    return {
      displayText: rawResponse,
      analysis: undefined,
    };
  }

  // Handle JSON responses
  if (typeof rawResponse === "object") {
    const result: ParsedResponse = {
      displayText: rawResponse.answer || JSON.stringify(rawResponse),
      reasoning: rawResponse.reasoning,
      rawMetadata: rawResponse.metadata || rawResponse,
    };

    // Extract analysis - check multiple locations where it might be
    // 1. Directly on response (from prompt override)
    // 2. Inside metadata (from getPersonaResponse wrapper)
    // 3. Inside metadata.analysis (nested)
    const analysisSource =
      rawResponse.analysis ||
      rawResponse.metadata?.analysis ||
      (rawResponse.metadata && typeof rawResponse.metadata === "object"
        ? rawResponse.metadata
        : null
      )?.analysis;

    if (analysisSource) {
      try {
        result.analysis = validateAnalysis(analysisSource);
        console.log("[ANALYSIS] Successfully extracted analysis data");
      } catch (e) {
        console.warn("[ANALYSIS] Invalid analysis structure:", e);
      }
    } else {
      // Debug: Log what we received to help diagnose
      console.log(
        "[ANALYSIS] No analysis found in response. Keys:",
        Object.keys(rawResponse)
      );
      if (rawResponse.metadata) {
        console.log(
          "[ANALYSIS] Metadata keys:",
          Object.keys(rawResponse.metadata)
        );
      }
    }

    return result;
  }

  // Fallback
  return {
    displayText: String(rawResponse),
  };
}

/**
 * Validate and normalize analysis structure
 */
function validateAnalysis(analysis: any): StructuredAnalysis {
  // Ensure core structure exists
  const validated: StructuredAnalysis = {
    core_metrics: {
      pain_intensity: clamp(analysis.core_metrics?.pain_intensity, 1, 10, 5),
      pain_description:
        analysis.core_metrics?.pain_description || "Not specified",
      primary_emotion: analysis.core_metrics?.primary_emotion || "neutral",
      emotion_intensity: clamp(
        analysis.core_metrics?.emotion_intensity,
        1,
        10,
        5
      ),
      confidence_in_product: clamp(
        analysis.core_metrics?.confidence_in_product,
        1,
        10,
        5
      ),
      segment_identity:
        analysis.core_metrics?.segment_identity || "unclassified",
    },
    session_specific: analysis.session_specific || {},
    meta: {
      key_quote: analysis.meta?.key_quote || "",
      biggest_concern: analysis.meta?.biggest_concern || "",
      response_quality: clamp(analysis.meta?.response_quality, 1, 10, 7),
    },
  };

  return validated;
}

/**
 * Clamp a number between min and max, with fallback
 */
function clamp(value: any, min: number, max: number, fallback: number): number {
  const num = Number(value);
  if (isNaN(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

/**
 * Aggregate analysis data across multiple responses
 */
export function aggregateAnalysis(
  analyses: StructuredAnalysis[]
): AggregatedMetrics {
  if (analyses.length === 0) {
    return {
      avg_pain_intensity: 0,
      avg_emotion_intensity: 0,
      avg_confidence: 0,
      top_emotions: [],
      segment_distribution: {},
      key_quotes: [],
      top_concerns: [],
    };
  }

  // Calculate averages
  const avg_pain_intensity =
    analyses.reduce((sum, a) => sum + a.core_metrics.pain_intensity, 0) /
    analyses.length;
  const avg_emotion_intensity =
    analyses.reduce((sum, a) => sum + a.core_metrics.emotion_intensity, 0) /
    analyses.length;
  const avg_confidence =
    analyses.reduce((sum, a) => sum + a.core_metrics.confidence_in_product, 0) /
    analyses.length;

  // Count emotions
  const emotionCounts: Record<string, number> = {};
  analyses.forEach((a) => {
    const emotion = a.core_metrics.primary_emotion;
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });
  const top_emotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: (count / analyses.length) * 100,
    }));

  // Count segments
  const segmentCounts: Record<string, number> = {};
  analyses.forEach((a) => {
    const segment = a.core_metrics.segment_identity;
    segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
  });
  const segment_distribution = Object.fromEntries(
    Object.entries(segmentCounts).map(([segment, count]) => [
      segment,
      (count / analyses.length) * 100,
    ])
  );

  // Collect quotes and concerns
  const key_quotes = analyses
    .map((a) => a.meta.key_quote)
    .filter((q) => q && q.length > 0);
  const top_concerns = analyses
    .map((a) => a.meta.biggest_concern)
    .filter((c) => c && c.length > 0);

  return {
    avg_pain_intensity: Math.round(avg_pain_intensity * 10) / 10,
    avg_emotion_intensity: Math.round(avg_emotion_intensity * 10) / 10,
    avg_confidence: Math.round(avg_confidence * 10) / 10,
    top_emotions,
    segment_distribution,
    key_quotes,
    top_concerns,
  };
}

export interface AggregatedMetrics {
  avg_pain_intensity: number;
  avg_emotion_intensity: number;
  avg_confidence: number;
  top_emotions: Array<{ emotion: string; count: number; percentage: number }>;
  segment_distribution: Record<string, number>;
  key_quotes: string[];
  top_concerns: string[];
}

/**
 * Extract validation-specific insights
 */
export function extractValidationInsights(
  analyses: StructuredAnalysis[]
): ValidationInsights | null {
  const validationData = analyses
    .map((a) => (a.session_specific as any).validation)
    .filter((v) => v !== undefined);

  if (validationData.length === 0) return null;

  const avg_problem_reality =
    validationData.reduce((sum, v) => sum + (v.problem_reality_score || 0), 0) /
    validationData.length;
  const avg_concept_appeal =
    validationData.reduce((sum, v) => sum + (v.concept_appeal || 0), 0) /
    validationData.length;
  const avg_adoption_likelihood =
    validationData.reduce((sum, v) => sum + (v.adoption_likelihood || 0), 0) /
    validationData.length;

  // Aggregate barriers
  const allBarriers = validationData.flatMap((v) => v.adoption_barriers || []);
  const barrierCounts: Record<string, number> = {};
  allBarriers.forEach((b) => {
    barrierCounts[b] = (barrierCounts[b] || 0) + 1;
  });
  const top_barriers = Object.entries(barrierCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([barrier, count]) => ({ barrier, count }));

  // Aggregate must-have features
  const allMustHaves = validationData.flatMap(
    (v) => v.feature_priorities?.must_have || []
  );
  const mustHaveCounts: Record<string, number> = {};
  allMustHaves.forEach((f) => {
    mustHaveCounts[f] = (mustHaveCounts[f] || 0) + 1;
  });
  const must_have_features = Object.entries(mustHaveCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([feature, votes]) => ({ feature, votes }));

  return {
    avg_problem_reality: Math.round(avg_problem_reality * 10) / 10,
    avg_concept_appeal: Math.round(avg_concept_appeal * 10) / 10,
    avg_adoption_likelihood: Math.round(avg_adoption_likelihood * 10) / 10,
    top_barriers,
    must_have_features,
  };
}

export interface ValidationInsights {
  avg_problem_reality: number;
  avg_concept_appeal: number;
  avg_adoption_likelihood: number;
  top_barriers: Array<{ barrier: string; count: number }>;
  must_have_features: Array<{ feature: string; votes: number }>;
}
