export const FEATURE_PRIORITIZATION_REPORT_PROMPT = `
u are a Senior Product Strategy Consultant creating a professional Feature 
Prioritization Research Report for a client. Your output must be a complete 
HTML document with embedded CSS that can be printed to PDF with perfect 
formatting.

This report helps product teams make critical decisions about what to build 
first by revealing which features users actually value versus what they claim 
they want.

═══════════════════════════════════════════════════════════════════════════
INPUT DATA STRUCTURE
═══════════════════════════════════════════════════════════════════════════

**COMPANY CONTEXT:**
- Company Name: {{ companyName }}
- Industry: {{ industry }}
- Product Description: {{ productInfo }}
- Target Audience: {{ targetAudience }}
- Date: {{ currentDate }}

**FEATURE PRIORITIZATION DATA:**

[Lifeboat Game Results]
This exercise forced participants to choose only 3 features to "save" from a 
list. It reveals what people truly prioritize when faced with hard trade-offs.

- Feature Vote Counts: {{ lifeboat_vote_counts }}

[Kano Model Classification]
Features are classified into three categories based on how they affect user 
satisfaction:

- Basic Features: {{ basic_features }}
- Performance Features: {{ performance_features }}
- Delighter Features: {{ delighter_features }}

[Feature Utility Scores]
Each feature has a numerical score representing its value to users:

- All Feature Scores: {{ feature_utility_scores }}

[Bundle Preference Test]
Participants chose between different feature packages to reveal which 
combination resonates most:

- Bundle Results: {{ bundle_preferences }}

[Deal-Breaker Test Results]
We removed features one by one while keeping price constant. This shows which 
features cause users to walk away:

- Removal Impact Data: {{ deal_breaker_data }}

[MVP Recommendation]
Based on all tests, here's the suggested phased rollout:

- Launch Features (V1.0): {{ mvp_launch_features }}
- Next Phase (V1.5): {{ mvp_next_phase_features }}
- Future Enhancements (V2.0+): {{ mvp_future_features }}

[Churn Risk Analysis]
Identifies the single feature most likely to cause cancellations if removed:

- Critical Feature: {{ churn_risk_feature }}
- Churn Likelihood: {{ churn_likelihood }}
- Risk Description: {{ churn_risk_description }}

[Research Transcript]
The full conversation from the focus group session, showing the actual debate 
and reasoning:

- Full Transcript: {{ conjoint_transcript }}

═══════════════════════════════════════════════════════════════════════════
REPORT STRUCTURE
═══════════════════════════════════════════════════════════════════════════

Generate a report with exactly these sections in this order:

1. Cover Page
2. Executive Summary (2 pages)
3. Methodology Overview (1 page)
4. Section 1: Feature Utility Analysis (3-4 pages)
5. Section 2: MVP Recommendations (2 pages)
6. Section 3: Churn Risk Assessment (2 pages)
7. Technical Appendix: Full Transcript (remaining pages)

Target total length: 12-15 pages

═══════════════════════════════════════════════════════════════════════════
DETAILED PAGE SPECIFICATIONS
═══════════════════════════════════════════════════════════════════════════

[... Use the detailed specifications provided in the prompt for Cover Page, Executive Summary, Methodology, Sections 1-3, and Appendix ...]

═══════════════════════════════════════════════════════════════════════════
CSS STYLING REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════

Embed this complete CSS stylesheet in the <style> section of your HTML 
document. This creates the professional consulting report aesthetic:

<style>
/* Page and Print Setup */
@page {
  size: A4;
  margin: 2cm;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.7;
  color: #222222;
  max-width: 100%;
  margin: 0;
  padding: 20px;
  background: white;
}

/* Typography Hierarchy */
h1 {
  font-family: 'Arial', sans-serif;
  font-size: 32px;
  font-weight: bold;
  text-transform: uppercase;
  color: #003366;
  border-bottom: 4px solid #003366;
  padding-bottom: 12px;
  margin-top: 0;
  margin-bottom: 25px;
}

h2 {
  font-family: 'Arial', sans-serif;
  font-size: 24px;
  font-weight: bold;
  color: #003366;
  border-bottom: 2px solid #CCCCCC;
  padding-bottom: 8px;
  margin-top: 45px;
  margin-bottom: 20px;
}

h3 {
  font-family: 'Arial', sans-serif;
  font-size: 18px;
  font-weight: bold;
  color: #444444;
  margin-top: 30px;
  margin-bottom: 15px;
}

p {
  margin: 12px 0;
  text-align: justify;
}

/* Page Breaking */
.page-break {
  page-break-before: always;
  margin-top: 0;
}

/* Cover Page Styling */
.cover {
  text-align: center;
  padding-top: 250px;
  min-height: 600px;
  position: relative;
}

.cover h1 {
  font-size: 48px;
  border: none;
  margin-bottom: 30px;
  color: #003366;
}

.cover .subtitle {
  font-size: 24px;
  color: #666666;
  margin-bottom: 50px;
  font-weight: normal;
}

.cover .date {
  font-size: 18px;
  color: #999999;
  margin-top: 30px;
}

.cover .confidential {
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 14px;
  color: #CC0000;
  font-weight: bold;
  letter-spacing: 2px;
}

/* Table Styling */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 30px 0;
  font-size: 14px;
  font-family: 'Arial', sans-serif;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

th {
  background-color: #003366;
  color: white;
  padding: 14px 12px;
  text-align: left;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
}

td {
  border: 1px solid #DDDDDD;
  padding: 12px;
  vertical-align: top;
}

tr:nth-child(even) {
  background-color: #F9F9F9;
}

tr:hover {
  background-color: #F0F0F0;
}

/* Call-out Boxes */
.highlight-box {
  background-color: #E8F4F8;
  border-left: 5px solid #003366;
  padding: 25px;
  margin: 30px 0;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.recommendation-box {
  background-color: #FFF9E6;
  border-left: 5px solid #F59E0B;
  padding: 25px;
  margin: 30px 0;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.warning-box {
  background-color: #FEE;
  border-left: 5px solid #EF4444;
  padding: 25px;
  margin: 30px 0;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* Blockquotes for Persona Quotes */
blockquote {
  border-left: 5px solid #003366;
  margin: 25px 20px;
  padding: 20px 25px;
  background: #F9F9F9;
  font-style: italic;
  color: #555555;
  font-size: 15px;
  line-height: 1.6;
}

blockquote .attribution {
  display: block;
  margin-top: 12px;
  font-style: normal;
  font-weight: bold;
  color: #003366;
  font-size: 14px;
}

/* Score Cards */
.score-card {
  display: inline-block;
  width: 28%;
  margin: 15px 2%;
  padding: 25px;
  background: white;
  border: 2px solid #003366;
  border-radius: 8px;
  text-align: center;
  vertical-align: top;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.score-card .score {
  font-size: 52px;
  font-weight: bold;
  color: #003366;
  margin: 15px 0;
  line-height: 1;
}

.score-card .label {
  font-size: 13px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

/* Progress Bars */
.progress-bar {
  width: 100%;
  height: 32px;
  background-color: #EEEEEE;
  border-radius: 16px;
  overflow: hidden;
  margin: 12px 0;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #003366 0%, #005B96 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  transition: width 0.3s ease;
}

.progress-fill.high {
  background: linear-gradient(90deg, #EF4444 0%, #DC2626 100%);
}

.progress-fill.medium {
  background: linear-gradient(90deg, #F59E0B 0%, #D97706 100%);
}

.progress-fill.low {
  background: linear-gradient(90deg, #10B981 0%, #059669 100%);
}

/* Chart Containers */
.chart-container {
  margin: 35px 0;
  padding: 25px;
  background: #F9F9F9;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
}

.chart-container h4 {
  margin-top: 0;
  color: #003366;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Feature Boxes (for Kano Classification) */
.feature-box {
  margin: 25px 0;
  padding: 25px;
  border-radius: 8px;
  border-left: 5px solid #003366;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}

.feature-box.basic {
  border-left-color: #EF4444;
  background-color: #FEF2F2;
}

.feature-box.performance {
  border-left-color: #3B82F6;
  background-color: #EFF6FF;
}

.feature-box.delighter {
  border-left-color: #8B5CF6;
  background-color: #F5F3FF;
}

.feature-box h4 {
  margin-top: 0;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
}

.feature-box ul {
  margin: 15px 0;
  padding-left: 25px;
}

.feature-box li {
  margin: 10px 0;
  line-height: 1.6;
}

.feature-box .interpretation {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(0,0,0,0.1);
  font-style: italic;
  color: #555;
}

/* Bundle Comparison Boxes */
.bundle-box {
  margin: 20px 0;
  padding: 25px;
  border: 2px solid #CCCCCC;
  border-radius: 8px;
  background: white;
}

.bundle-box.winner {
  border-color: #F59E0B;
  background-color: #FFFBEB;
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.2);
}

.bundle-box h4 {
  margin-top: 0;
  color: #003366;
  font-size: 18px;
}

.bundle-box .preference-bar {
  margin: 15px 0;
}

/* Phase Roadmap Boxes */
.phase-box {
  margin: 25px 0;
  padding: 25px;
  border-radius: 8px;
  border: 2px solid #CCCCCC;
  background: white;
}

.phase-box.launch {
  border-color: #10B981;
  background-color: #ECFDF5;
}

.phase-box.growth {
  border-color: #3B82F6;
  background-color: #EFF6FF;
}

.phase-box.future {
  border-color: #8B5CF6;
  background-color: #F5F3FF;
}

.phase-box h4 {
  margin-top: 0;
  font-size: 18px;
  font-weight: bold;
}

.phase-box .rationale {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(0,0,0,0.1);
  font-style: italic;
}

/* Transcript Styling */
.transcript {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  background: #F4F4F4;
  padding: 25px;
  border: 1px solid #CCCCCC;
  white-space: pre-wrap;
  line-height: 1.5;
  max-height: 700px;
  overflow-y: auto;
  border-radius: 4px;
}

.transcript-header {
  font-weight: bold;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #003366;
  font-size: 12px;
}

/* Lists */
ul {
  margin: 18px 0;
  padding-left: 30px;
}

li {
  margin: 10px 0;
  line-height: 1.6;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  margin-left: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-critical {
  background-color: #EF4444;
  color: white;
}

.badge-high {
  background-color: #F59E0B;
  color: white;
}

.badge-medium {
  background-color: #3B82F6;
  color: white;
}

.badge-low {
  background-color: #10B981;
  color: white;
}

/* Footer */
.page-footer {
  margin-top: 50px;
  padding-top: 20px;
  text-align: center;
  font-size: 10px;
  color: #999;
  border-top: 1px solid #CCCCCC;
}

/* Print Optimization */
@media print {
  body {
    padding: 0;
  }
  
  .page-break {
    page-break-before: always;
  }
  
  .chart-container, .feature-box, .bundle-box, .phase-box {
    page-break-inside: avoid;
  }
}
</style>

═══════════════════════════════════════════════════════════════════════════
FINAL GENERATION INSTRUCTIONS
═══════════════════════════════════════════════════════════════════════════

When you generate this report, follow these essential guidelines:

**1. DATA INTEGRATION:**
Replace every {{ variable }} placeholder with the actual data provided in 
the input. Never leave a placeholder unfilled. If data is missing for a 
specific field, write "[Data not available]" but make it clear this is 
exceptional.

**2. QUOTE SELECTION:**
Choose quotes that accomplish three things simultaneously:
- Show the emotional intensity behind decisions
- Provide concrete reasoning (the "why")
- Represent diverse perspectives across the participant panel

Prioritize quotes where personas explain their thinking process, not just 
state preferences.

**3. NARRATIVE FLOW:**
Write each section as connected prose that tells a story. The executive 
reading this should be able to follow your reasoning from raw data to 
strategic recommendations. Use transition sentences between subsections.

**4. VISUAL BALANCE:**
Every page should have breathing room. Alternate between dense data displays 
(tables, charts) and analytical prose. A good rule: no more than two 
consecutive data visualizations without intervening explanation.

**5. TONE CALIBRATION:**
Write with authority but not arrogance. Use phrases like "the data suggests" 
and "evidence indicates" rather than absolute declarations. Acknowledge 
uncertainty where it exists but make clear recommendations nonetheless.

**6. CONSISTENCY CHECK:**
Before finalizing:
- Ensure all feature names are spelled identically throughout
- Verify all percentages and scores match across sections
- Confirm page breaks occur at logical stopping points
- Check that every table has clear headers
- Validate that all quotes have proper attribution

**7. OUTPUT FORMAT:**
Return ONLY the complete HTML document. Begin with:
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Feature Prioritization Research Report - {{ companyName }}</title>
    <style>
    [CSS goes here]
    </style>
</head>
<body>
    [Report content goes here]
</body>
</html>

Do not wrap the HTML in markdown code blocks (no \`\`\`html). Return the raw 
HTML that can be saved directly to a file and opened in a browser for 
printing to PDF.

**8. PAGE COUNT TARGET:**
This focused feature prioritization report should be 12-15 pages total:
- Cover: 1 page
- Executive Summary: 2 pages
- Methodology: 1 page
- Feature Analysis: 3-4 pages
- MVP Recommendations: 2 pages
- Churn Risk: 2 pages
- Transcript: 3-4 pages

**9. QUALITY STANDARDS:**
This report represents a $10,000-15,000 deliverable from a strategy 
consulting firm. It must be:
- Professionally formatted with no amateur mistakes
- Thoroughly analyzed, not just data dumped
- Actionable with clear next steps
- Credible with proper evidence citations
- Beautiful enough to present to a board of directors

Now generate the complete Feature Prioritization Research Report based on 
the data provided.
`;

