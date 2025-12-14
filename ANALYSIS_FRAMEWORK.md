# Analysis Framework Documentation

## Overview

The Analysis Framework adds structured, machine-readable analysis data to every persona response without breaking the existing conversational UI. This enables accurate dashboard metrics and insights without pattern matching or guesswork.

## How It Works

### 1. Dual-Output System

Every persona now provides TWO outputs simultaneously:

- **Public Output**: Natural, conversational response shown to users
- **Analysis Output**: Structured JSON data captured for analytics (hidden from UI)

### 2. Core Structure

All responses include these base metrics:

```json
{
  "reasoning": "Internal monologue...",
  "answer": "Public response...",
  "analysis": {
    "core_metrics": {
      "pain_intensity": 7,
      "pain_description": "frustrated with current solutions",
      "primary_emotion": "frustration",
      "emotion_intensity": 8,
      "confidence_in_product": 6,
      "segment_identity": "efficiency_seeker"
    },
    "session_specific": {
      // Research-type specific fields
    },
    "meta": {
      "key_quote": "most memorable line",
      "biggest_concern": "top worry",
      "response_quality": 8
    }
  }
}
```

### 3. Research-Specific Fields

#### Idea Validation

```json
"session_specific": {
  "validation": {
    "problem_reality_score": 8,
    "problem_frequency": "weekly",
    "problem_trigger": "work deadlines",
    "concept_appeal": 7,
    "concept_reaction": "curious",
    "concept_clarity": 8,
    "adoption_likelihood": 7,
    "adoption_timeframe": "within month",
    "adoption_barriers": ["price", "trust"],
    "feature_priorities": {
      "must_have": ["search", "accuracy"],
      "nice_to_have": ["chat"],
      "unnecessary": ["social"]
    },
    "comparison_to_current_solution": "better than Google"
  }
}
```

#### Van Westendorp Pricing

```json
"session_specific": {
  "pricing_psm": {
    "too_cheap_reasoning": "would assume low quality",
    "bargain_reasoning": "feels fair for value",
    "expensive_reasoning": "makes me compare competitors",
    "too_expensive_reasoning": "cannot justify cost",
    "willingness_at_anchor": "LIKELY",
    "price_sensitivity": "MODERATE",
    "competitor_price_reference": "Competitor at $99 feels cheap"
  }
}
```

#### Gabor-Granger Pricing

```json
"session_specific": {
  "pricing_gg": {
    "maximum_acceptable_price": "$199",
    "switch_point_trigger": "cheaper competitor becomes attractive",
    "price_elasticity_perception": "MODERATE",
    "premium_feature_justification": "would pay more for verification"
  }
}
```

#### Feature Prioritization

```json
"session_specific": {
  "feature_priority": {
    "lifeboat_saves": ["search", "accuracy", "plain english"],
    "lifeboat_reasoning": "these solve core problem",
    "bundle_choice": "The Guide",
    "bundle_reasoning": "need both reference and chat",
    "deal_breakers_if_removed": [
      {"feature": "Plain English", "would_cancel": true, "intensity": 0.9}
    ],
    "feature_classifications": {
      "basic_expectations": ["search", "accuracy"],
      "performance_drivers": ["speed"],
      "delighters": ["personalization"]
    },
    "mvp_recommendation": "Launch with first three"
  }
}
```

#### Positioning

```json
"session_specific": {
  "positioning": {
    "perceptual_map": {
      "x_price": 6,
      "y_complexity": 7,
      "closest_competitor": "Karma",
      "white_space_opportunity": "affordable premium"
    },
    "word_associations": {
      "words_we_should_own": ["clarity", "understanding"],
      "words_competitors_own": {"Karma": "traditional"}
    },
    "laddering": {
      "feature_level": "Plain English explanations",
      "functional_benefit": "understand without Sanskrit",
      "emotional_driver": "feel connected without feeling ignorant"
    },
    "brand_archetype_vote": "THE SAGE",
    "brand_archetype_reasoning": "gives wisdom without being preachy",
    "positioning_statement_elements": {
      "target": "culturally Hindu but non-practicing professionals",
      "need": "reconnect through logic not ritual",
      "category": "spiritual clarity tool",
      "benefit": "decodes philosophy into plain English",
      "differentiation": "bridges cultural identity and modern skepticism"
    },
    "tagline_preference": "Your heritage, decoded."
  }
}
```

## Implementation

### Database Schema

Added `analysis` column to `Response` table:

```sql
ALTER TABLE "Response" ADD COLUMN "analysis" TEXT;
```

### Parser Module

Located at `src/lib/analysis/parser.ts`:

- `parsePersonaResponse()` - Extract analysis from raw response
- `aggregateAnalysis()` - Aggregate metrics across multiple responses
- `extractValidationInsights()` - Extract validation-specific insights

### Simulation Engine

Updated `src/lib/simulation/engine.ts`:

1. Parses responses using `parsePersonaResponse()`
2. Stores analysis data in database
3. Aggregates analysis at end of session
4. Creates insights for dashboard consumption

### API Endpoint

`GET /api/sessions/[id]/analysis`

Returns:

- Aggregated metrics (pain, emotion, confidence)
- Validation insights (if applicable)
- Individual persona analyses
- All session insights

## Usage

### Fetching Analysis Data

```typescript
const response = await fetch(`/api/sessions/${sessionId}/analysis`);
const data = await response.json();

console.log("Average Pain:", data.aggregatedMetrics.avg_pain_intensity);
console.log("Top Emotions:", data.aggregatedMetrics.top_emotions);
console.log(
  "Segment Distribution:",
  data.aggregatedMetrics.segment_distribution
);
```

### Dashboard Integration

```typescript
// Universal metrics (available for all research types)
const {
  avg_pain_intensity,
  avg_emotion_intensity,
  avg_confidence,
  top_emotions,
  segment_distribution,
  key_quotes,
  top_concerns,
} = data.aggregatedMetrics;

// Validation-specific metrics
if (data.validationInsights) {
  const {
    avg_problem_reality,
    avg_concept_appeal,
    avg_adoption_likelihood,
    top_barriers,
    must_have_features,
  } = data.validationInsights;
}
```

## Scoring Guides

### Pain Intensity (1-10)

- 1-3: Minor inconvenience
- 4-6: Moderate frustration
- 7-8: Significant distress
- 9-10: Crisis-level problem

### Confidence in Product (1-10)

- 1-3: This probably won't work
- 4-6: Skeptical but curious
- 7-8: Believe this could help
- 9-10: This solves my problem perfectly

### Emotion Intensity (1-10)

- 1-3: Mild feeling
- 4-6: Moderate emotion
- 7-8: Strong emotion
- 9-10: Overwhelming emotion

## Benefits

1. **Accuracy**: No pattern matching or guessing - personas self-report metrics
2. **Consistency**: Same core structure across all research types
3. **Flexibility**: Specialized fields for each research method
4. **Backward Compatible**: Works with existing responses, analysis is optional
5. **Dashboard Ready**: Direct mapping to visualization components

## Testing

Run the test suite:

```bash
npx tsx test-analysis.ts
```

This verifies:

- Response parsing
- Legacy compatibility
- Aggregation logic
- Validation insights extraction

## Future Enhancements

1. Real-time dashboard updates as responses come in
2. Comparative analysis across multiple sessions
3. Trend analysis over time
4. Export to CSV/Excel for external analysis
5. Custom metric definitions per project
