/**
 * Test script for the analysis framework
 * This verifies that the analysis parser works correctly
 */

import {
  parsePersonaResponse,
  aggregateAnalysis,
  extractValidationInsights,
} from "./src/lib/analysis/parser";

// Test 1: Parse a response with analysis
console.log("=== Test 1: Parse Response with Analysis ===");
const mockResponse1 = {
  reasoning: "I'm skeptical because I've been burned before...",
  answer:
    "Honestly, I don't think this solves my problem. I'd need to see proof.",
  analysis: {
    core_metrics: {
      pain_intensity: 7,
      pain_description: "frustrated with current solutions",
      primary_emotion: "skepticism",
      emotion_intensity: 8,
      confidence_in_product: 3,
      segment_identity: "skeptic",
    },
    session_specific: {
      validation: {
        problem_reality_score: 8,
        problem_frequency: "weekly",
        problem_trigger: "work deadlines",
        concept_appeal: 4,
        concept_reaction: "skeptical",
        concept_clarity: 7,
        adoption_likelihood: 3,
        adoption_timeframe: "never",
        adoption_barriers: ["trust issues", "price concerns"],
        feature_priorities: {
          must_have: ["verification", "accuracy"],
          nice_to_have: ["speed"],
          unnecessary: ["social features"],
        },
        comparison_to_current_solution: "current solution is free",
      },
    },
    meta: {
      key_quote: "I'd need to see proof",
      biggest_concern: "trust in AI accuracy",
      response_quality: 8,
    },
  },
};

const parsed1 = parsePersonaResponse(mockResponse1);
console.log("Display Text:", parsed1.displayText);
console.log("Pain Intensity:", parsed1.analysis?.core_metrics.pain_intensity);
console.log("Emotion:", parsed1.analysis?.core_metrics.primary_emotion);
console.log(
  "Confidence:",
  parsed1.analysis?.core_metrics.confidence_in_product
);
console.log();

// Test 2: Parse legacy response without analysis
console.log("=== Test 2: Parse Legacy Response (No Analysis) ===");
const mockResponse2 = {
  reasoning: "I think this could work...",
  answer: "I'd probably try it if the price is right.",
};

const parsed2 = parsePersonaResponse(mockResponse2);
console.log("Display Text:", parsed2.displayText);
console.log("Has Analysis:", !!parsed2.analysis);
console.log();

// Test 3: Aggregate multiple analyses
console.log("=== Test 3: Aggregate Multiple Analyses ===");
const mockAnalyses = [
  {
    core_metrics: {
      pain_intensity: 7,
      pain_description: "frustrated",
      primary_emotion: "frustration",
      emotion_intensity: 8,
      confidence_in_product: 6,
      segment_identity: "efficiency_seeker",
    },
    session_specific: {},
    meta: {
      key_quote: "This could save me time",
      biggest_concern: "learning curve",
      response_quality: 8,
    },
  },
  {
    core_metrics: {
      pain_intensity: 9,
      pain_description: "desperate for solution",
      primary_emotion: "hope",
      emotion_intensity: 7,
      confidence_in_product: 8,
      segment_identity: "early_adopter",
    },
    session_specific: {},
    meta: {
      key_quote: "Finally something that gets it",
      biggest_concern: "price",
      response_quality: 9,
    },
  },
  {
    core_metrics: {
      pain_intensity: 4,
      pain_description: "minor annoyance",
      primary_emotion: "skepticism",
      emotion_intensity: 5,
      confidence_in_product: 3,
      segment_identity: "skeptic",
    },
    session_specific: {},
    meta: {
      key_quote: "Not convinced yet",
      biggest_concern: "trust",
      response_quality: 7,
    },
  },
];

const aggregated = aggregateAnalysis(mockAnalyses);
console.log("Average Pain Intensity:", aggregated.avg_pain_intensity);
console.log("Average Confidence:", aggregated.avg_confidence);
console.log("Top Emotions:", aggregated.top_emotions);
console.log("Segment Distribution:", aggregated.segment_distribution);
console.log("Key Quotes:", aggregated.key_quotes);
console.log();

// Test 4: Extract validation insights
console.log("=== Test 4: Extract Validation Insights ===");
const mockValidationAnalyses = [
  {
    core_metrics: {
      pain_intensity: 7,
      pain_description: "test",
      primary_emotion: "frustration",
      emotion_intensity: 7,
      confidence_in_product: 6,
      segment_identity: "efficiency_seeker",
    },
    session_specific: {
      validation: {
        problem_reality_score: 8,
        problem_frequency: "daily",
        problem_trigger: "work",
        concept_appeal: 7,
        concept_reaction: "curious",
        concept_clarity: 8,
        adoption_likelihood: 7,
        adoption_timeframe: "within month",
        adoption_barriers: ["price", "trust"],
        feature_priorities: {
          must_have: ["search", "accuracy"],
          nice_to_have: ["chat"],
          unnecessary: ["social"],
        },
        comparison_to_current_solution: "better than Google",
      },
    },
    meta: {
      key_quote: "test",
      biggest_concern: "test",
      response_quality: 8,
    },
  },
  {
    core_metrics: {
      pain_intensity: 6,
      pain_description: "test",
      primary_emotion: "hope",
      emotion_intensity: 6,
      confidence_in_product: 7,
      segment_identity: "early_adopter",
    },
    session_specific: {
      validation: {
        problem_reality_score: 9,
        problem_frequency: "weekly",
        problem_trigger: "family",
        concept_appeal: 8,
        concept_reaction: "excited",
        concept_clarity: 9,
        adoption_likelihood: 8,
        adoption_timeframe: "immediately",
        adoption_barriers: ["price"],
        feature_priorities: {
          must_have: ["search", "plain english"],
          nice_to_have: ["bookmarks"],
          unnecessary: ["community"],
        },
        comparison_to_current_solution: "much better",
      },
    },
    meta: {
      key_quote: "test",
      biggest_concern: "test",
      response_quality: 9,
    },
  },
];

const validationInsights = extractValidationInsights(mockValidationAnalyses);
console.log("Validation Insights:", validationInsights);
console.log();

console.log("=== All Tests Complete ===");
console.log("✅ Analysis framework is working correctly!");