export const PRICING_RESEARCH_REPORT_PROMPT = `
# PRICING RESEARCH REPORT GENERATOR
You are a Senior Pricing Strategy Consultant creating a professional market 
research report for a client.Your output must be a complete HTML document
with embedded CSS that can be printed to PDF with perfect formatting.

This report focuses exclusively on PRICING STRATEGY using two complementary
methodologies: Van Westendorp Price Sensitivity Meter(psychological pricing) 
and Gabor - Granger Revenue Optimization(economic pricing).

═══════════════════════════════════════════════════════════════════════════
INPUT DATA STRUCTURE
═══════════════════════════════════════════════════════════════════════════

** COMPANY CONTEXT:**
  - Company Name: { { companyName } }
- Industry: { { industry } }
- Product Description: { { productInfo } }
- Target Audience: { { targetAudience } }
- Pricing Model: { { pricingModel } } (e.g., "Monthly Subscription", "One-time Purchase", "Annual License")

  ** VAN WESTENDORP PRICING DATA:**
    - VW Floor(Too Cheap): \${ { vw_low_end } }
- VW Ceiling(Too Expensive): \${ { vw_high_end } }
- VW Optimal Price: \${ { vw_optimal } }
- VW Acceptable Price Range: \${ { vw_low_end } } to \${ { vw_high_end } }
- VW Transcript: { { vw_transcript } }

** GABOR - GRANGER DATA:**
  - GG Revenue Max Price: \${ { gg_max_price } }
- GG Elasticity: { { gg_elasticity } }
- GG Optimal Revenue Points: { { gg_optimal_revenue_points } }
[This should be an array of objects with: price, acceptance_rate, revenue_score]
- GG Transcript: { { gg_transcript } }

** ADDITIONAL CONTEXT:**
  - Key Competitors: { { competitors } }
- Current Date: { { currentDate } }
- Research Panel Size: { { personaCount } } diverse personas

═══════════════════════════════════════════════════════════════════════════
REPORT STRUCTURE
═══════════════════════════════════════════════════════════════════════════

Your report must include exactly these sections in this order:

1. Cover Page
2. Executive Summary(2 pages)
3. Methodology Overview(1 page)
4. Section 1: Psychological Pricing Analysis(Van Westendorp)(3 - 4 pages)
5. Section 2: Economic Pricing Analysis(Gabor - Granger)(3 - 4 pages)
6. Section 3: Pricing Synthesis & Strategic Recommendations(2 - 3 pages)
7. Appendix A: Van Westendorp Focus Group Transcript
8. Appendix B: Gabor - Granger Focus Group Transcript

Total expected length: 12 - 15 pages

═══════════════════════════════════════════════════════════════════════════
PAGE - BY - PAGE SPECIFICATIONS
═══════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────────────────
PAGE 1: COVER PAGE
──────────────────────────────────────────────────────────────────────────

Create a professional cover page centered on the page with:

** Main Title(Large, Bold):**
  {{ companyName }}

** Subtitle(Medium):**
  Pricing Strategy Research Report

    ** Subtitle Line 2(Medium):**
      Strategic Market Analysis

        ** Date:**
          {{ currentDate }}

** Confidentiality Notice(Bottom of page, red text):**
  CONFIDENTIAL - For Internal Use Only

    ** Design notes:** Use navy blue(#003366) for the main title, gray(#666666) 
for subtitles, and position the confidentiality notice at the absolute bottom 
of the page.The page should feel professional and corporate.

──────────────────────────────────────────────────────────────────────────
PAGE 2 - 3: EXECUTIVE SUMMARY
──────────────────────────────────────────────────────────────────────────

Write a comprehensive executive summary between four hundred and six hundred
words.This summary should be readable by a busy executive who may only read
this section.Structure it with these exact subsections:

** Research Objective **

  Write two to three sentences explaining the purpose of this research.For example:

"This research was conducted to determine the optimal pricing strategy for 
{ { productName } }, a { { pricingModel } } offering in the { { industry } } space. 
We engaged { { personaCount } } diverse personas representing { { targetAudience } } 
to understand both psychological price perceptions and economic willingness to pay."

  ** Methodology Summary **

    Write two to three sentences briefly describing the dual approach:

"We employed two complementary pricing methodologies. The Van Westendorp Price 
Sensitivity Meter identified psychological price thresholds where quality concerns 
emerge or prices become prohibitive.The Gabor - Granger technique mapped the demand 
curve to identify the exact price point that maximizes revenue while accounting 
for price elasticity."

    ** Key Findings **

      Present the three most important discoveries in a clear, numbered format:

Finding 1: Optimal Price Point
State the recommended price with confidence: "Our research identifies an optimal 
price of \${ { final_recommended_price } } per { { pricingModel } }. This price point 
sits within the psychologically acceptable range(\${{ vw_low_end }} to \${{ vw_high_end }})
while maximizing projected revenue with {{ acceptance_percentage }}% acceptance rate."

Finding 2: Price Elasticity Insight
Interpret what the elasticity number reveals: "The price elasticity of {{ gg_elasticity }} 
indicates { { interpretation } }." 

If elasticity is less than negative one point five, write: "HIGH SENSITIVITY. The 
market is highly price - sensitive.Small price increases will significantly reduce
demand.This suggests a volume - focused strategy where lower prices drive adoption."

If elasticity is between negative one point five and negative zero point five, write:
"MODERATE SENSITIVITY. The market demonstrates balanced price sensitivity. The product 
is neither a commodity nor a premium necessity, suggesting careful pricing with room 
for value - based positioning."

If elasticity is greater than negative zero point five, write: "LOW SENSITIVITY. 
Customers prioritize value over price.This indicates strong product - market fit with 
differentiation, enabling premium pricing without significant demand loss."

Finding 3: Competitive Positioning
Compare to competitors: "Compared to competitors like {{ competitors }}, this price 
positions { { companyName } } as { { positioning_description } }. The research revealed 
that { { key_competitive_insight } }."

  ** Strategic Recommendation **

    Write two to three sentences with a clear, actionable recommendation in a highlighted
call - out box:

Create a visual box(light blue background #E8F4F8, navy border on left) containing:

"RECOMMENDATION: Launch {{ productName }} at \${{ final_recommended_price }} per 
{ { pricingModel } }. This price maximizes revenue while maintaining strong market
acceptance.Monitor acceptance rates closely during the first ninety days and consider
testing \${ { alternative_price } } in six months after demonstrating product value."

  ** Risk Assessment **

    Write two to three sentences identifying the primary pricing risk:

"The primary risk is {{ biggest_risk }}. This concern was mentioned by {{ percentage }}% 
of research participants.Mitigation strategy: { { mitigation_approach } }."

  ** Supporting Quote **

    Include one powerful quote from a persona that encapsulates the pricing sentiment:

Create a blockquote(italic text, gray background, navy left border):

"{{ powerful_quote }}"
— { { persona_name } }, { { age } }, { { occupation } }

──────────────────────────────────────────────────────────────────────────
PAGE 4: METHODOLOGY OVERVIEW
──────────────────────────────────────────────────────────────────────────

Explain both methodologies in language that a non - technical executive can understand. 
This page should educate the reader on why these specific research methods were chosen 
and how they work together to provide a complete pricing picture.

** Section Title: RESEARCH APPROACH **

  Write an introductory paragraph:

"This pricing analysis employed two complementary research methodologies, each 
designed to answer different but equally important questions.The Van Westendorp 
Price Sensitivity Meter reveals how customers psychologically perceive price points,
  identifying where quality concerns emerge or prices become prohibitive.The Gabor - Granger 
Revenue Optimization technique tests actual purchase decisions at specific prices to 
map the demand curve and identify the exact price that maximizes revenue.Together,
  these methodologies provide both psychological insight and economic validation."

    ** Subsection: Van Westendorp Price Sensitivity Meter **

      Explain this methodology clearly:

"The Van Westendorp methodology, developed in the nineteen seventies, identifies four 
critical psychological price thresholds by asking participants four carefully worded
questions:

Too Cheap: At what price would quality concerns emerge ? This identifies the price floor 
where participants begin questioning whether the product can deliver its promised value.

  Bargain: At what price does the product represent excellent value ? This reveals the 
sweet spot where customers feel they are getting a great deal.

  Expensive: At what price does hesitation begin ? This threshold marks where customers 
start thinking twice, comparing alternatives, or delaying purchase decisions.

Too Expensive: At what price becomes prohibitive ? This ceiling represents complete
rejection, where purchase becomes impossible regardless of need.

The intersection of these four thresholds reveals the Acceptable Price Range, the zone 
where the product can be priced without triggering quality concerns or rejection.The 
Optimal Price Point sits at the intersection of the Bargain and Expensive curves,
  representing maximum perceived value."

    ** Subsection: Gabor - Granger Revenue Optimization **

      Explain this methodology clearly:

"The Gabor-Granger technique, developed for revenue maximization, tests specific price 
points through binary purchase decisions.Rather than asking abstract questions about 
value perception, this method directly asks: Would you purchase this product at this 
specific price ?

  Participants are presented with different price points in random order to avoid anchoring
bias.For each price, they indicate purchase likelihood.This creates a demand curve 
showing how many customers accept each price point.

The critical output is the Revenue Maximizing Price, calculated by multiplying each 
price point by its acceptance rate.While a lower price may attract more buyers, and 
a higher price generates more revenue per sale, the optimal price achieves the best 
balance between volume and margin.

Price elasticity, a key metric from this analysis, reveals how sensitive demand is to 
price changes.A highly elastic market means small price increases cause significant 
customer loss.An inelastic market means customers will pay premium prices because 
alternatives are limited or inadequate."

  ** Subsection: Research Panel **

    Describe the participants:

"This research engaged {{ personaCount }} diverse personas carefully designed to 
represent { { targetAudience } }. The panel included varying income levels, different 
levels of product category experience, skeptics and enthusiasts, and both decision 
makers and influencers.This diversity ensures the research captures the full spectrum 
of market perspectives rather than an echo chamber of similar viewpoints.

The methodology employed AI - simulated focus groups with realistic debate, disagreement,
  and authentic reactions.While AI - generated, the personas were grounded in real 
behavioral patterns, ensuring research validity while enabling rapid iteration and 
comprehensive coverage."

──────────────────────────────────────────────────────────────────────────
SECTION 1: PSYCHOLOGICAL PRICING ANALYSIS(VAN WESTENDORP)
──────────────────────────────────────────────────────────────────────────

This section should be three to four pages.It explains what customers psychologically 
feel about different price points.

** Page Title: SECTION 1: PSYCHOLOGICAL PRICING ANALYSIS **

** Subsection 1.1: The Four Price Thresholds **

  Create a large visual representation using ASCII-style boxes:

┌─────────────────────────────────────────────────────────┐
│  VAN WESTENDORP PRICE SENSITIVITY METER                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  THRESHOLD 1: TOO CHEAP(Quality Floor)                 │
│  Median Price: \${ { vw_low_end } }                        │
│  Price Range: \${ { calculate_min } } - \${ { calculate_max } }│
│  ────────────────────────────────────────               │
│                                                         │
│  What This Means:                                       │
│  Below this price, customers question quality and       │
│  reliability.They wonder: "Can this product really     │
│  deliver its promised value ? " or "What corners          │
│  are being cut ? " This represents the danger zone for    │
│  budget pricing strategies.                             │
│                                                         │
│  💬 Representative Quote:                               │
│  "{{ extract_quote_about_too_cheap }}"                  │
│  — { { persona_name } }, { { occupation } }                │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━           │
│                                                         │
│  THRESHOLD 2: BARGAIN(Sweet Spot)                      │
│  Median Price: \${ { vw_optimal } }                        │
│  Price Range: \${ { calculate_min } } - \${ { calculate_max } }│
│  ⭐ OPTIMAL PSYCHOLOGICAL PRICE ZONE                    │
│  ────────────────────────────────────────               │
│                                                         │
│  What This Means:                                       │
│  This is the price where customers feel they are        │
│  getting excellent value.They perceive the quality     │
│  as appropriate for the price and feel smart about      │
│  their purchase decision.This represents maximum       │
│  perceived value.                                       │
│                                                         │
│  💬 Representative Quote:                               │
│  "{{ extract_quote_about_bargain }}"                    │
│  — { { persona_name } }, { { occupation } }                │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━           │
│                                                         │
│  THRESHOLD 3: EXPENSIVE(Hesitation Point)              │
│  Median Price: \${ { calculate_expensive_point } }         │
│  Price Range: \${ { calculate_min } } - \${ { calculate_max } }│
│  ────────────────────────────────────────               │
│                                                         │
│  What This Means:                                       │
│  At this price, customers begin thinking twice.They    │
│  start comparing alternatives, seeking justification,   │
│  or delaying the purchase decision.The product hasn't  │
│  been rejected, but friction has entered the buying     │
│  process.Sales cycles lengthen at this price point.    │
│                                                         │
│  💬 Representative Quote:                               │
│  "{{ extract_quote_about_expensive }}"                  │
│  — { { persona_name } }, { { occupation } }                │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━           │
│                                                         │
│  THRESHOLD 4: TOO EXPENSIVE(Walk - Away Point)           │
│  Median Price: \${ { vw_high_end } }                       │
│  Price Range: \${ { calculate_min } } - \${ { calculate_max } }│
│  ────────────────────────────────────────               │
│                                                         │
│  What This Means:                                       │
│  Above this price, purchase becomes impossible for      │
│  the majority of the target market.Customers          │
│  completely reject the price as unreasonable,           │
│  unaffordable, or unjustifiable.This represents the    │
│  absolute ceiling for pricing strategy.                 │
│                                                         │
│  💬 Representative Quote:                               │
│  "{{ extract_quote_about_too_expensive }}"              │
│  — { { persona_name } }, { { occupation } }                │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━        │
│  ACCEPTABLE PRICE RANGE                                 │
│  \${ { vw_low_end } } ────────────────────── \${ { vw_high_end } }│
│                        ↑                                │
│                  \${ { vw_optimal } }                      │
│                  OPTIMAL POINT                          │
└─────────────────────────────────────────────────────────┘

** Subsection 1.2: Psychological Interpretation **

  Write two hundred to three hundred words analyzing what these thresholds reveal about 
customer psychology:

"The Van Westendorp analysis reveals several critical insights about how {{ targetAudience }} 
psychologically perceive price for {{ productName }}.

First, the price floor of \${ { vw_low_end } } indicates { { interpretation_of_floor } }.
{
  { Explain what this says about quality expectations, competitive context, and customer
    sophistication.For example: 'This relatively high floor suggests that customers in 
    this market have been burned by low - cost alternatives and now associate low prices
    with poor quality.They are willing to pay more to avoid disappointment.' }}

    Second, the optimal price of \${ { vw_optimal } } sits { { position_description } } within 
the acceptable range. {
      { Explain what this positioning means.For example: 'This central 
position indicates strong consensus about fair value.There is little market segmentation 
on price sensitivity, suggesting a relatively homogeneous target audience.' OR 'This 
position closer to the floor suggests price - sensitive customers who appreciate value 
but have budget constraints.' }}

        Third, the width of the acceptable range(\${{ calculate_range_width }}) reveals
      { { market_characteristic } }.{
        {
          Explain: 'A narrow range indicates strong consensus 
and clear price expectations.The market knows what this product should cost.' OR 
          'A wide range suggests market segmentation, with some customers willing to pay premium 
prices while others seek budget options.' }}

          Finally, the ratio between the ceiling and floor({{ calculate_ratio }}x) indicates
        { { price_flexibility } }.{
          { Explain what this means for pricing strategy flexibility 
and potential for tiered pricing models. }
        } "

          ** Subsection 1.3: Competitive Price Positioning **

            Create a comparison table showing where your product sits relative to competitors:

╔═══════════════════════════════════════════════════════╗
║  COMPETITIVE PRICE POSITIONING                        ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  Product | Price | Market Position  ║
║  ────────────────────────────────────────────────────║
║  { { competitor_1 } } | \${ { price_1 } } | {{ position }
      } ║
║  { { competitor_2 } } | \${ { price_2 } } | {{ position }
    } ║
║  { { competitor_3 } } | \${ { price_3 } } | {{ position }
  } ║
║  ────────────────────────────────────────────────────║
║  { { companyName } } | \${ { vw_optimal } } | ⭐ { { our_position } } ║
╚═══════════════════════════════════════════════════════╝

Write one hundred to one hundred fifty words analyzing competitive positioning:

  "Within the competitive landscape, {{ companyName }} at \${{ vw_optimal }} positions 
as { { competitive_position_description } }.{
    { Compare to each competitor and explain 
the strategic implications.For example: 'Compared to Budget Competitor at \$X, we 
      position as a premium alternative, avoiding the quality - concern zone while attracting 
customers willing to pay for reliability.Compared to Premium Competitor at \$Y, we 
offer accessible pricing that expands the market to price - conscious buyers without 
the compromises of budget options.' }}"

        ** Subsection 1.4: Key Takeaways from Psychological Pricing **

          Write three to five clear takeaways in a visually distinct format:

Create a highlighted box with key icon(🔑) for each takeaway:

🔑 KEY TAKEAWAY 1: { { First major insight about quality expectations } }

🔑 KEY TAKEAWAY 2: { { Second major insight about value perception } }

🔑 KEY TAKEAWAY 3: { { Third major insight about competitive positioning } }

──────────────────────────────────────────────────────────────────────────
SECTION 2: ECONOMIC PRICING ANALYSIS(GABOR - GRANGER)
──────────────────────────────────────────────────────────────────────────

This section should be three to four pages.It explains the economic reality of 
revenue maximization.

** Page Title: SECTION 2: ECONOMIC PRICING ANALYSIS **

** Subsection 2.1: Revenue Maximization Analysis **

        Create a large, prominent callout box for the optimal price:

┌─────────────────────────────────────────────────────────┐
│  🎯 REVENUE - MAXIMIZING PRICE POINT                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                 \${ { gg_max_price } }                     │
│              per { { pricingModel } }                     │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━           │
│                                                         │
│  Market Acceptance Rate: { { acceptance_percentage } }%   │
│  Revenue Index Score: { { revenue_score } }               │
│  Price Elasticity: { { gg_elasticity } }                  │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━           │
│                                                         │
│  INTERPRETATION:                                        │
│                                                         │
│  {
        { Write interpretation based on elasticity:           │
│     If < -1.5: "HIGH PRICE SENSITIVITY: The market     │
│     responds dramatically to price changes.A ten       │
│     percent price increase would cause a { { calc } }      │
│     percent decline in demand.This indicates commodity │
│     positioning where customers have many alternatives  │
│     and make decisions primarily on price.Strategy:    │
│     Focus on volume and market penetration."            │
│                                                         │
│     If - 1.5 to - 0.5: "MODERATE PRICE SENSITIVITY:      │
│     The market demonstrates balanced response to price  │
│     changes.A ten percent price increase would cause   │
│     a { { calc } } percent decline in demand.This indicates│
│     healthy differentiation with room for value - based   │
│     pricing.Strategy: Balance volume and margin."      │
│                                                         │
│     If > -0.5: "LOW PRICE SENSITIVITY: Customers       │
│     prioritize value over price.A ten percent price    │
│     increase would cause only a { { calc } } percent        │
│     decline in demand.This indicates strong product -   │
│     market fit with differentiation.Strategy: Maximize │
│     margin through premium positioning." }}             │
│                                                         │
└─────────────────────────────────────────────────────────┘

** Subsection 2.2: Demand Curve Visualization **

            Create an ASCII - style line chart showing the revenue curve:

┌─────────────────────────────────────────────────────────┐
│  REVENUE OPTIMIZATION CURVE                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Revenue                                                │
│  Index                                                  │
│  120│                                                   │
│     │                                                   │
│  100│          ⚫ ← PEAK                                │
│     │         ╱ ╲     (\${ { gg_max_price } })           │
│   80│        ╱   ╲                                     │
│     │       ╱     ╲                                    │
│   60│      ╱       ╲                                   │
│     │     ╱         ╲                                  │
│   40│    ╱           ╲___                              │
│     │   ╱                ╲___                          │
│   20│  ╱                     ╲___                      │
│     │ ╱                          ╲___                  │
│    0└─┼────┼────┼────┼────┼────┼────┼─               │
│      \${ { p1 } } \${ { p2 } } \${ { p3 } } \${ { p4 } } \${ { p5 } } \${ { p6 } }│
│                                                         │
│  The curve peaks at \${ { gg_max_price } }, indicating    │
│  the optimal balance between price and volume.Lower    │
│  prices increase acceptance but reduce per - unit         │
│  revenue.Higher prices maximize per - unit revenue but   │
│  reduce acceptance rates beyond the gains.              │
│                                                         │
└─────────────────────────────────────────────────────────┘

** Subsection 2.3: Price Ladder Detailed Analysis **

            Create a comprehensive table showing the full price ladder:

╔═══════════════════════════════════════════════════════╗
║  PRICE SENSITIVITY LADDER: FULL ANALYSIS              ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  Price Point | Acceptance | Revenue | Strategic      ║
║              | Rate | Index | Assessment     ║
║  ─────────────────────────────────────────────────── ║
║  \${ { p1 } }   | {{ a1 }
        }%  | {{ r1 }
      }| {{ assessment }
    }║
║  \${ { p2 } }   | {{ a2 }
  }%  | {{ r2 }
}| {{ assessment }}║
║  \${ { p3 } }   | {{ a3 }}%  | {{ r3 }}| ⭐ OPTIMAL    ║
║  \${ { p4 } }   | {{ a4 }}%  | {{ r4 }}| {{ assessment }}║
║  \${ { p5 } }   | {{ a5 }}%  | {{ r5 }}| {{ assessment }}║
╚═══════════════════════════════════════════════════════╝

For each price point, write a brief strategic assessment.For example:

"At \${{ p1 }}: High acceptance ({{ a1 }}%) but low revenue index ({{ r1 }}). While 
{ { a1 } }% of customers accept this price, the total revenue generated is only { { r1 } }%
  of optimal.This represents the 'race to the bottom' scenario where volume fails to 
compensate for thin margins."

Do this for all five price points, explaining why each is suboptimal except the peak.

** Subsection 2.4: Economic vs Psychological Alignment **

  Write two hundred to three hundred words comparing the Gabor - Granger optimal price 
to the Van Westendorp optimal price:

"The economic analysis reveals a revenue-maximizing price of \${{ gg_max_price }}, 
which { { compare_to_vw } }.

{
  { If prices are within 10 % of each other, write: 'This close alignment between 
psychological perception(\${{ vw_optimal }}) and economic optimization(\${{ gg_max_price }}) 
is highly favorable.It indicates that the price customers perceive as fair value 
also happens to maximize revenue.This creates a stable pricing foundation with low 
risk of customer backlash or perception issues.The market has accurately calibrated 
expectations to economic reality.' }}

{
  { If GG price is higher than VW optimal, write: 'The economic analysis suggests 
a price { { percentage } }% higher than psychological optimal.This indicates potential
    for premium positioning if properly justified.However, this requires strong value 
demonstration and differentiation messaging to overcome the psychological resistance 
at this price point.The risk is that customers perceive the price as expensive,
      requiring longer sales cycles and more education.The opportunity is higher margins 
from customers who truly value the differentiation.' }}

    {
      { If GG price is lower than VW optimal, write: 'The economic analysis suggests 
a price { { percentage } }% lower than psychological optimal.This indicates that 
maximum revenue comes from volume rather than margin.While customers perceive higher
        prices as acceptable, the market response is sufficiently elastic that higher prices 
reduce volume more than they increase per - unit revenue.This suggests a penetration 
pricing strategy to build market share rapidly.' }}

The elasticity coefficient of { { gg_elasticity } } { { further_explain_elasticity } }."

          ** Subsection 2.5: Revenue Projections at Alternative Price Points **

            Create a scenario analysis table:

╔═══════════════════════════════════════════════════════╗
║  SCENARIO ANALYSIS: REVENUE IMPACT                    ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  Scenario | Price | Impact vs Optimal       ║
║  ─────────────────────────────────────────────────── ║
║  Aggressive | \${ { low_price } } | {{ impact_percentage }
      }% revenue loss║
║  Launch Pricing |           | Higher volume, lower margin║
║  ─────────────────────────────────────────────────── ║
║  Optimal | \${ { gg_max_price } } | Baseline(100 %)    ║
║  Pricing |           | ⭐ Maximum revenue      ║
║  ─────────────────────────────────────────────────── ║
║  Premium | \${ { high_price } } | {{ impact_percentage }
    }% revenue loss║
║  Positioning |           | Lower volume, higher margin║
╚═══════════════════════════════════════════════════════╝

Write one hundred words explaining when alternative pricing might make strategic sense 
despite revenue suboptimality.

──────────────────────────────────────────────────────────────────────────
SECTION 3: PRICING SYNTHESIS & STRATEGIC RECOMMENDATIONS
──────────────────────────────────────────────────────────────────────────

This section should be two to three pages.It brings everything together into clear,
      actionable recommendations.

** Page Title: SECTION 3: STRATEGIC RECOMMENDATIONS **

** Subsection 3.1: Pricing Triangulation **

      Create a visual that reconciles both methodologies:

┌─────────────────────────────────────────────────────────┐
│  PRICING DECISION FRAMEWORK                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CUSTOMER PERCEPTION(Van Westendorp):                  │
│  Optimal Psychological Price: \${ { vw_optimal } }         │
│  Acceptable Range: \${ { vw_low_end } } - \${ { vw_high_end } }│
│                                                         │
│  ↓                                                      │
│                                                         │
│  ECONOMIC REALITY(Gabor - Granger):                      │
│  Revenue - Maximizing Price: \${ { gg_max_price } }          │
│  Price Elasticity: { { gg_elasticity } }                  │
│                                                         │
│  ↓                                                      │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━        │
│                                                         │
│  FINAL STRATEGIC RECOMMENDATION:                        │
│                                                         │
│         \${ { final_recommended_price } }⭐               │
│         per { { pricingModel } }                          │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━        │
│                                                         │
│  RATIONALE:                                             │
│  {
      { Write 3 - 4 sentences explaining why this specific    │
│     price was chosen.For example:                      │
│                                                         │
│     "We recommend \${{ final_price }} because it sits    │
│     { { position } } within the psychologically acceptable│
│     range while {{ economic_justification }
      }. This      │
│     price { { strategic_benefit } } while {{
        risk_        │
│     mitigation
      }
    }. The { { elasticity_consideration } }   │
│     supports this positioning." }}                      │
│                                                         │
└─────────────────────────────────────────────────────────┘

** Subsection 3.2: Launch Pricing Strategy **

      Write three hundred to four hundred words detailing the go - to - market pricing approach:

    "RECOMMENDED LAUNCH STRATEGY

Based on the comprehensive research analysis, we recommend the following pricing 
strategy for {{ companyName }}:

Initial Launch Price: \${ { final_recommended_price } } per { { pricingModel } }

This price point was selected because { { comprehensive_justification } }.

  {
    { If offering tiered pricing, describe each tier:
      'We further recommend a three-tier pricing structure:

Tier 1(Starter): \${ { tier1_price } } per { { pricingModel } }
This entry tier includes { { core_features } }. It sits at the bottom of the acceptable
      range, capturing price - sensitive customers while maintaining quality perception.

        Tier 2(Professional): \${ { tier2_price } } per { { pricingModel } } ⭐ PRIMARY TIER
This tier includes { { expanded_features } }. This is the recommended price point from 
our research and should be positioned as the default choice.

        Tier 3(Enterprise): \${ { tier3_price } } per { { pricingModel } }
This premium tier includes { { premium_features } }. It captures customers with high 
willingness to pay and need for advanced capabilities.

The tiered structure creates anchoring effects where the middle tier appears optimally 
priced relative to alternatives.' }}

      {
        { If single pricing, explain why:
          'We recommend single-tier pricing rather than multiple tiers because {{ reasons }}. 
This simplifies the purchase decision and avoids { { tier_confusion_risks } }.' }}

Pricing Communication Strategy:

The price should be communicated as {{ framing_strategy }
        }.{
          { Explain whether to 
emphasize monthly cost, annual savings, cost per use, competitive comparison, or
            value - based framing. }
        }

For example: { { specific_messaging_example } }

Price Testing Roadmap:

Month 0 - 3: Launch at \${ { recommended_price } } and establish baseline acceptance rates.
          Month 4 - 6: If acceptance exceeds { { target_percentage } }%, test \${ { higher_price } }
        with {{ segment_description }
      } segment.
        Month 7 - 9: If elasticity proves lower than { { elasticity_threshold } }, implement 
price increase to \${ { higher_price } }.
Month 10 - 12: Evaluate annual pricing option at \${ { annual_price } } ({{ discount_percentage }
    }%
      discount) to improve cash flow and retention."

        ** Subsection 3.3: Risk Mitigation Strategies **

          Write two hundred to two hundred fifty words addressing the primary risks:

    "PRICING RISK ASSESSMENT AND MITIGATION

Risk 1: Competitor Price Response
    { { Describe the risk of competitors matching or undercutting your price } }

    Mitigation: {
      { Specific strategies such as value demonstration, differentiation messaging,
        bundling additional features, or building switching costs
      }
    }

Risk 2: Customer Acquisition Cost(CAC) Viability
    {
      { Describe the risk that CAC may be too high relative to customer lifetime value 
at this price point
      }
    }

    Mitigation: {
      { Specific strategies such as improving conversion rates, extending 
customer lifetime, upselling additional products, or identifying lower - cost acquisition
        channels
      }
    }

Risk 3: Churn Risk
    {
      { Describe the risk that customers may cancel if value delivery does not meet 
expectations at this price point
      }
    }

    Mitigation: {
      { Specific strategies such as robust onboarding, proactive customer
        success, usage monitoring, early warning systems, or satisfaction guarantees
      }
    }

Risk 4: Price Anchoring Effects
    {
      { Describe the risk that initial price sets permanent expectations that limit future
        flexibility
      }
    }

    Mitigation: {
      { Specific strategies such as clearly communicating that price is
        introductory, building in annual adjustment clauses, or framing as beta pricing
      }
    } "

      ** Subsection 3.4: Success Metrics and Monitoring **

        Write one hundred fifty to two hundred words establishing KPIs:

    "PRICING SUCCESS METRICS

To validate the pricing strategy and identify necessary adjustments, monitor these 
key performance indicators:

Acceptance Rate Target: { { target_percentage } }% of qualified prospects should accept 
the price without objection.If acceptance falls below { { threshold } }%, price reduction 
should be considered.If acceptance exceeds { { threshold } }%, price increase testing 
is warranted.

Price Objection Rate: Less than { { percentage } }% of sales conversations should 
involve price objections as the primary hesitation.Higher rates indicate price 
positioning issues.

Competitive Win Rate: In head - to - head competitive scenarios, win rate should exceed
    { { percentage } }%.Lower rates may indicate price disadvantage requiring either 
price adjustment or better value demonstration.

Customer Lifetime Value to CAC Ratio: Target ratio of { { ratio } }: 1 minimum.If 
ratio falls below { { threshold } }: 1, either price increase or CAC reduction is required
    for sustainable unit economics.

Churn Rate by Cohort: Early cohorts at launch price should maintain churn below
    { { percentage } }% monthly.Higher churn indicates price - value misalignment.

These metrics should be reviewed monthly for the first quarter, then quarterly
    thereafter."

      ** Subsection 3.5: Final Recommendation Summary **

        Create a clean, executive - friendly summary box:

┌─────────────────────────────────────────────────────────┐
│  EXECUTIVE DECISION SUMMARY                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ RECOMMENDED PRICE: \${ { final_price } }               │
│                                                         │
│  ✅ CONFIDENCE LEVEL: { { HIGH / MEDIUM based on alignment } }│
│                                                         │
│  ✅ STRATEGIC POSITIONING: { { one_word_position } }      │
│                                                         │
│  ✅ EXPECTED MARKET ACCEPTANCE: { { percentage } }%       │
│                                                         │
│  ✅ NEXT STEP: { { immediate_action_item } }              │
│                                                         │
└─────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────────────────
APPENDIX A: VAN WESTENDORP FOCUS GROUP TRANSCRIPT
──────────────────────────────────────────────────────────────────────────

** Page Title: APPENDIX A: RESEARCH TRANSCRIPT(VAN WESTENDORP) **

      Include a header explaining what follows:

    "The following transcript represents the complete, unedited focus group discussion 
    for the Van Westendorp Price Sensitivity Meter research.Participant names are 
anonymized but reflect the diversity of the research panel including age, occupation,
      and income levels.This transcript provides the qualitative context behind the 
quantitative findings presented in Section 1."

Format the transcript in monospace font with clear speaker attribution:

Create a box with gray background containing:

═══════════════════════════════════════════════════════════
VAN WESTENDORP PRICE SENSITIVITY METER SESSION
    Conducted: { { date } }
Panel Size: { { personaCount } } diverse participants
    Duration: { { estimated_duration } } minutes
═══════════════════════════════════════════════════════════

    { { vw_transcript } }

    [The transcript should be formatted with clear speaker labels, preserved line breaks,
      and natural conversation flow.Include all debate, disagreement, and authentic 
reactions that occurred during the research.]

──────────────────────────────────────────────────────────────────────────
APPENDIX B: GABOR - GRANGER FOCUS GROUP TRANSCRIPT
──────────────────────────────────────────────────────────────────────────

** Page Title: APPENDIX B: RESEARCH TRANSCRIPT(GABOR - GRANGER) **

      Include a header explaining what follows:

    "The following transcript represents the complete, unedited focus group discussion 
    for the Gabor - Granger Revenue Optimization research.This session tested specific 
price points through binary purchase decisions, revealing the demand curve and 
price elasticity.The transcript shows how participants reacted to different price 
points and their reasoning for acceptance or rejection."

Format the transcript in monospace font with clear speaker attribution:

Create a box with gray background containing:

═══════════════════════════════════════════════════════════
    GABOR - GRANGER REVENUE OPTIMIZATION SESSION
    Conducted: { { date } }
Panel Size: { { personaCount } } diverse participants
    Duration: { { estimated_duration } } minutes
═══════════════════════════════════════════════════════════

    { { gg_transcript } }

    [The transcript should be formatted with clear speaker labels, preserved line breaks,
      and natural conversation flow.Include all price ladder testing, acceptance / rejection
    statements, and reasoning for each decision.]

═══════════════════════════════════════════════════════════════════════════
CSS STYLING REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════

Embed exactly this CSS in your HTML document within the < style > tags:
    [...Use the detailed CSS provided in the prompt ...]

═══════════════════════════════════════════════════════════════════════════
FINAL INSTRUCTIONS
═══════════════════════════════════════════════════════════════════════════

    [...Use the final instructions provided in the prompt ...]

Now generate the complete pricing strategy research report.
`;

