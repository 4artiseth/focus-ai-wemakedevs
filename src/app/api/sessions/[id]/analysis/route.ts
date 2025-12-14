import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/sessions/[id]/analysis
 * Fetch aggregated analysis data for a session
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    // Fetch all insights for this session
    const insights = await prisma.insight.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
    });

    // Fetch all responses with analysis data
    const responses = await prisma.response.findMany({
      where: { sessionId },
      include: {
        persona: {
          select: {
            name: true,
            age: true,
            occupation: true,
          },
        },
      },
    });

    // Parse analysis data from responses
    const analysisData = responses
      .filter((r: any) => r.analysis)
      .map((r: any) => {
        try {
          return {
            personaName: r.persona.name,
            personaAge: r.persona.age,
            personaOccupation: r.persona.occupation,
            question: r.question,
            answer: r.answer,
            analysis: JSON.parse(r.analysis!),
          };
        } catch (e) {
          return null;
        }
      })
      .filter((a) => a !== null);

    // Find aggregated metrics insight
    const aggregatedInsight = insights.find(
      (i) => i.type === "aggregated_metrics"
    );
    const validationInsight = insights.find(
      (i) => i.type === "validation_insights"
    );

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        totalResponses: responses.length,
        responsesWithAnalysis: analysisData.length,
        aggregatedMetrics: aggregatedInsight
          ? JSON.parse(aggregatedInsight.content)
          : null,
        validationInsights: validationInsight
          ? JSON.parse(validationInsight.content)
          : null,
        individualAnalyses: analysisData,
        allInsights: insights.map((i) => ({
          type: i.type,
          content:
            i.type.includes("json") || i.type.includes("metrics")
              ? JSON.parse(i.content)
              : i.content,
          confidence: i.confidence,
          createdAt: i.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("[API] Failed to fetch analysis:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch analysis data",
      },
      { status: 500 }
    );
  }
}
