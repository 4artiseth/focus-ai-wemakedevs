import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        details: true,
        settings: true,
        personas: true,
        sessions: {
          include: {
            responses: {
              include: {
                persona: true,
              },
            },
            messages: true,
            insights: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching database:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database data' },
      { status: 500 }
    );
  }
}


