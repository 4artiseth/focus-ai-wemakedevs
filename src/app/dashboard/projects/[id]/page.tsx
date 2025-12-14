import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonaGenerator } from '@/components/dashboard/PersonaGenerator';
import { PersonaGrid } from '@/components/dashboard/PersonaGrid';
import { StartSessionButton } from '@/components/dashboard/StartSessionButton';
import { ResultsView } from '@/components/dashboard/ResultsView';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            personas: true,
            details: true,
            sessions: {
                include: {
                    responses: {
                        include: { persona: true }
                    },
                    insights: true,
                    messages: {
                        orderBy: { createdAt: 'asc' }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        }
    });

    if (!project) return <div>Project not found</div>;
    const latestSession = project.sessions[0];

    return (
        <div className="container mx-auto py-10 space-y-8" suppressHydrationWarning>
            {/* 1. Header Section */}
            <div className="flex justify-between items-center" suppressHydrationWarning>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{project.name}</h1>
                    <p className="text-neutral-300">{project.description}</p>
                </div>
                {project.personas.length > 0 && (!latestSession || latestSession.status !== 'running') && (
                    <StartSessionButton projectId={project.id} label={latestSession ? "Start New Session" : "Start Focus Group Session"} />
                )}
                {latestSession?.status === 'running' && (
                    <Badge variant="secondary" className="h-10 px-4 text-sm flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Simulation in Progress...
                    </Badge>
                )}
            </div>

            {/* 2. Project Details (Always Visible) */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight text-white">Project Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="glass border-0">
                        <CardHeader><CardTitle className="text-white">Target Audience</CardTitle></CardHeader>
                        <CardContent className="text-neutral-200">{project.audience}</CardContent>
                    </Card>
                    <Card className="glass border-0">
                        <CardHeader><CardTitle className="text-white">Research Goal</CardTitle></CardHeader>
                        <CardContent className="capitalize text-neutral-200">{project.researchGoal}</CardContent>
                    </Card>
                    <Card className="glass border-0">
                        <CardHeader><CardTitle className="text-white">Panel Size</CardTitle></CardHeader>
                        <CardContent className="text-neutral-200">{project.panelSize} Personas</CardContent>
                    </Card>
                </div>
            </div>

            <hr className="border-t border-border" />

            {/* 3. Session Results (High Priority - Show immediately if available) */}
            {/* 3. Session Results (High Priority - Show immediately if available) */}
            {latestSession && (
                <div className="space-y-8">
                    <ResultsView session={{ ...latestSession, project }} />
                    <hr className="border-t border-border" />
                </div>
            )}

            {/* 4. Generated Personas (Collapsible) */}
            {project.personas.length > 0 ? (
                <PersonaGrid
                    personas={project.personas}
                    projectId={id}
                    expectedCount={project.panelSize}
                    initiallyExpanded={!latestSession} // Auto-collapse if session exists
                    showGenerator={!latestSession || latestSession.status !== 'running'}
                />
            ) : (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">Generated Personas</h2>
                    <PersonaGenerator projectId={id} />
                </div>
            )}
        </div>
    );
}
