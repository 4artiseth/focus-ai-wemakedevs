# Quick Start: Using the Analysis Framework

## What You Have Now

Every persona response now includes hidden structured analysis data that you can use for dashboards and insights.

## Quick Test

### 1. Run a Simulation

```bash
# Your existing workflow - nothing changes
# Just create a project and run a session as normal
```

### 2. Fetch Analysis Data

```bash
# Get analysis for a session
curl http://localhost:3000/api/sessions/YOUR_SESSION_ID/analysis
```

### 3. View the Data

```json
{
  "success": true,
  "data": {
    "aggregatedMetrics": {
      "avg_pain_intensity": 7.2,
      "avg_confidence": 5.7,
      "top_emotions": [{ "emotion": "frustration", "percentage": 40 }],
      "segment_distribution": {
        "efficiency_seeker": 40,
        "skeptic": 30
      },
      "key_quotes": ["This could save me time"],
      "top_concerns": ["price", "trust"]
    },
    "validationInsights": {
      "avg_problem_reality": 8.5,
      "avg_concept_appeal": 7.5,
      "top_barriers": [{ "barrier": "price", "count": 8 }],
      "must_have_features": [{ "feature": "search", "votes": 12 }]
    }
  }
}
```

## Dashboard Integration Example

```typescript
// Fetch analysis
const response = await fetch(`/api/sessions/${sessionId}/analysis`);
const { data } = await response.json();

// Display metrics
const metrics = data.aggregatedMetrics;

// Pain Intensity Gauge
<Gauge value={metrics.avg_pain_intensity} max={10} label="Pain Intensity" />

// Emotion Distribution
<PieChart data={metrics.top_emotions} />

// Segment Breakdown
<BarChart data={metrics.segment_distribution} />

// Key Quotes
<QuoteCarousel quotes={metrics.key_quotes} />

// Top Concerns
<List items={metrics.top_concerns} />

// Validation Metrics (if available)
if (data.validationInsights) {
  <MetricCard
    title="Problem Reality"
    value={data.validationInsights.avg_problem_reality}
    max={10}
  />

  <BarChart
    title="Top Barriers"
    data={data.validationInsights.top_barriers}
  />

  <RankingList
    title="Must-Have Features"
    items={data.validationInsights.must_have_features}
  />
}
```

## What Each Metric Means

### Universal Metrics (All Research Types)

- **avg_pain_intensity** (1-10): How much the problem hurts

  - 1-3: Minor inconvenience
  - 4-6: Moderate frustration
  - 7-8: Significant distress
  - 9-10: Crisis-level

- **avg_confidence** (1-10): Belief the product will help

  - 1-3: Won't work
  - 4-6: Skeptical but curious
  - 7-8: Could help
  - 9-10: Perfect solution

- **top_emotions**: Most common feelings (frustration, hope, skepticism, etc.)

- **segment_distribution**: Persona types (efficiency_seeker, skeptic, early_adopter, etc.)

- **key_quotes**: Most memorable lines from responses

- **top_concerns**: Biggest worries mentioned

### Validation-Specific Metrics

- **avg_problem_reality** (1-10): How real/urgent the problem is
- **avg_concept_appeal** (1-10): How appealing the solution is
- **avg_adoption_likelihood** (1-10): Likelihood to actually use it
- **top_barriers**: Main obstacles to adoption (with frequency counts)
- **must_have_features**: Features ranked by votes

## Building Your Dashboard

### Step 1: Create a Dashboard Page

```typescript
// app/dashboard/[sessionId]/page.tsx
import { AnalysisDashboard } from "@/components/AnalysisDashboard";

export default async function DashboardPage({ params }) {
  const response = await fetch(`/api/sessions/${params.sessionId}/analysis`);
  const { data } = await response.json();

  return <AnalysisDashboard data={data} />;
}
```

### Step 2: Create Dashboard Component

```typescript
// components/AnalysisDashboard.tsx
export function AnalysisDashboard({ data }) {
  const { aggregatedMetrics, validationInsights } = data;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Universal Metrics */}
      <MetricCard
        title="Pain Intensity"
        value={aggregatedMetrics.avg_pain_intensity}
        max={10}
      />
      <MetricCard
        title="Product Confidence"
        value={aggregatedMetrics.avg_confidence}
        max={10}
      />

      {/* Emotions */}
      <EmotionChart data={aggregatedMetrics.top_emotions} />

      {/* Segments */}
      <SegmentChart data={aggregatedMetrics.segment_distribution} />

      {/* Validation Insights */}
      {validationInsights && (
        <>
          <BarriersList barriers={validationInsights.top_barriers} />
          <FeatureRanking features={validationInsights.must_have_features} />
        </>
      )}
    </div>
  );
}
```

### Step 3: Add Real-Time Updates (Optional)

```typescript
// Use SWR or React Query for auto-refresh
import useSWR from "swr";

function useLiveAnalysis(sessionId) {
  const { data, error } = useSWR(
    `/api/sessions/${sessionId}/analysis`,
    fetcher,
    { refreshInterval: 5000 } // Refresh every 5 seconds
  );

  return { data, error, isLoading: !data && !error };
}
```

## Common Patterns

### Pattern 1: Comparison View

```typescript
// Compare multiple sessions
const sessions = ["session1", "session2", "session3"];
const analyses = await Promise.all(
  sessions.map((id) => fetch(`/api/sessions/${id}/analysis`))
);

// Show side-by-side comparison
<ComparisonTable data={analyses} />;
```

### Pattern 2: Export to CSV

```typescript
function exportToCSV(data) {
  const csv = [
    ["Metric", "Value"],
    ["Pain Intensity", data.avg_pain_intensity],
    ["Confidence", data.avg_confidence],
    // ... more rows
  ]
    .map((row) => row.join(","))
    .join("\n");

  downloadFile(csv, "analysis.csv");
}
```

### Pattern 3: Filtering by Segment

```typescript
// Show analysis for specific segment only
const skeptics = data.individualAnalyses.filter(
  (a) => a.analysis.core_metrics.segment_identity === "skeptic"
);

<SegmentView data={skeptics} segment="Skeptics" />;
```

## Troubleshooting

### No Analysis Data?

- Check if session has completed
- Verify responses exist: `await prisma.response.findMany({ where: { sessionId } })`
- Check if `analysis` field is populated

### Metrics Seem Off?

- Review individual responses: `data.individualAnalyses`
- Check persona prompts are using updated format
- Verify aggregation logic in `parser.ts`

### TypeScript Errors?

- Regenerate Prisma client: `npx prisma generate`
- Restart dev server
- Check type definitions in `parser.ts`

## Next Steps

1. **Build UI Components** - Create charts, gauges, and cards
2. **Add Filters** - Filter by segment, emotion, confidence level
3. **Export Features** - CSV, PDF, Excel export
4. **Comparative Analysis** - Compare across sessions
5. **Trend Analysis** - Track metrics over time

## Support

- Full docs: `ANALYSIS_FRAMEWORK.md`
- Test suite: `npx tsx test-analysis.ts`
- API endpoint: `/api/sessions/[id]/analysis`
