'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Compass, Target, Lightbulb, Users,
    TrendingUp, Loader2, Zap, Award
} from 'lucide-react';

interface PositioningLiveDashboardProps {
    session: any;
    goal: string;
}

interface PositioningMetrics {
    perceptualMaps: Array<{
        xPrice: number;
        yComplexity: number;
        closestCompetitor: string;
        whiteSpace: string;
    }>;
    wordAssociations: {
        ourWords: Record<string, number>;
        competitorWords: Record<string, Record<string, number>>;
    };
    laddering: Array<{
        feature: string;
        functional: string;
        emotional: string;
    }>;
    brandArchetypes: Record<string, number>;
    archetypeReasons: string[];
    positioningElements: {
        targets: string[];
        needs: string[];
        categories: string[];
        benefits: string[];
        differentiations: string[];
    };
    taglines: Record<string, number>;
    keyQuotes: string[];
    respondedCount: number;
    totalPersonas: number;
}

export function PositioningLiveDashboard({ session }: PositioningLiveDashboardProps) {
    // Extract positioning data from session responses
    const metrics = useMemo((): PositioningMetrics => {
        const responses = session.responses || [];
        const messages = session.messages || [];
        const personas = session.project?.personas || [];
        const totalPersonas = personas.length || 8;

        const perceptualMaps: Array<any> = [];
        const wordAssociations = {
            ourWords: {} as Record<string, number>,
            competitorWords: {} as Record<string, Record<string, number>>
        };
        const laddering: Array<any> = [];
        const brandArchetypes: Record<string, number> = {};
        const archetypeReasons: string[] = [];
        const positioningElements = {
            targets: [] as string[],
            needs: [] as string[],
            categories: [] as string[],
            benefits: [] as string[],
            differentiations: [] as string[]
        };
        const taglines: Record<string, number> = {};
        const keyQuotes: string[] = [];
        const respondedPersonas = new Set<string>();

        // Parse analysis data from responses
        responses.forEach((r: any) => {
            if (r.analysis) {
                try {
                    const analysis = JSON.parse(r.analysis);
                    const positioning = analysis.session_specific?.positioning;

                    if (positioning) {
                        // Perceptual map
                        if (positioning.perceptual_map) {
                            const pm = positioning.perceptual_map;
                            if (typeof pm.x_price === 'number' && typeof pm.y_complexity === 'number') {
                                perceptualMaps.push({
                                    xPrice: pm.x_price,
                                    yComplexity: pm.y_complexity,
                                    closestCompetitor: pm.closest_competitor || '',
                                    whiteSpace: pm.white_space_opportunity || ''
                                });
                            }
                        }

                        // Word associations
                        if (positioning.word_associations) {
                            const wa = positioning.word_associations;
                            if (wa.words_we_should_own && Array.isArray(wa.words_we_should_own)) {
                                wa.words_we_should_own.forEach((word: string) => {
                                    if (word && word.trim()) {
                                        wordAssociations.ourWords[word.trim()] = (wordAssociations.ourWords[word.trim()] || 0) + 1;
                                    }
                                });
                            }
                            if (wa.words_competitors_own) {
                                Object.entries(wa.words_competitors_own).forEach(([comp, word]: [string, any]) => {
                                    if (comp && word) {
                                        if (!wordAssociations.competitorWords[comp]) {
                                            wordAssociations.competitorWords[comp] = {};
                                        }
                                        const w = String(word).trim();
                                        wordAssociations.competitorWords[comp][w] = (wordAssociations.competitorWords[comp][w] || 0) + 1;
                                    }
                                });
                            }
                        }

                        // Laddering
                        if (positioning.laddering) {
                            const l = positioning.laddering;
                            if (l.feature_level || l.functional_benefit || l.emotional_driver) {
                                laddering.push({
                                    feature: l.feature_level || '',
                                    functional: l.functional_benefit || '',
                                    emotional: l.emotional_driver || ''
                                });
                            }
                        }

                        // Brand archetype
                        if (positioning.brand_archetype_vote) {
                            const archetype = positioning.brand_archetype_vote.trim();
                            brandArchetypes[archetype] = (brandArchetypes[archetype] || 0) + 1;
                        }
                        if (positioning.brand_archetype_reasoning && positioning.brand_archetype_reasoning.trim()) {
                            archetypeReasons.push(positioning.brand_archetype_reasoning.trim());
                        }

                        // Positioning statement elements
                        if (positioning.positioning_statement_elements) {
                            const pse = positioning.positioning_statement_elements;
                            if (pse.target && pse.target.trim()) positioningElements.targets.push(pse.target.trim());
                            if (pse.need && pse.need.trim()) positioningElements.needs.push(pse.need.trim());
                            if (pse.category && pse.category.trim()) positioningElements.categories.push(pse.category.trim());
                            if (pse.benefit && pse.benefit.trim()) positioningElements.benefits.push(pse.benefit.trim());
                            if (pse.differentiation && pse.differentiation.trim()) positioningElements.differentiations.push(pse.differentiation.trim());
                        }

                        // Tagline
                        if (positioning.tagline_preference && positioning.tagline_preference.trim()) {
                            const tag = positioning.tagline_preference.trim();
                            taglines[tag] = (taglines[tag] || 0) + 1;
                        }
                    }

                    // Key quotes
                    if (analysis.meta?.key_quote && analysis.meta.key_quote.trim()) {
                        keyQuotes.push(analysis.meta.key_quote.trim());
                    }

                    if (r.persona?.name) respondedPersonas.add(r.persona.name);
                } catch {
                    // Skip invalid JSON
                }
            }
        });

        // Also count from messages
        messages.forEach((m: any) => {
            if (m.sender !== 'Moderator') {
                respondedPersonas.add(m.sender);
            }
        });

        return {
            perceptualMaps,
            wordAssociations,
            laddering,
            brandArchetypes,
            archetypeReasons,
            positioningElements,
            taglines,
            keyQuotes,
            respondedCount: respondedPersonas.size,
            totalPersonas
        };
    }, [session.responses, session.messages, session.project?.personas]);

    const isRunning = session.status === 'running';
    const hasData = metrics.respondedCount > 0 && (
        metrics.perceptualMaps.length > 0 ||
        Object.keys(metrics.wordAssociations.ourWords).length > 0 ||
        Object.keys(metrics.brandArchetypes).length > 0
    );

    // Calculate averages for perceptual map
    const avgPosition = useMemo(() => {
        if (metrics.perceptualMaps.length === 0) return null;
        const avgX = metrics.perceptualMaps.reduce((sum, p) => sum + p.xPrice, 0) / metrics.perceptualMaps.length;
        const avgY = metrics.perceptualMaps.reduce((sum, p) => sum + p.yComplexity, 0) / metrics.perceptualMaps.length;
        return { x: avgX, y: avgY };
    }, [metrics.perceptualMaps]);

    // Get top word for us to own
    const topWord = useMemo(() => {
        const entries = Object.entries(metrics.wordAssociations.ourWords);
        if (entries.length === 0) return null;
        return entries.sort(([, a], [, b]) => b - a)[0];
    }, [metrics.wordAssociations.ourWords]);

    // Get top brand archetype
    const topArchetype = useMemo(() => {
        const entries = Object.entries(metrics.brandArchetypes);
        if (entries.length === 0) return null;
        return entries.sort(([, a], [, b]) => b - a)[0];
    }, [metrics.brandArchetypes]);

    // Show loading state
    if (!hasData && isRunning) {
        return (
            <Card className="glass border-0">
                <CardContent className="py-12 text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-3 text-white/50 animate-spin" />
                    <p className="text-white font-medium">Collecting positioning responses...</p>
                    <p className="text-neutral-400 text-sm mt-1">{metrics.respondedCount}/{metrics.totalPersonas} personas responded</p>
                </CardContent>
            </Card>
        );
    }

    if (!hasData && !isRunning) {
        return (
            <Card className="glass border-0">
                <CardContent className="py-8 text-center">
                    <p className="text-neutral-500 text-sm">No positioning data collected yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* HEADER */}
            <Card className="glass border-0">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
                                <Compass className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-white">
                                    Strategic Market Positioning
                                </CardTitle>
                                <p className="text-sm text-neutral-400">
                                    {isRunning ? 'Live Session - Updating...' : 'Analysis Complete'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <Badge variant={isRunning ? 'secondary' : 'default'} className="text-xs bg-white/10 text-white border-none">
                                {isRunning ? 'LIVE' : 'COMPLETE'}
                            </Badge>
                            <p className="text-xs text-neutral-500 mt-1">
                                {metrics.respondedCount}/{metrics.totalPersonas} personas
                            </p>
                        </div>
                    </div>
                </CardHeader>
            </Card>


            {/* PERCEPTUAL MAP */}
            {avgPosition && (
                <Card className="glass border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                            <Target className="h-4 w-4 text-indigo-400" />
                            Perceptual Map
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            {/* Map visualization */}
                            <div className="relative h-48 bg-black/20 rounded border border-white/10 p-4">
                                {/* Y-axis label */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-neutral-500">
                                    HIGH COMPLEXITY
                                </div>

                                {/* X-axis label */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-xs font-medium text-neutral-500">
                                    HIGH PRICE →
                                </div>

                                {/* Grid */}
                                <div className="ml-8 mr-4 mt-4 mb-8 h-full relative border-l-2 border-b-2 border-white/20">
                                    {/* Grid lines */}
                                    <div className="absolute inset-0">
                                        <div className="absolute top-1/2 left-0 right-0 border-t border-white/10 border-dashed"></div>
                                        <div className="absolute left-1/2 top-0 bottom-0 border-l border-white/10 border-dashed"></div>
                                    </div>

                                    {/* Our position */}
                                    <div
                                        className="absolute w-3 h-3 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] rounded-full transform -translate-x-1/2 -translate-y-1/2"
                                        style={{
                                            left: `${avgPosition.x}%`,
                                            bottom: `${avgPosition.y}%`
                                        }}
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-indigo-300">
                                            ⭐ YOUR PRODUCT
                                        </div>
                                    </div>

                                    {/* Competitors (if mentioned) */}
                                    {metrics.perceptualMaps[0]?.closestCompetitor && (
                                        <div
                                            className="absolute w-2 h-2 bg-white/40 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                                            style={{
                                                left: `${Math.min(avgPosition.x + 20, 90)}%`,
                                                bottom: `${Math.min(avgPosition.y + 15, 85)}%`
                                            }}
                                        >
                                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-neutral-500">
                                                {metrics.perceptualMaps[0].closestCompetitor}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* White space opportunity */}
                            {metrics.perceptualMaps[0]?.whiteSpace && (
                                <div className="mt-3 bg-white/5 border border-white/10 rounded p-3">
                                    <p className="text-xs font-medium text-indigo-300 mb-1">💡 Opportunity:</p>
                                    <p className="text-sm text-neutral-300">{metrics.perceptualMaps[0].whiteSpace}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* WORD OWNERSHIP ANALYSIS */}
            {(Object.keys(metrics.wordAssociations.ourWords).length > 0 || Object.keys(metrics.wordAssociations.competitorWords).length > 0) && (
                <Card className="glass border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                            <Zap className="h-4 w-4 text-amber-400" />
                            Word Ownership Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {/* Competitor words */}
                            {Object.entries(metrics.wordAssociations.competitorWords).map(([comp, words]) => {
                                const topWord = Object.entries(words).sort(([, a], [, b]) => b - a)[0];
                                if (!topWord) return null;
                                return (
                                    <div key={comp} className="flex items-center justify-between text-sm p-2 bg-white/5 border border-white/5 rounded">
                                        <span className="font-medium text-neutral-300">{comp}:</span>
                                        <Badge variant="outline" className="border-white/20 text-neutral-400">"{topWord[0]}"</Badge>
                                    </div>
                                );
                            })}

                            {/* Our word */}
                            {topWord && (
                                <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 rounded-lg p-3 mt-4">
                                    <p className="text-xs font-medium mb-1 text-indigo-300">OUR WORD:</p>
                                    <p className="text-lg font-bold text-white">"{topWord[0].toUpperCase()}" ⭐</p>
                                    <p className="text-xs text-indigo-300/70 mt-1">
                                        {topWord[1]} {topWord[1] === 1 ? 'persona' : 'personas'} mentioned this
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* LADDERING HIERARCHY */}
            {metrics.laddering.length > 0 && (
                <Card className="glass border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                            Laddering Hierarchy
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {metrics.laddering.slice(0, 3).map((ladder, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                    {ladder.feature && (
                                        <div className="mb-2">
                                            <span className="text-xs font-medium text-neutral-500">Feature:</span>
                                            <p className="text-sm text-neutral-300 font-medium">"{ladder.feature}"</p>
                                        </div>
                                    )}
                                    {ladder.functional && (
                                        <div className="mb-2 pl-4 border-l-2 border-white/10">
                                            <span className="text-xs font-medium text-neutral-500">Functional Benefit:</span>
                                            <p className="text-sm text-neutral-300">"{ladder.functional}"</p>
                                        </div>
                                    )}
                                    {ladder.emotional && (
                                        <div className="pl-8 border-l-2 border-indigo-500/50">
                                            <span className="text-xs font-medium text-neutral-500">Emotional Driver:</span>
                                            <p className="text-sm text-white font-medium">"{ladder.emotional}"</p>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Deep quote if available */}
                            {metrics.keyQuotes.length > 0 && (
                                <div className="bg-white/5 border-l-4 border-indigo-500 rounded p-3 mt-3">
                                    <p className="text-xs font-medium text-indigo-300 mb-1">💬 Deep Quote:</p>
                                    <p className="text-sm text-neutral-300 italic">"{metrics.keyQuotes[0]}"</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* BRAND ARCHETYPE */}
            {topArchetype && (
                <Card className="glass border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                            <Award className="h-4 w-4 text-amber-400" />
                            Brand Archetype Selection
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-12 w-12 bg-indigo-500/20 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-300 font-bold text-lg">
                                    {topArchetype[0].charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400">Voted Personality:</p>
                                    <p className="text-lg font-bold text-white">{topArchetype[0].toUpperCase()} ⭐</p>
                                    <p className="text-xs text-neutral-500">{topArchetype[1]} votes</p>
                                </div>
                            </div>

                            {metrics.archetypeReasons.length > 0 && (
                                <div className="bg-white/5 border border-white/10 rounded p-3">
                                    <p className="text-xs font-medium text-neutral-400 mb-1">Why:</p>
                                    <p className="text-sm text-neutral-300 italic">"{metrics.archetypeReasons[0]}"</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* POSITIONING STATEMENT */}
            {(metrics.positioningElements.targets.length > 0 || metrics.positioningElements.benefits.length > 0) && (
                <Card className="glass border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                            <Users className="h-4 w-4 text-blue-400" />
                            Final Positioning Statement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                            {metrics.positioningElements.targets.length > 0 && (
                                <p className="text-sm text-neutral-300">
                                    <span className="font-semibold text-white">For</span> {metrics.positioningElements.targets[0]},
                                </p>
                            )}
                            {metrics.positioningElements.needs.length > 0 && (
                                <p className="text-sm text-neutral-300">
                                    <span className="font-semibold text-white">who</span> {metrics.positioningElements.needs[0]},
                                </p>
                            )}
                            {metrics.positioningElements.categories.length > 0 && metrics.positioningElements.benefits.length > 0 && (
                                <p className="text-sm text-neutral-300">
                                    <span className="font-semibold text-white">[Product Name] is a</span> {metrics.positioningElements.categories[0]} <span className="font-semibold text-white">that</span> {metrics.positioningElements.benefits[0]}.
                                </p>
                            )}
                            {metrics.positioningElements.differentiations.length > 0 && (
                                <p className="text-sm text-neutral-300">
                                    <span className="font-semibold text-white">Unlike</span> competitors, {metrics.positioningElements.differentiations[0]}.
                                </p>
                            )}

                            {/* Tagline options */}
                            {Object.keys(metrics.taglines).length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-xs font-medium text-neutral-400 mb-2">Tagline Options:</p>
                                    <div className="space-y-1">
                                        {Object.entries(metrics.taglines)
                                            .sort(([, a], [, b]) => b - a)
                                            .slice(0, 3)
                                            .map(([tag, count], i) => (
                                                <div key={i} className="flex items-center justify-between text-sm">
                                                    <span className="text-neutral-300">• "{tag}"</span>
                                                    <span className="text-xs text-neutral-500">{count} votes</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* COMPETITIVE DIFFERENTIATION */}
            {Object.keys(metrics.wordAssociations.competitorWords).length > 0 && (
                <Card className="glass border-0 bg-indigo-900/10">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 bg-indigo-500/20 border border-indigo-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Lightbulb className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-white mb-3">Competitive Differentiation</h3>
                                <div className="space-y-2">
                                    {Object.entries(metrics.wordAssociations.competitorWords).slice(0, 3).map(([comp, words]) => {
                                        const topWord = Object.entries(words).sort(([, a], [, b]) => b - a)[0];
                                        if (!topWord) return null;
                                        return (
                                            <div key={comp} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                                <p className="text-xs text-neutral-500">vs. {comp}:</p>
                                                <p className="text-sm text-neutral-300 font-medium">
                                                    "We're different from their '{topWord[0]}' approach"
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
