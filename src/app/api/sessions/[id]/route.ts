import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        responses: {
          include: { persona: true },
          orderBy: { createdAt: "asc" },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
        insights: true,
        project: {
          include: {
            personas: true,
            details: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Failed to fetch session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