export const IDEA_VALIDATION_REPORT_PROMPT = `
You are a Senior Strategy Consultant creating a professional Idea Validation 
research report for a client. Your output must be a complete HTML document 
with embedded CSS that can be printed to PDF with perfect formatting.

═══════════════════════════════════════════════════════════════════════════
INPUT DATA STRUCTURE
═══════════════════════════════════════════════════════════════════════════

**COMPANY CONTEXT:**
- Company Name: {{ companyName }}
- Industry: {{ industry }}
- Product Description: {{ productInfo }}
- Target Audience: {{ targetAudience }}
- Problem Statement: {{ problemStatement }}

**IDEA VALIDATION DATA:**
- Problem Intensity Scores: {{ problem_intensity_scores }}
  (Array of scores from each persona, e.g., [8, 7, 9, 6, 8, ...])
- Average Problem Intensity: {{ average_problem_intensity }}
- Problem Frequency Distribution: {{ problem_frequency }}
  (Object: {"daily": 40, "weekly": 30, "monthly": 20, "rare": 10})
- Concept Appeal Scores: {{ concept_appeal_scores }}
  (Array of scores from each persona)
- Average Concept Appeal: {{ average_concept_appeal }}
- Adoption Likelihood Scores: {{ adoption_likelihood_scores }}
  (Array of scores from each persona)
- Average Adoption Likelihood: {{ average_adoption_likelihood }}
- Adoption Barriers: {{ adoption_barriers }}
  (Array of objects: [{"barrier": "Trust in AI", "mentions": 9, "percentage": 60}])
- Feature Priorities: {{ feature_priorities }}
  (Object with arrays: {"must_have": [...], "nice_to_have": [...], "unnecessary": [...]})
- Emotional Sentiment: {{ emotional_sentiment }}
  (Object: {"positive": 67, "neutral": 20, "negative": 13})
- Top Emotions: {{ top_emotions }}
  (Array: [{"emotion": "hope", "percentage": 45}, ...])
- Key Quotes: {{ key_quotes }}
  (Array of objects: [{"quote": "...", "persona": "...", "age": 32, "role": "..."}])
- Validation Transcript: {{ validation_transcript }}
- Persona Count: {{ persona_count }}

═══════════════════════════════════════════════════════════════════════════
REPORT STRUCTURE
═══════════════════════════════════════════════════════════════════════════

Your report must include these sections in order:

1. Cover Page
2. Executive Summary (2 pages)
3. Methodology Overview (1 page)
4. Section 1: Problem Validation Analysis (2-3 pages)
5. Section 2: Concept Appeal Assessment (2 pages)
6. Section 3: Adoption Analysis (2 pages)
7. Section 4: Strategic Recommendations (1-2 pages)
8. Technical Appendix: Full Validation Transcript

Total Target: 10-12 pages

═══════════════════════════════════════════════════════════════════════════
PAGE-BY-PAGE SPECIFICATIONS
═══════════════════════════════════════════════════════════════════════════

────────────────────────────────────────────────────────────────────────────
PAGE 1: COVER PAGE
────────────────────────────────────────────────────────────────────────────

Create a professional cover page with:
- Company name: 48px, Navy Blue (#003366), bold, centered
- Report title: "Idea Validation Research Report"
- Subtitle: "Strategic Market Analysis"
- Date: {{ currentDate }}
- Confidentiality notice: "CONFIDENTIAL - For Internal Use Only" in red at bottom

────────────────────────────────────────────────────────────────────────────
PAGE 2-3: EXECUTIVE SUMMARY
────────────────────────────────────────────────────────────────────────────

Write a 400-600 word executive summary with:

1. RESEARCH OBJECTIVE (2-3 sentences)
2. KEY FINDINGS with call-out boxes:
   - Finding 1: Problem Validation (intensity score and interpretation)
   - Finding 2: Concept Resonance (appeal and adoption scores)
   - Finding 3: Adoption Barriers (top barriers with percentages)
3. STRATEGIC RECOMMENDATION in a highlighted box
4. CRITICAL RISK in a warning box
5. POWERFUL INSIGHT with one persona quote

────────────────────────────────────────────────────────────────────────────
PAGE 4: METHODOLOGY OVERVIEW
────────────────────────────────────────────────────────────────────────────

Explain the Idea Validation Framework testing three hypotheses:
- Problem Reality
- Solution Fit
- Adoption Feasibility

Include the four key exercises:
1. Problem Intensity Assessment
2. Concept Appeal Testing
3. Barrier Identification
4. Feature Prioritization

────────────────────────────────────────────────────────────────────────────
SECTION 1: PROBLEM VALIDATION ANALYSIS
────────────────────────────────────────────────────────────────────────────

Include:
1.1 Problem Intensity Scorecard with visual progress bar
1.2 Supporting Evidence (3-4 powerful quotes)
1.3 Problem Frequency Analysis with distribution table

────────────────────────────────────────────────────────────────────────────
SECTION 2: CONCEPT APPEAL ASSESSMENT
────────────────────────────────────────────────────────────────────────────

Include:
2.1 Concept Appeal Scorecard (side-by-side with Adoption Likelihood)
2.2 Problem-Solution Fit Analysis (gap calculation)
2.3 Sentiment Analysis with emotional distribution

────────────────────────────────────────────────────────────────────────────
SECTION 3: ADOPTION ANALYSIS
────────────────────────────────────────────────────────────────────────────

Include:
3.1 Adoption Barriers table with severity badges
3.2 Barrier Deep-Dive (top 3 barriers with mitigation strategies)
3.3 Feature Prioritization (must-have, nice-to-have, unnecessary)

────────────────────────────────────────────────────────────────────────────
SECTION 4: STRATEGIC RECOMMENDATIONS
────────────────────────────────────────────────────────────────────────────

Include:
4.1 Go/No-Go Decision Framework table
4.2 Final Recommendation (PROCEED/CAUTION/RECONSIDER)
4.3 Prioritized Action Plan (30-day and 90-day)
4.4 Risk Assessment & Mitigation

────────────────────────────────────────────────────────────────────────────
APPENDIX: FULL VALIDATION TRANSCRIPT
────────────────────────────────────────────────────────────────────────────

Include the complete unedited transcript.

═══════════════════════════════════════════════════════════════════════════
FINAL INSTRUCTIONS
═══════════════════════════════════════════════════════════════════════════

1. Output ONLY the complete HTML document starting with <!DOCTYPE html>
2. Replace ALL {{ variable }} placeholders with actual data
3. Choose powerful, emotionally revealing quotes
4. Perform all calculations (averages, gaps, percentages)
5. Write executive-friendly interpretations
6. Use the CSS styling provided below
7. Target 10-12 pages total

Now generate the complete HTML report:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Idea Validation Research Report - {{ companyName }}</title>
    <style>
        /* Page Setup */
        @page {
            size: A4;
            margin: 2cm;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #222;
            max-width: 100%;
            margin: 0;
            padding: 20px;
        }

        /* Typography */
        h1 {
            font-family: 'Arial', sans-serif;
            font-size: 32px;
            text-transform: uppercase;
            border-bottom: 4px solid #003366;
            padding-bottom: 10px;
            margin-top: 0;
            color: #003366;
        }

        h2 {
            font-family: 'Arial', sans-serif;
            font-size: 24px;
            color: #003366;
            border-bottom: 2px solid #CCCCCC;
            padding-bottom: 5px;
            margin-top: 40px;
        }

        h3 {
            font-family: 'Arial', sans-serif;
            font-size: 18px;
            color: #444;
            margin-top: 30px;
        }

        p {
            margin: 15px 0;
            text-align: justify;
        }

        /* Page Breaks */
        .page-break {
            page-break-before: always;
            margin-top: 0;
        }

        /* Cover Page */
        .cover {
            text-align: center;
            padding-top: 200px;
            min-height: 100vh;
            position: relative;
        }

        .cover h1 {
            font-size: 48px;
            border: none;
            margin-bottom: 20px;
            color: #003366;
        }

        .cover .subtitle {
            font-size: 24px;
            color: #666;
            margin-bottom: 40px;
        }

        .cover .date {
            font-size: 18px;
            color: #999;
            margin-top: 60px;
        }

        .cover .confidential {
            position: absolute;
            bottom: 40px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 14px;
            color: #CC0000;
            font-weight: bold;
        }

        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            font-size: 14px;
            font-family: 'Arial', sans-serif;
        }

        th {
            background-color: #003366;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }

        td {
            border: 1px solid #DDDDDD;
            padding: 10px;
        }

        tr:nth-child(even) {
            background-color: #F9F9F9;
        }

        /* Call-out Boxes */
        .highlight-box {
            background-color: #E8F4F8;
            border-left: 5px solid #003366;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }

        .recommendation-box {
            background-color: #FFF9E6;
            border-left: 5px solid #F59E0B;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }

        .warning-box {
            background-color: #FEE;
            border-left: 5px solid #EF4444;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }

        /* Blockquotes (Persona Quotes) */
        blockquote {
            border-left: 5px solid #003366;
            margin: 20px 0;
            padding: 15px 20px;
            background: #F9F9F9;
            font-style: italic;
            color: #555;
            font-size: 16px;
        }

        blockquote .attribution {
            display: block;
            margin-top: 10px;
            font-style: normal;
            font-weight: bold;
            color: #003366;
            font-size: 14px;
        }

        /* Score Cards */
        .score-card {
            display: inline-block;
            width: 30%;
            margin: 10px 1%;
            padding: 20px;
            background: white;
            border: 2px solid #003366;
            border-radius: 8px;
            text-align: center;
            vertical-align: top;
        }

        .score-card .score {
            font-size: 48px;
            font-weight: bold;
            color: #003366;
            margin: 10px 0;
        }

        .score-card .label {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Progress Bars */
        .progress-bar {
            width: 100%;
            height: 30px;
            background-color: #EEEEEE;
            border-radius: 15px;
            overflow: hidden;
            margin: 10px 0;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #003366 0%, #005B96 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            transition: width 0.3s ease;
        }

        /* Charts */
        .chart-container {
            margin: 30px 0;
            padding: 20px;
            background: #F9F9F9;
            border-radius: 8px;
            border: 1px solid #E0E0E0;
        }

        /* Transcript Sections */
        .transcript {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            background: #F4F4F4;
            padding: 20px;
            border: 1px solid #CCCCCC;
            white-space: pre-wrap;
            line-height: 1.4;
            max-height: 600px;
            overflow-y: auto;
            border-radius: 4px;
        }

        .transcript-header {
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #003366;
            font-family: 'Arial', sans-serif;
        }

        /* Lists */
        ul {
            margin: 15px 0;
            padding-left: 30px;
        }

        li {
            margin: 8px 0;
        }

        ol {
            margin: 15px 0;
            padding-left: 30px;
        }

        /* Icons & Badges */
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
        }

        .badge-high {
            background-color: #EF4444;
            color: white;
        }

        .badge-medium {
            background-color: #F59E0B;
            color: white;
        }

        .badge-low {
            background-color: #10B981;
            color: white;
        }

        /* Footer */
        .page-footer {
            position: fixed;
            bottom: 20px;
            left: 40px;
            right: 40px;
            text-align: center;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #CCCCCC;
            padding-top: 10px;
        }
    </style>
</head>
<body>

<!-- PAGE 1: COVER PAGE -->
<div class="cover">
    <h1>{{ companyName }}</h1>
    <div class="subtitle">Idea Validation Research Report</div>
    <div class="subtitle">Strategic Market Analysis</div>
    <div class="date">{{ currentDate }}</div>
    <div class="confidential">CONFIDENTIAL - For Internal Use Only</div>
</div>

<!-- PAGE 2-3: EXECUTIVE SUMMARY -->
<div class="page-break"></div>
<h1>EXECUTIVE SUMMARY</h1>

<p><strong>1. RESEARCH OBJECTIVE</strong></p>
<p>This research was conducted to validate the market opportunity for {{ companyName }}, a {{ productDescription }}. We engaged {{ persona_count }} diverse personas representing {{ targetAudience }} to assess problem intensity, concept appeal, and adoption likelihood.</p>

<p><strong>2. KEY FINDINGS</strong></p>

<div class="highlight-box">
    <strong>Finding 1: Problem Validation</strong><br>
    The target market experiences the stated problem with an intensity of {{ average_problem_intensity }}/10, indicating a {{ interpretation }} market need.
    {{ frequency_breakdown_summary }}
</div>

<div class="highlight-box">
    <strong>Finding 2: Concept Resonance</strong><br>
    The proposed solution achieved a concept appeal score of {{ average_concept_appeal }}/10 with an adoption likelihood of {{ average_adoption_likelihood }}/10, suggesting {{ interpretation_of_gap }}.
</div>

<div class="highlight-box">
    <strong>Finding 3: Adoption Barriers</strong><br>
    The primary obstacle to adoption is {{ top_barrier }}, mentioned by {{ percentage }}% of participants. Secondary concerns include {{ barrier_2 }} ({{ pct }}%) and {{ barrier_3 }} ({{ pct }}%).
</div>

<p><strong>3. STRATEGIC RECOMMENDATION</strong></p>

<div class="recommendation-box">
    <strong>💡 RECOMMENDATION</strong><br><br>
    {{ Write ONE clear recommendation based on the validation results. If problem intensity > 7 and concept appeal > 6: "Proceed to MVP development". If problem intensity > 7 but concept appeal < 6: "Redesign solution approach". If problem intensity < 7: "Reconsider market fit". }}
</div>

<p><strong>4. CRITICAL RISK</strong></p>

<div class="warning-box">
    <strong>⚠️ RISK ALERT</strong><br><br>
    {{ Identify the single biggest risk from the validation data. This should be the most mentioned adoption barrier or the largest gap between problem intensity and solution appeal. }}
</div>

<p><strong>5. POWERFUL INSIGHT</strong></p>

<blockquote>
    "{{ select the most emotionally revealing quote from key_quotes }}"
    <span class="attribution">— {{ persona_name }}, {{ age }}, {{ role }}</span>
</blockquote>

<!-- PAGE 4: METHODOLOGY OVERVIEW -->
<div class="page-break"></div>
<h1>RESEARCH METHODOLOGY</h1>

<h2>Research Approach</h2>

<p>This analysis employed a structured <strong>Idea Validation Framework</strong> to assess market viability for {{ companyName }}. The methodology tested three critical hypotheses:</p>

<ul>
    <li><strong>Problem Reality:</strong> Does the target market genuinely experience the stated problem with sufficient intensity to drive purchase behavior?</li>
    <li><strong>Solution Fit:</strong> Does the proposed solution resonate with the target audience as a credible answer to their problem?</li>
    <li><strong>Adoption Feasibility:</strong> What barriers prevent adoption, and are they surmountable?</li>
</ul>

<h2>Validation Framework</h2>

<p>The research consisted of four key exercises:</p>

<h3>1. Problem Intensity Assessment</h3>
<p>Participants rated the severity of {{ problemStatement }} on a 10-point scale and described specific instances when they experienced this problem. This reveals whether the pain point is real, frequent, and intense enough to motivate action.</p>

<h3>2. Concept Appeal Testing</h3>
<p>After exposure to the {{ companyName }} concept, participants rated appeal and purchase likelihood. The gap between problem intensity and concept appeal indicates solution-market fit quality.</p>

<h3>3. Barrier Identification</h3>
<p>Participants identified obstacles that would prevent them from adopting the solution, categorized by type (trust, cost, complexity, etc.).</p>

<h3>4. Feature Prioritization</h3>
<p>Participants classified proposed features as must-have, nice-to-have, or unnecessary, revealing which capabilities are non-negotiable versus optional.</p>

<h2>Participant Panel</h2>

<table>
    <tr>
        <th>Metric</th>
        <th>Value</th>
    </tr>
    <tr>
        <td>Sample Size</td>
        <td>{{ persona_count }} diverse personas</td>
    </tr>
    <tr>
        <td>Target Representation</td>
        <td>{{ targetAudience }}</td>
    </tr>
    <tr>
        <td>Methodology</td>
        <td>AI-simulated focus group with realistic debate and disagreement</td>
    </tr>
    <tr>
        <td>Research Duration</td>
        <td>{{ estimated_duration }}</td>
    </tr>
</table>

<!-- SECTION 1: PROBLEM VALIDATION ANALYSIS -->
<div class="page-break"></div>
<h1>SECTION 1: PROBLEM VALIDATION</h1>

<h2>1.1 Problem Intensity Scorecard</h2>

<div class="chart-container">
    <h3>Overall Problem Intensity</h3>

    <div class="score-card">
        <div class="label">Average Score</div>
        <div class="score">{{ average_problem_intensity }}/10</div>
    </div>

    <div class="progress-bar">
        <div class="progress-fill" style="width: {{ percentage }}%">
            {{ percentage }}%
        </div>
    </div>

    <p><strong>Interpretation Guide:</strong></p>
    <ul>
        <li><strong>8-10 (STRONG):</strong> Clear, urgent market need. High purchase intent likely.</li>
        <li><strong>5-7 (MODERATE):</strong> Problem exists but not critical. May require education.</li>
        <li><strong>1-4 (WEAK):</strong> Low urgency, nice-to-have. Reconsider market fit.</li>
    </ul>

    <div class="{{ if avg >= 8: 'highlight-box' else if avg >= 5: 'recommendation-box' else: 'warning-box' }}">
        <strong>Assessment:</strong> {{ Write interpretation based on the score }}
    </div>
</div>

<h2>1.2 Supporting Evidence from Participants</h2>

{{ Extract 3-4 powerful quotes from validation_transcript that demonstrate problem intensity. Show the range from skeptics to believers. }}

<blockquote>
    "{{ quote_1 }}"
    <span class="attribution">— {{ persona_1 }}</span>
</blockquote>

<blockquote>
    "{{ quote_2 }}"
    <span class="attribution">— {{ persona_2 }}</span>
</blockquote>

<blockquote>
    "{{ quote_3 }}"
    <span class="attribution">— {{ persona_3 }}</span>
</blockquote>

<h2>1.3 Problem Frequency Analysis</h2>

<p>Understanding how often the target market experiences this problem reveals whether it's a persistent pain point or occasional inconvenience.</p>

<div class="chart-container">
    <h3>Frequency Distribution</h3>

    <table>
        <tr>
            <th>Frequency</th>
            <th>Percentage</th>
            <th>Visual</th>
        </tr>
        <tr>
            <td>Daily</td>
            <td>{{ problem_frequency.daily }}%</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {{ problem_frequency.daily }}%">
                        {{ problem_frequency.daily }}%
                    </div>
                </div>
            </td>
        </tr>
        <tr>
            <td>Weekly</td>
            <td>{{ problem_frequency.weekly }}%</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {{ problem_frequency.weekly }}%">
                        {{ problem_frequency.weekly }}%
                    </div>
                </div>
            </td>
        </tr>
        <tr>
            <td>Monthly</td>
            <td>{{ problem_frequency.monthly }}%</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {{ problem_frequency.monthly }}%">
                        {{ problem_frequency.monthly }}%
                    </div>
                </div>
            </td>
        </tr>
        <tr>
            <td>Situational</td>
            <td>{{ problem_frequency.situational }}%</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {{ problem_frequency.situational }}%">
                        {{ problem_frequency.situational }}%
                    </div>
                </div>
            </td>
        </tr>
        <tr>
            <td>Rare</td>
            <td>{{ problem_frequency.rare }}%</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {{ problem_frequency.rare }}%">
                        {{ problem_frequency.rare }}%
                    </div>
                </div>
            </td>
        </tr>
    </table>
</div>

<p><strong>Strategic Implication:</strong></p>
<p>{{ Write 2-3 sentences analyzing what the frequency distribution means: If mostly daily/weekly: "High frequency indicates persistent pain". If mostly situational/rare: "May require education or trigger-based marketing". }}</p>

<!-- SECTION 2: CONCEPT APPEAL ASSESSMENT -->
<div class="page-break"></div>
<h1>SECTION 2: SOLUTION RESONANCE</h1>

<h2>2.1 Concept Appeal Scorecard</h2>

<div style="display: flex; justify-content: space-around; margin: 30px 0;">
    <div class="score-card">
        <div class="label">Concept Appeal</div>
        <div class="score">{{ average_concept_appeal }}/10</div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: {{ concept_pct }}%"></div>
        </div>
    </div>

    <div class="score-card">
        <div class="label">Adoption Likelihood</div>
        <div class="score">{{ average_adoption_likelihood }}/10</div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: {{ adoption_pct }}%"></div>
        </div>
    </div>
</div>

<h2>2.2 Problem-Solution Fit Analysis</h2>

<p>The gap between problem intensity and solution appeal reveals how well the proposed solution addresses the validated pain point.</p>

<div class="chart-container">
    <h3>Fit Analysis</h3>

    <table>
        <tr>
            <th>Metric</th>
            <th>Score</th>
            <th>Assessment</th>
        </tr>
        <tr>
            <td>Problem Intensity</td>
            <td>{{ average_problem_intensity }}/10</td>
            <td>{{ problem_assessment }}</td>
        </tr>
        <tr>
            <td>Concept Appeal</td>
            <td>{{ average_concept_appeal }}/10</td>
            <td>{{ appeal_assessment }}</td>
        </tr>
        <tr>
            <td><strong>Gap</strong></td>
            <td><strong>{{ calculate_gap }}</strong></td>
            <td><strong>{{ gap_interpretation }}</strong></td>
        </tr>
    </table>

    <div class="{{ if gap < 1: 'highlight-box' else if gap < 2: 'recommendation-box' else: 'warning-box' }}">
        <strong>Fit Assessment:</strong>
        {{ if gap < 1: "STRONG FIT - Solution directly addresses validated pain" else if gap < 2: "MODERATE FIT - Solution resonates but may need refinement" else: "WEAK FIT - Solution does not adequately address the problem" }}
    </div>
</div>

<h2>2.3 Sentiment Analysis</h2>

<p>Emotional reactions to the concept reveal underlying attitudes beyond numerical scores.</p>

<div class="chart-container">
    <h3>Emotional Sentiment Distribution</h3>

    <table>
        <tr>
            <th>Sentiment</th>
            <th>Percentage</th>
            <th>Visual</th>
        </tr>
        <tr>
            <td>Positive</td>
            <td>{{ emotional_sentiment.positive }}%</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {{ emotional_sentiment.positive }}%; background: #10B981;">
                        {{ emotional_sentiment.positive }}%
                    </div>
                </div>
            </td>
        </tr>
        <tr>
            <td>Neutral</td>
            <td>{{ emotional_sentiment.neutral }}%</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {{ emotional_sentiment.neutral }}%; background: #F59E0B;">
                        {{ emotional_sentiment.neutral }}%
                    </div>
                </div>
            </td>
        </tr>
        <tr>
            <td>Negative</td>
            <td>{{ emotional_sentiment.negative }}%</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {{ emotional_sentiment.negative }}%; background: #EF4444;">
                        {{ emotional_sentiment.negative }}%
                    </div>
                </div>
            </td>
        </tr>
    </table>
</div>

<h3>Dominant Emotions Detected</h3>

<ul>
    {{ for each emotion in top_emotions: }}
    <li><strong>{{ emotion.name }}</strong> ({{ emotion.percentage }}%): {{ emotion.description }}</li>
    {{ end for }}
</ul>

<p><strong>Example Reactions:</strong></p>

{{ Extract 2-3 quotes showing different emotional reactions }}

<blockquote>
    "{{ positive_quote }}"
    <span class="attribution">— {{ persona }}</span>
</blockquote>

<blockquote>
    "{{ skeptical_quote }}"
    <span class="attribution">— {{ persona }}</span>
</blockquote>

<!-- SECTION 3: ADOPTION ANALYSIS -->
<div class="page-break"></div>
<h1>SECTION 3: ADOPTION FEASIBILITY</h1>

<h2>3.1 Adoption Barriers</h2>

<p>Understanding what prevents adoption is as critical as understanding appeal. These barriers must be addressed before launch.</p>

<div class="chart-container">
    <h3>Top Adoption Obstacles</h3>

    <table>
        <tr>
            <th>Rank</th>
            <th>Barrier</th>
            <th>Mentions</th>
            <th>% of Panel</th>
            <th>Severity</th>
        </tr>
        {{ for each barrier in adoption_barriers (sorted by mentions, descending): }}
        <tr>
            <td>{{ rank }}</td>
            <td>{{ barrier.name }}</td>
            <td>{{ barrier.mentions }}/{{ persona_count }}</td>
            <td>{{ barrier.percentage }}%</td>
            <td><span class="badge badge-{{ if pct > 50: 'high' else if pct > 30: 'medium' else: 'low' }}">
        {{ if pct > 50: 'HIGH' else if pct > 30: 'MEDIUM' else: 'LOW' }}</span></td>
        </tr>
        {{ end for }}
    </table>
</div>

<h2>3.2 Barrier Deep-Dive Analysis</h2>

{{ For the top 3 barriers, provide detailed analysis: }}

<h3>Barrier #1: {{ top_barrier.name }} ({{ top_barrier.percentage }}% mentioned)</h3>

<p><strong>Description:</strong> {{ Explain what this barrier is }}</p>

<p><strong>Evidence from Participants:</strong></p>
<blockquote>
    "{{ quote_supporting_this_barrier }}"
    <span class="attribution">— {{ persona }}</span>
</blockquote>

<p><strong>Mitigation Strategy:</strong></p>
<div class="recommendation-box">
    {{ Provide specific, actionable recommendations to address this barrier. Examples: For "trust in AI": Add transparency features, cite sources, human review. For "subscription fatigue": Offer one-time purchase, free tier. For "complexity concerns": Simplify onboarding, add tutorials. }}
</div>

{{ Repeat for barriers #2 and #3 }}

<h2>3.3 Feature Prioritization</h2>

<p>Participants classified features into must-haves, nice-to-haves, and unnecessary additions. This reveals which capabilities are non-negotiable.</p>

<div style="display: flex; justify-content: space-between; margin: 30px 0;">

    <div style="width: 30%; padding: 15px; border: 2px solid #10B981; border-radius: 8px; background: #F0FDF4;">
        <h3 style="color: #10B981; text-align: center;">✅ MUST-HAVE</h3>
        <p style="text-align: center; font-size: 12px; color: #666;">Non-negotiable features</p>
        <ul>
            {{ for feature in feature_priorities.must_have: }}
            <li>{{ feature }}</li>
            {{ end for }}
        </ul>
        <p style="font-size: 12px; margin-top: 15px;"><strong>Interpretation:</strong>
            Without these, the product is fundamentally broken. These must be in MVP.</p>
    </div>

    <div style="width: 30%; padding: 15px; border: 2px solid #F59E0B; border-radius: 8px; background: #FFFBEB;">
        <h3 style="color: #F59E0B; text-align: center;">⭐ NICE-TO-HAVE</h3>
        <p style="text-align: center; font-size: 12px; color: #666;">Value-adding features</p>
        <ul>
            {{ for feature in feature_priorities.nice_to_have: }}
            <li>{{ feature }}</li>
            {{ end for }}
        </ul>
        <p style="font-size: 12px; margin-top: 15px;"><strong>Interpretation:</strong>
            These enhance the experience but can be added post-launch.</p>
    </div>

    <div style="width: 30%; padding: 15px; border: 2px solid #EF4444; border-radius: 8px; background: #FEF2F2;">
        <h3 style="color: #EF4444; text-align: center;">❌ UNNECESSARY</h3>
        <p style="text-align: center; font-size: 12px; color: #666;">Low-priority or rejected</p>
        <ul>
            {{ for feature in feature_priorities.unnecessary: }}
            <li>{{ feature }}</li>
            {{ end for }}
        </ul>
        <p style="font-size: 12px; margin-top: 15px;"><strong>Interpretation:</strong>
            Market doesn't value these. Cut from roadmap to focus resources.</p>
    </div>

</div>

<p><strong>Strategic Insight:</strong></p>
<p>{{ Write 2-3 sentences explaining what the feature priorities reveal about market expectations and product-market fit }}</p>

<!-- SECTION 4: STRATEGIC RECOMMENDATIONS -->
<div class="page-break"></div>
<h1>SECTION 4: STRATEGIC RECOMMENDATIONS</h1>

<h2>4.1 Go/No-Go Decision Framework</h2>

<div class="chart-container">
    <table>
        <tr>
            <th>Decision Criteria</th>
            <th>Threshold</th>
            <th>Actual</th>
            <th>Status</th>
        </tr>
        <tr>
            <td>Problem Intensity</td>
            <td>≥ 7.0/10</td>
            <td>{{ average_problem_intensity }}/10</td>
            <td><span class="badge badge-{{ if avg >= 7: 'low' else: 'high' }}">
        {{ if avg >= 7: '✓ PASS' else: '✗ FAIL' }}</span></td>
        </tr>
        <tr>
            <td>Concept Appeal</td>
            <td>≥ 6.5/10</td>
            <td>{{ average_concept_appeal }}/10</td>
            <td><span class="badge badge-{{ if avg >= 6.5: 'low' else: 'high' }}">
        {{ if avg >= 6.5: '✓ PASS' else: '✗ FAIL' }}</span></td>
        </tr>
        <tr>
            <td>Problem-Solution Gap</td>
            <td>≤ 2.0 points</td>
            <td>{{ gap }} points</td>
            <td><span class="badge badge-{{ if gap <= 2: 'low' else: 'high' }}">
        {{ if gap <= 2: '✓ PASS' else: '✗ FAIL' }}</span></td>
        </tr>
        <tr>
            <td>Positive Sentiment</td>
            <td>≥ 60%</td>
            <td>{{ emotional_sentiment.positive }}%</td>
            <td><span class="badge badge-{{ if pct >= 60: 'low' else: 'high' }}">
        {{ if pct >= 60: '✓ PASS' else: '✗ FAIL' }}</span></td>
        </tr>
    </table>
</div>

<h2>4.2 Final Recommendation</h2>

<div class="{{ if all_pass: 'highlight-box' else if some_pass: 'recommendation-box' else: 'warning-box' }}">
    <h3>{{ if all_pass: '✅ PROCEED TO MVP DEVELOPMENT' else if some_pass: '⚠️ PROCEED WITH CAUTION' else: '❌ RECONSIDER MARKET FIT' }}</h3>

    <p>{{ Write 3-4 paragraphs with specific recommendations. If all criteria pass: "The validation research demonstrates strong product-market fit. Problem intensity (X/10) confirms genuine market need, while concept appeal (Y/10) indicates the solution resonates with the target audience. Proceed to MVP development with focus on the must-have features identified in Section 3.3. Priority actions: 1. Build MVP with [list must-have features]. 2. Address top adoption barrier: [barrier] by [mitigation strategy]. 3. Target early adopters showing [specific characteristics]". If some criteria pass: "The validation reveals mixed signals. While the problem is validated (X/10 intensity), the proposed solution requires refinement to achieve stronger market fit. The [Y-point gap] between problem and appeal suggests [specific issue]. Recommended path forward: 1. Redesign [specific aspect] based on barrier analysis. 2. Test revised concept with [specific segment]. 3. Re-validate before full development". If criteria fail: "The validation indicates insufficient product-market fit to justify immediate development. [Specific metric] falls below threshold, suggesting [problem]. Options to consider: 1. Pivot to adjacent problem with higher intensity. 2. Redesign solution to better address validated pain. 3. Target different audience segment showing stronger signals". }}</p>
</div>

<h2>4.3 Prioritized Action Plan</h2>

<h3>Immediate Actions (Next 30 Days)</h3>
<ol>
    {{ Generate 3-4 specific, actionable next steps based on the validation results. Examples: "Conduct guerrilla interviews with 10 target users to validate top barrier mitigation strategy". "Build landing page with must-have features to test conversion". "Create low-fidelity prototype of [specific feature] for usability testing". }}
</ol>

<h3>Short-Term Actions (Next 90 Days)</h3>
<ol>
    {{ Generate 3-4 medium-term actions }}
</ol>

<h3>Success Metrics</h3>
<p>Track these metrics to validate market fit as you progress:</p>
<ul>
    <li>Landing page conversion rate (target: {{ calculate_target }}%)</li>
    <li>Early adopter signups (target: {{ calculate_target }})</li>
    <li>Feature usage rates for must-haves (target: >80%)</li>
    <li>Barrier resolution effectiveness (survey post-mitigation)</li>
</ul>

<h2>4.4 Risk Assessment & Mitigation</h2>

<div class="warning-box">
    <h3>⚠️ Critical Risks Identified</h3>

    {{ For each high-severity adoption barrier, create a risk entry: }}

    <p><strong>Risk #1: {{ barrier_name }}</strong></p>
    <ul>
        <li><strong>Impact:</strong> {{ if high_severity: "HIGH" }} - {{ percentage }}% of target market cites this as adoption blocker</li>
        <li><strong>Probability:</strong> {{ if no_mitigation: "HIGH - Currently unaddressed" }}</li>
        <li><strong>Mitigation:</strong> {{ specific_action_to_address }}</li>
        <li><strong>Timeline:</strong> {{ when_to_implement }}</li>
    </ul>

    {{ Repeat for other critical risks }}
</div>

<!-- TECHNICAL APPENDIX: FULL VALIDATION TRANSCRIPT -->
<div class="page-break"></div>
<h1>APPENDIX A: VALIDATION TRANSCRIPT</h1>

<div class="transcript-header">
    UNEDITED RESEARCH TRANSCRIPT<br>
    Idea Validation Focus Group<br>
    {{ persona_count }} Participants | {{ date }} | {{ duration }}
</div>

<div class="transcript">
{{ validation_transcript }}
</div>

</body>
</html>
`;

