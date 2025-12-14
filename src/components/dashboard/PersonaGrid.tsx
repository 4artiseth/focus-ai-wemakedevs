'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import { PersonaGenerator } from './PersonaGenerator';

interface PersonaGridProps {
    personas: any[];
    projectId: string;
    expectedCount: number;
    initiallyExpanded?: boolean;
    showGenerator?: boolean;
}

export function PersonaGrid({ personas: initialPersonas, projectId, expectedCount, initiallyExpanded = true, showGenerator = false }: PersonaGridProps) {
    const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
    const [personas, setPersonas] = useState(initialPersonas);
    const [isPolling, setIsPolling] = useState(false);

    // Poll for updates if we have fewer personas than expected (indicating generation in progress)
    useEffect(() => {
        if (personas.length < expectedCount && expectedCount > 0) {
            setIsPolling(true);
            const interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/projects/${projectId}/personas`);
                    if (res.ok) {
                        const data = await res.json();
                        setPersonas(data.personas);
                        if (data.personas.length >= expectedCount) {
                            setIsPolling(false);
                            clearInterval(interval);
                        }
                    }
                } catch (e) {
                    console.error("Polling error:", e);
                }
            }, 2000); // Poll every 2 seconds

            return () => clearInterval(interval);
        } else {
            setIsPolling(false);
        }
    }, [projectId, expectedCount, personas.length]);

    // Update local state if props change (e.g. initial load or manual refresh)
    useEffect(() => {
        setPersonas(initialPersonas);
    }, [initialPersonas]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <h2 className="text-2xl font-bold text-white">Focus Group Participants</h2>
                    <Badge variant="secondary" className="ml-2 flex gap-2 items-center">
                        {personas.length} / {expectedCount}
                        {isPolling && <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />}
                    </Badge>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-white" /> : <ChevronDown className="h-5 w-5 text-white" />}
                </div>

                {showGenerator && (
                    <PersonaGenerator projectId={projectId} isRegenerate={true} />
                )}
            </div>

            {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-300">
                    {personas.map((p: any) => (
                        <Card key={p.id} className="glass border-0 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start gap-2">
                                    <CardTitle className="text-base font-semibold leading-tight text-white">{p.name}</CardTitle>
                                    <Badge variant="outline" className="text-xs shrink-0 text-white border-white/20">{p.age}</Badge>
                                </div>
                                <p className="text-xs text-neutral-300 line-clamp-1">{p.occupation}</p>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-xs text-neutral-300 line-clamp-3 mt-2">{p.bio}</p>
                            </CardContent>
                        </Card>
                    ))}
                    {/* Skeleton placeholders for remaining */}
                    {isPolling && Array.from({ length: Math.max(0, expectedCount - personas.length) }).map((_, i) => (
                        <Card key={`skeleton-${i}`} className="bg-muted/5 border-dashed opacity-50">
                            <CardHeader className="p-4 pb-2">
                                <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="h-16 w-full bg-muted rounded animate-pulse mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
