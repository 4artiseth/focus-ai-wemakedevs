
import { runAdvancedPricingSimulation } from '../lib/analysis/pricing';

async function runTest() {
    console.log("Starting Advanced Pricing Simulation Test...\n");

    const mockProject = {
        name: "Test Product",
        description: "A revolutionary widget.",
        audience: "Tech enthusiasts",
        researchGoal: "Test Pricing Strategy",
        details: {
            pricingModel: "Monthly",
            priceExpected: "50",
            competitors: "CompA, CompB",
            coreFeatures: "Feature A, Feature B",
            premiumFeatures: "Feature C",
            customQuestions: JSON.stringify(["Does this replace Excel?"]),
            priceMin: "10",
            priceMax: "100"
        }
    };

    const mockPersonas = [
        { name: "Alice", age: 30, occupation: "Dev", income: "100k", bio: "Loves tech", traits: "Early adopter" },
        { name: "Bob", age: 40, occupation: "Manager", income: "80k", bio: "Pragmatic", traits: "Skeptic" }
    ];

    const mockLLMCaller = async (messages: any[]) => {
        const content = messages[1].content;

        if (content.includes("Van Westendorp")) {
            console.log("   -> Mocking VW Response");
            return `
[TRANSCRIPT_VW]
Moderator: Welcome everyone.
Alice: I think $30 is a bargain.
Bob: $30 is too cheap, suspicious.
...
{
  "vw_low_end": 25,
  "vw_high_end": 75,
  "vw_optimal_price": 45,
  "vw_competitor_comparison": "Cheaper than CompA",
  "vw_custom_question_insight": "Alice thinks it replaces Excel."
}
`;
        }

        if (content.includes("Gabor-Granger")) {
            console.log("   -> Mocking GG Response");
            return `
[TRANSCRIPT_GG]
Moderator: Would you buy at $50?
Alice: Yes.
Bob: No.
...
**ANALYSIS DATA**
{
  "gg_transcript_summary": "Resistance starts at $60.",
  "gg_revenue_max_price": 50,
  "gg_elasticity": -1.5,
  "gg_optimal_revenue_points": [
      { "price": 30, "purchase_probability": 0.8, "revenue": 2400 },
      { "price": 50, "purchase_probability": 0.6, "revenue": 3000 }
  ]
}
`;
        }

        if (content.includes("Final Pricing Strategy Report")) {
            console.log("   -> Mocking Report Response");
            return "# Final Pricing Report\n\nRecommended Price: $49.\n...";
        }

        return "Unknown Prompt";
    };

    try {
        const result = await runAdvancedPricingSimulation(mockProject, mockPersonas, mockLLMCaller);

        console.log("\nTest Results:");
        console.log("VW Data:", result.vw);
        console.log("GG Data:", result.gg);
        console.log("Report Length:", result.report.length);
        console.log("Transcript Length:", result.transcript.length);

        if (result.vw.vw_optimal_price === 45 && result.gg.gg_revenue_max_price === 50 && result.report.includes("Final Pricing Report")) {
            console.log("\n✅ SUCCESS: Parsed all data and generated report correctly.");
        } else {
            console.error("\n❌ FAILURE: Data mismatch or missing report.");
        }

    } catch (e) {
        console.error("\n❌ ERROR:", e);
    }
}

runTest().catch(console.error);