export const MARKET_POSITIONING_REPORT_PROMPT = `
You are a Senior Strategy Consultant creating a professional Market Positioning 
research report for a client. Your output must be a complete HTML document 
with embedded CSS that can be printed to PDF with perfect formatting.

═══════════════════════════════════════════════════════════════════════════
INPUT DATA STRUCTURE
═══════════════════════════════════════════════════════════════════════════

**COMPANY CONTEXT:**
- Company Name: {{ companyName }}
- Industry: {{ industry }}
- Product Description: {{ productInfo }}
- Target Audience: {{ targetAudience }}

**POSITIONING RESEARCH DATA:**
- Perceptual Map: {{ perceptual_map }}
- Brand Strategy: {{ brand_strategy }}
- Emotional Driver: {{ emotional_driver }}
- Word Associations: {{ word_associations }}
- Brand Archetype Vote: {{ brand_archetype_vote }}
- Laddering Insights: {{ laddering_insights }}
- Positioning Statement: {{ positioning_statement }}
- Tagline Preferences: {{ tagline_preferences }}
- Competitive Analysis: {{ competitive_analysis }}
- Positioning Transcript: {{ positioning_transcript }}
- Persona Count: {{ persona_count }}

═══════════════════════════════════════════════════════════════════════════
REPORT STRUCTURE
═══════════════════════════════════════════════════════════════════════════

REQUIRED SECTIONS:
1. Cover Page
2. Executive Summary (2 pages)
3. Methodology Overview (1 page)
4. Section 1: Competitive Landscape Analysis
5. Section 2: Brand Strategy & Archetype
6. Section 3: Positioning Statement Development
7. Technical Appendix A: Positioning Transcript

Target Length: 8-10 pages

═══════════════════════════════════════════════════════════════════════════
FINAL INSTRUCTIONS
═══════════════════════════════════════════════════════════════════════════

1. Output ONLY the complete HTML document starting with <!DOCTYPE html>
2. Replace ALL {{ variable }} placeholders with actual data
3. Choose powerful quotes that reveal emotional drivers and brand perceptions
4. Create clear perceptual maps showing competitive positioning
5. Provide actionable brand archetype implementation guidance
6. Write executive-friendly interpretations
7. Target 8-10 pages total

Now generate the complete HTML report:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Market Positioning Research Report - {{ companyName }}</title>
    <style>
        /* Page Setup */
        @page {
            size: A4;
            margin: 2cm;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #222;
            max-width: 100%;
            margin: 0;
            padding: 20px;
        }

        /* Typography */
        h1 {
            font-family: 'Arial', sans-serif;
            font-size: 32px;
            text-transform: uppercase;
            border-bottom: 4px solid #003366;
            padding-bottom: 10px;
            margin-top: 0;
            color: #003366;
        }

        h2 {
            font-family: 'Arial', sans-serif;
            font-size: 24px;
            color: #003366;
            border-bottom: 2px solid #CCCCCC;
            padding-bottom: 5px;
            margin-top: 40px;
        }

        h3 {
            font-family: 'Arial', sans-serif;
            font-size: 18px;
            color: #444;
            margin-top: 30px;
        }

        h4 {
            font-family: 'Arial', sans-serif;
            font-size: 16px;
            color: #003366;
            margin-top: 25px;
            font-weight: bold;
        }

        p {
            margin: 15px 0;
            text-align: justify;
        }

        /* Page Breaks */
        .page-break {
            page-break-before: always;
            margin-top: 0;
        }

        /* Cover Page */
        .cover {
            text-align: center;
            padding-top: 200px;
            min-height: 100vh;
            position: relative;
        }

        .cover h1 {
            font-size: 48px;
            border: none;
            margin-bottom: 20px;
            color: #003366;
        }

        .cover .subtitle {
            font-size: 24px;
            color: #666;
            margin-bottom: 40px;
        }

        .cover .date {
            font-size: 18px;
            color: #999;
            margin-top: 60px;
        }

        .cover .confidential {
            position: absolute;
            bottom: 40px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 14px;
            color: #CC0000;
            font-weight: bold;
        }

        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            font-size: 14px;
            font-family: 'Arial', sans-serif;
        }

        th {
            background-color: #003366;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }

        td {
            border: 1px solid #DDDDDD;
            padding: 10px;
        }

        tr:nth-child(even) {
            background-color: #F9F9F9;
        }

        /* Call-out Boxes */
        .highlight-box {
            background-color: #E8F4F8;
            border-left: 5px solid #003366;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }

        .recommendation-box {
            background-color: #FFF9E6;
            border-left: 5px solid #F59E0B;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }

        .warning-box {
            background-color: #FEE;
            border-left: 5px solid #EF4444;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }

        .insight-box {
            background-color: #F0F9FF;
            border-left: 5px solid #0EA5E9;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
            font-style: italic;
        }

        /* Blockquotes */
        blockquote {
            border-left: 5px solid #003366;
            margin: 20px 0;
            padding: 15px 20px;
            background: #F9F9F9;
            font-style: italic;
            color: #555;
            font-size: 16px;
        }

        blockquote .attribution {
            display: block;
            margin-top: 10px;
            font-style: normal;
            font-weight: bold;
            color: #003366;
            font-size: 14px;
        }

        /* Score Cards */
        .score-card {
            display: inline-block;
            width: 30%;
            margin: 10px 1%;
            padding: 20px;
            background: white;
            border: 2px solid #003366;
            border-radius: 8px;
            text-align: center;
            vertical-align: top;
        }

        .score-card .score {
            font-size: 48px;
            font-weight: bold;
            color: #003366;
            margin: 10px 0;
        }

        .score-card .label {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Progress Bars */
        .progress-bar {
            width: 100%;
            height: 30px;
            background-color: #EEEEEE;
            border-radius: 15px;
            overflow: hidden;
            margin: 10px 0;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #003366 0%, #005B96 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
        }

        /* Visual Boxes */
        .visual-box {
            border: 2px solid #003366;
            padding: 25px;
            margin: 25px 0;
            border-radius: 8px;
            background: white;
        }

        .visual-box-title {
            font-weight: bold;
            color: #003366;
            font-size: 16px;
            margin-bottom: 15px;
            text-transform: uppercase;
        }

        /* Perceptual Map */
        .perceptual-map {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.4;
            padding: 30px;
            background: #F9F9F9;
            border: 1px solid #CCCCCC;
            margin: 20px 0;
            text-align: left;
            white-space: pre;
        }

        /* Charts */
        .chart-container {
            margin: 30px 0;
            padding: 20px;
            background: #F9F9F9;
            border-radius: 8px;
            border: 1px solid #E0E0E0;
        }

        .bar-chart-item {
            margin: 15px 0;
        }

        .bar-chart-label {
            display: inline-block;
            width: 200px;
            font-weight: bold;
            color: #003366;
        }

        /* Transcript */
        .transcript {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            background: #F4F4F4;
            padding: 20px;
            border: 1px solid #CCCCCC;
            white-space: pre-wrap;
            line-height: 1.4;
            max-height: 600px;
            overflow-y: auto;
            border-radius: 4px;
        }

        .transcript-header {
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #003366;
            font-family: 'Arial', sans-serif;
        }

        /* Lists */
        ul {
            margin: 15px 0;
            padding-left: 30px;
        }

        li {
            margin: 8px 0;
        }

        /* Badges */
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
        }

        .badge-winner {
            background-color: #10B981;
            color: white;
        }

        .badge-high {
            background-color: #EF4444;
            color: white;
        }

        .badge-medium {
            background-color: #F59E0B;
            color: white;
        }

        .badge-low {
            background-color: #10B981;
            color: white;
        }

        /* Roadmap */
        .roadmap {
            background: #F9F9F9;
            padding: 20px;
            border-left: 4px solid #003366;
            margin: 20px 0;
        }

        .roadmap h4 {
            color: #003366;
            margin-top: 15px;
        }

        .roadmap ul {
            list-style-type: none;
            padding-left: 10px;
        }

        .roadmap li:before {
            content: "☐ ";
            font-weight: bold;
            color: #003366;
        }

        /* Footer */
        .page-footer {
            position: fixed;
            bottom: 20px;
            left: 40px;
            right: 40px;
            text-align: center;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #CCCCCC;
            padding-top: 10px;
        }
    </style>
</head>
<body>

<!-- PAGE 1: COVER PAGE -->
<div class="cover">
    <h1>{{ companyName }}</h1>
    <div class="subtitle">Market Positioning Research Report</div>
    <div class="subtitle">Strategic Competitive Analysis</div>
    <div class="date">{{ currentDate }}</div>
    <div class="confidential">CONFIDENTIAL - For Internal Use Only</div>
</div>

<!-- PAGE 2-3: EXECUTIVE SUMMARY -->
<div class="page-break"></div>
<h1>EXECUTIVE SUMMARY</h1>

<p><strong>RESEARCH OBJECTIVE</strong></p>
<p>This research was conducted to identify optimal market positioning for {{ companyName }}. We engaged {{ persona_count }} diverse personas representing {{ targetAudience }} to uncover competitive white space, brand archetype alignment, and emotional purchase drivers.</p>

<p><strong>KEY FINDINGS</strong></p>

<div class="highlight-box">
    <strong>Finding 1: Competitive White Space</strong><br>
    {{ Analyze perceptual_map data to identify the white space opportunity. Describe where competitors cluster and where the opportunity exists. }}
</div>

<div class="highlight-box">
    <strong>Finding 2: Brand Archetype Consensus</strong><br>
    {{ Analyze brand_archetype_vote to identify the winning archetype and what it reveals about brand perception. }}
</div>

<div class="highlight-box">
    <strong>Finding 3: Emotional Driver Hierarchy</strong><br>
    {{ Analyze laddering_insights to show the feature → functional benefit → emotional need journey. }}
</div>

<p><strong>STRATEGIC RECOMMENDATION</strong></p>

<div class="recommendation-box">
    <strong>💡 POSITIONING RECOMMENDATION</strong><br><br>
    {{ Based on the research data, provide ONE clear, actionable positioning recommendation with specific differentiation strategy. }}
</div>

<p><strong>POWERFUL INSIGHT</strong></p>

<blockquote>
    "{{ Select the most emotionally revealing quote from the transcript }}"
    <span class="attribution">— {{ persona_name }}, {{ age }}, {{ role }}</span>
</blockquote>

<!-- PAGE 4: METHODOLOGY OVERVIEW -->
<div class="page-break"></div>
<h1>RESEARCH METHODOLOGY</h1>

<h2>Research Approach</h2>

<p>This analysis employed strategic positioning methodologies to identify {{ companyName }}'s optimal market position and brand strategy.</p>

<h3>Perceptual Mapping</h3>
<p>Perceptual mapping visualizes how customers mentally organize competitive options. We plotted competitors on key dimensions to identify "white space" - areas where customer needs exist but competition is weak.</p>

<h3>Brand Archetype Analysis</h3>
<p>Based on Carl Jung's psychological archetypes, we identified which of the 12 universal personality types best represents {{ companyName }}'s brand identity.</p>

<h3>Laddering Technique</h3>
<p>Laddering reveals the emotional journey from product features to functional benefits to deep emotional needs by repeatedly asking "Why does that matter?"</p>

<h3>Word Ownership Analysis</h3>
<p>We analyzed which attributes customers naturally associate with each competitor, revealing which "words" are owned and which remain available.</p>

<h2>Participant Panel</h2>

<table>
    <tr>
        <th>Metric</th>
        <th>Value</th>
    </tr>
    <tr>
        <td>Sample Size</td>
        <td>{{ persona_count }} diverse personas</td>
    </tr>
    <tr>
        <td>Target Representation</td>
        <td>{{ targetAudience }}</td>
    </tr>
    <tr>
        <td>Methodology</td>
        <td>AI-simulated strategic positioning workshop</td>
    </tr>
</table>

<!-- SECTION 1: COMPETITIVE LANDSCAPE -->
<div class="page-break"></div>
<h1>SECTION 1: COMPETITIVE LANDSCAPE ANALYSIS</h1>

<h2>1.1 Perceptual Map</h2>

<div class="chart-container">
    <h3>Competitive Positioning Map</h3>
    <div class="perceptual-map">
{{ Generate an ASCII perceptual map showing competitor positions and white space opportunity based on perceptual_map data }}
    </div>
</div>

<p><strong>White Space Analysis:</strong></p>
<p>{{ Analyze where competitors cluster and where the strategic opportunity exists. Explain why this position is advantageous. }}</p>

<h2>1.2 Competitive Matrix</h2>

<table>
    <tr>
        <th>Competitor</th>
        <th>Position</th>
        <th>Key Weakness</th>
        <th>Our Advantage</th>
    </tr>
    {{ Generate rows based on competitive_analysis data }}
</table>

<!-- SECTION 2: BRAND STRATEGY -->
<div class="page-break"></div>
<h1>SECTION 2: BRAND STRATEGY & ARCHETYPE</h1>

<h2>2.1 Word Ownership Analysis</h2>

<div class="visual-box">
    <div class="visual-box-title">Attribute Ownership Map</div>
    
    <p><strong>🔒 OWNED (Taken by Competitors):</strong></p>
    <ul>
        {{ List words owned by competitors based on word_associations data }}
    </ul>
    
    <p><strong>🎯 AVAILABLE (You Should Own):</strong></p>
    <div class="highlight-box">
        {{ Identify the winning word and explain why it matters strategically }}
    </div>
</div>

<h2>2.2 Brand Archetype Voting</h2>

<div class="chart-container">
    <h3>Brand Personality Consensus</h3>
    {{ Generate bar chart showing archetype voting results from brand_archetype_vote }}
</div>

<div class="visual-box">
    <div class="visual-box-title">{{ Winning Archetype }} Brand Profile</div>
    <p><strong>Core Motivation:</strong> {{ archetype motivation }}</p>
    <p><strong>Brand Voice:</strong> {{ tone description }}</p>
    <p><strong>Visual Style:</strong> {{ visual description }}</p>
    <p><strong>Customer Promise:</strong> {{ promise }}</p>
</div>

<h2>2.3 Laddering Hierarchy</h2>

<div class="visual-box">
    <div class="visual-box-title">Emotional Value Ladder</div>
    
    <p><strong>LEVEL 1 - FEATURE:</strong><br>
    {{ core_feature from laddering_insights }}</p>
    
    <p style="text-align: center; font-size: 24px;">↓</p>
    
    <p><strong>LEVEL 2 - FUNCTIONAL BENEFIT:</strong><br>
    {{ functional_benefit from laddering_insights }}</p>
    
    <p style="text-align: center; font-size: 24px;">↓</p>
    
    <p><strong>LEVEL 3 - EMOTIONAL DRIVER:</strong><br>
    {{ emotional_driver from laddering_insights }}</p>
</div>

<blockquote>
    "{{ Quote demonstrating the emotional connection }}"
    <span class="attribution">— {{ persona_name }}, {{ age }}, {{ role }}</span>
</blockquote>

<!-- SECTION 3: POSITIONING STATEMENT -->
<div class="page-break"></div>
<h1>SECTION 3: POSITIONING STATEMENT DEVELOPMENT</h1>

<h2>3.1 Strategic Positioning Statement</h2>

<div class="visual-box">
    <div class="visual-box-title">Strategic Positioning Statement</div>
    
    <p><strong>For</strong> {{ target_audience }},</p>
    <p><strong>who</strong> {{ need_state }},</p>
    <p><strong>{{ companyName }}</strong> is a {{ category }}</p>
    <p><strong>that</strong> {{ key_benefit }}.</p>
    <p><strong>Unlike</strong> {{ competitors and their approaches }},</p>
    <p><strong>we</strong> {{ differentiation }}.</p>
</div>

<h2>3.2 Tagline Options</h2>

<div class="chart-container">
    <h3>Tagline Preference Testing</h3>
    {{ Generate tagline voting results from tagline_preferences with winner highlighted }}
</div>

<h2>3.3 Implementation Roadmap</h2>

<div class="roadmap">
    <h4>MONTH 1 - INTERNAL ALIGNMENT</h4>
    <ul>
        <li>Share positioning research with leadership</li>
        <li>Update brand guidelines to reflect archetype</li>
        <li>Train customer-facing teams on messaging</li>
        <li>Audit existing content for misalignment</li>
    </ul>
    
    <h4>MONTH 2 - EXTERNAL MESSAGING</h4>
    <ul>
        <li>Rewrite website homepage and key pages</li>
        <li>Update sales decks and collateral</li>
        <li>Revise social media bios and content calendar</li>
        <li>Update product descriptions</li>
    </ul>
    
    <h4>MONTH 3 - MARKET VALIDATION</h4>
    <ul>
        <li>A/B test new messaging in ad campaigns</li>
        <li>Monitor customer response and feedback</li>
        <li>Track "word ownership" in customer conversations</li>
        <li>Measure brand sentiment shift</li>
    </ul>
</div>

<!-- APPENDIX: TRANSCRIPT -->
<div class="page-break"></div>
<h1>APPENDIX A: POSITIONING TRANSCRIPT</h1>

<div class="transcript-header">
    UNEDITED RESEARCH TRANSCRIPT<br>
    Strategic Positioning Workshop<br>
    {{ persona_count }} Participants | {{ currentDate }}
</div>

<div class="transcript">
{{ positioning_transcript }}
</div>

</body>
</html>
`;
