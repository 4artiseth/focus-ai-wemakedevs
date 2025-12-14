'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Lightbulb, Target, AlertTriangle, CheckCircle2,
    TrendingUp, Heart, Smile, Frown, Meh, BarChart3,
    Loader2, XCircle, Zap
} from 'lucide-react';

interface ValidationLiveDashboardProps {
    session: any;
    goal: string;
}

interface ValidationMetrics {
    problemIntensity: number[];
    conceptAppeal: number[];
    adoptionLikelihood: number[];
    problemFrequency: Record<string, number>;
    adoptionBarriers: Record<string, number>;
    featurePriorities: { mustHave: Record<string, number>; niceToHave: Record<string, number>; unnecessary: Record<string, number> };
    emotions: Record<string, number>;
    keyQuotes: string[];
    respondedCount: number;
    totalPersonas: number;
    progress: number;
}

export function ValidationLiveDashboard({ session }: ValidationLiveDashboardProps) {
    // Extract validation data from session responses and messages
    const metrics = useMemo((): ValidationMetrics => {
        const responses = session.responses || [];
        const messages = session.messages || [];
        const personas = session.project?.personas || [];
        const totalPersonas = personas.length || 8;

        // Initialize collectors - NO DEFAULT DATA
        const problemIntensity: number[] = [];
        const conceptAppeal: number[] = [];
        const adoptionLikelihood: number[] = [];
        const problemFrequency: Record<string, number> = {};
        const adoptionBarriers: Record<string, number> = {};
        const featurePriorities = {
            mustHave: {} as Record<string, number>,
            niceToHave: {} as Record<string, number>,
            unnecessary: {} as Record<string, number>
        };
        const emotions: Record<string, number> = {};
        const keyQuotes: string[] = [];

        // Track unique respondents
        const respondedPersonas = new Set<string>();

        // Parse analysis data from responses
        responses.forEach((r: any) => {
            if (r.analysis) {
                try {
                    const analysis = JSON.parse(r.analysis);

                    // Extract core metrics
                    if (analysis.core_metrics) {
                        const cm = analysis.core_metrics;
                        if (typeof cm.pain_intensity === 'number') problemIntensity.push(cm.pain_intensity);
                        if (typeof cm.confidence_in_product === 'number') conceptAppeal.push(cm.confidence_in_product);
                        if (cm.primary_emotion) {
                            emotions[cm.primary_emotion] = (emotions[cm.primary_emotion] || 0) + 1;
                        }
                    }

                    // Extract validation-specific data
                    const validation = analysis.session_specific?.validation;
                    if (validation) {
                        if (typeof validation.problem_reality_score === 'number') problemIntensity.push(validation.problem_reality_score);
                        if (typeof validation.concept_appeal === 'number') conceptAppeal.push(validation.concept_appeal);
                        if (typeof validation.adoption_likelihood === 'number') adoptionLikelihood.push(validation.adoption_likelihood);

                        // Problem frequency
                        if (validation.problem_frequency) {
                            const freq = validation.problem_frequency.toLowerCase();
                            problemFrequency[freq] = (problemFrequency[freq] || 0) + 1;
                        }

                        // Adoption barriers
                        if (validation.adoption_barriers && Array.isArray(validation.adoption_barriers)) {
                            validation.adoption_barriers.forEach((barrier: string) => {
                                if (barrier && barrier.trim()) {
                                    adoptionBarriers[barrier.trim()] = (adoptionBarriers[barrier.trim()] || 0) + 1;
                                }
                            });
                        }

                        // Feature priorities
                        if (validation.feature_priorities) {
                            const fp = validation.feature_priorities;
                            if (fp.must_have && Array.isArray(fp.must_have)) {
                                fp.must_have.forEach((f: string) => {
                                    if (f && f.trim()) featurePriorities.mustHave[f.trim()] = (featurePriorities.mustHave[f.trim()] || 0) + 1;
                                });
                            }
                            if (fp.nice_to_have && Array.isArray(fp.nice_to_have)) {
                                fp.nice_to_have.forEach((f: string) => {
                                    if (f && f.trim()) featurePriorities.niceToHave[f.trim()] = (featurePriorities.niceToHave[f.trim()] || 0) + 1;
                                });
                            }
                            if (fp.unnecessary && Array.isArray(fp.unnecessary)) {
                                fp.unnecessary.forEach((f: string) => {
                                    if (f && f.trim()) featurePriorities.unnecessary[f.trim()] = (featurePriorities.unnecessary[f.trim()] || 0) + 1;
                                });
                            }
                        }
                    }

                    // Extract key quotes
                    if (analysis.meta?.key_quote && analysis.meta.key_quote.trim()) {
                        keyQuotes.push(analysis.meta.key_quote.trim());
                    }

                    if (r.persona?.name) respondedPersonas.add(r.persona.name);
                } catch {
                    // Skip invalid JSON
                }
            }
        });

        // Track which personas we've seen in messages (for counting only)
        messages.forEach((m: any) => {
            if (m.sender !== 'Moderator') {
                respondedPersonas.add(m.sender);
            }
        });

        // ONLY extract hints from messages if we don't have structured data from responses
        // This prevents double-counting and ensures accuracy
        const hasStructuredData = responses.some((r: any) => {
            try {
                if (r.analysis) {
                    const analysis = JSON.parse(r.analysis);
                    return analysis.session_specific?.validation;
                }
            } catch { }
            return false;
        });

        // Only use message parsing as fallback if no structured data exists
        if (!hasStructuredData) {
            const processedPersonas = new Set<string>();

            messages.forEach((m: any) => {
                if (m.sender !== 'Moderator' && !processedPersonas.has(m.sender)) {
                    processedPersonas.add(m.sender);

                    const content = (m.content || '').toLowerCase();

                    // Extract emotion hints from content (only once per persona)
                    if (content.includes('excited') || content.includes('love') || content.includes('great')) {
                        emotions['excited'] = (emotions['excited'] || 0) + 1;
                    } else if (content.includes('skeptic') || content.includes('doubt') || content.includes('concern')) {
                        emotions['skeptical'] = (emotions['skeptical'] || 0) + 1;
                    } else if (content.includes('hope') || content.includes('promising')) {
                        emotions['hopeful'] = (emotions['hopeful'] || 0) + 1;
                    }

                    // Extract frequency hints (only once per persona)
                    if (content.includes('daily') || content.includes('every day')) {
                        problemFrequency['daily'] = (problemFrequency['daily'] || 0) + 1;
                    } else if (content.includes('weekly') || content.includes('every week')) {
                        problemFrequency['weekly'] = (problemFrequency['weekly'] || 0) + 1;
                    } else if (content.includes('monthly')) {
                        problemFrequency['monthly'] = (problemFrequency['monthly'] || 0) + 1;
                    }

                    // Extract barrier hints (only once per persona)
                    if (content.includes('trust') || content.includes('accuracy')) {
                        adoptionBarriers['Trust in AI accuracy'] = (adoptionBarriers['Trust in AI accuracy'] || 0) + 1;
                    }
                    if (content.includes('subscription') || content.includes('another app')) {
                        adoptionBarriers['Subscription fatigue'] = (adoptionBarriers['Subscription fatigue'] || 0) + 1;
                    }
                    if (content.includes('professional') || content.includes('career')) {
                        adoptionBarriers['Professional concerns'] = (adoptionBarriers['Professional concerns'] || 0) + 1;
                    }
                    if (content.includes('privacy') || content.includes('data')) {
                        adoptionBarriers['Privacy concerns'] = (adoptionBarriers['Privacy concerns'] || 0) + 1;
                    }
                }
            });
        }

        const respondedCount = respondedPersonas.size;
        const progress = session.status === 'completed' ? 100 : Math.min(99, Math.round((respondedCount / totalPersonas) * 100));

        return {
            problemIntensity,
            conceptAppeal,
            adoptionLikelihood,
            problemFrequency,
            adoptionBarriers,
            featurePriorities,
            emotions,
            keyQuotes,
            respondedCount,
            totalPersonas,
            progress
        };
    }, [session.responses, session.messages, session.project?.personas, session.status]);

    // Calculate averages - returns null if no data
    const scores = useMemo(() => {
        const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

        return {
            problemIntensity: avg(metrics.problemIntensity),
            conceptAppeal: avg(metrics.conceptAppeal),
            adoptionLikelihood: avg(metrics.adoptionLikelihood)
        };
    }, [metrics]);

    // Calculate frequency breakdown - only from real data
    const frequencyBreakdown = useMemo(() => {
        const total = Object.values(metrics.problemFrequency).reduce((a, b) => a + b, 0);
        if (total === 0) return [];

        return Object.entries(metrics.problemFrequency)
            .map(([freq, count]) => ({
                label: freq.charAt(0).toUpperCase() + freq.slice(1),
                count,
                percentage: Math.round((count / total) * 100)
            }))
            .sort((a, b) => b.count - a.count);
    }, [metrics.problemFrequency]);

    // Calculate top barriers - only from real data
    const topBarriers = useMemo(() => {
        const entries = Object.entries(metrics.adoptionBarriers);
        if (entries.length === 0) return [];

        const total = metrics.respondedCount || 1;
        return entries
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([barrier, count]) => ({
                barrier,
                count,
                percentage: Math.round((count / total) * 100)
            }));
    }, [metrics.adoptionBarriers, metrics.respondedCount]);

    // Calculate feature priority counts - only from real data
    const featureCounts = useMemo(() => {
        const mustHaveCount = Object.values(metrics.featurePriorities.mustHave).reduce((a, b) => a + b, 0);
        const niceToHaveCount = Object.values(metrics.featurePriorities.niceToHave).reduce((a, b) => a + b, 0);
        const unnecessaryCount = Object.values(metrics.featurePriorities.unnecessary).reduce((a, b) => a + b, 0);

        const total = mustHaveCount + niceToHaveCount + unnecessaryCount;
        if (total === 0) return null;

        return { mustHave: mustHaveCount, niceToHave: niceToHaveCount, unnecessary: unnecessaryCount, total };
    }, [metrics.featurePriorities]);

    // Calculate emotion breakdown - only from real data
    const emotionBreakdown = useMemo(() => {
        const total = Object.values(metrics.emotions).reduce((a, b) => a + b, 0);
        if (total === 0) return null;

        // Categorize emotions
        let positive = 0, neutral = 0, negative = 0;
        const emotionList: Array<{ emotion: string; count: number }> = [];

        Object.entries(metrics.emotions).forEach(([emotion, count]) => {
            emotionList.push({ emotion, count });
            const e = emotion.toLowerCase();
            if (['excited', 'hopeful', 'happy', 'relief', 'optimistic', 'interested'].includes(e)) {
                positive += count;
            } else if (['skeptical', 'frustrated', 'worried', 'anxious', 'concerned'].includes(e)) {
                negative += count;
            } else {
                neutral += count;
            }
        });

        const dominant = emotionList
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map(e => ({
                emotion: e.emotion.charAt(0).toUpperCase() + e.emotion.slice(1),
                percentage: Math.round((e.count / total) * 100)
            }));

        return {
            positive: Math.round((positive / total) * 100),
            neutral: Math.round((neutral / total) * 100),
            negative: Math.round((negative / total) * 100),
            dominant
        };
    }, [metrics.emotions]);

    const isRunning = session.status === 'running';
    const hasAnyData = metrics.respondedCount > 0;

    // Helper to get score status
    const getScoreStatus = (score: number, thresholds: { high: number; medium: number }) => {
        if (score >= thresholds.high) return { label: 'STRONG', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
        if (score >= thresholds.medium) return { label: 'GOOD', color: 'text-amber-400', bg: 'bg-amber-500/20' };
        return { label: 'MEDIUM', color: 'text-neutral-400', bg: 'bg-white/10' };
    };

    // Show loading state if no data yet
    if (!hasAnyData && isRunning) {
        return (
            <Card className="glass border-0">
                <CardContent className="py-12 text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-3 text-white/50 animate-spin" />
                    <p className="text-white font-medium">Collecting validation responses...</p>
                    <p className="text-neutral-400 text-sm mt-1">{metrics.respondedCount}/{metrics.totalPersonas} personas responded</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* HEADER: Idea Validation Dashboard */}
            <Card className="glass border-0">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                                <Lightbulb className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-white">
                                    Idea Validation Dashboard
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


            {/* THREE SCORE CARDS - Only show if we have data */}
            {(scores.problemIntensity !== null || scores.conceptAppeal !== null || scores.adoptionLikelihood !== null) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Problem Intensity */}
                    {scores.problemIntensity !== null && (
                        <Card className="glass border-0">
                            <CardContent className="pt-4 pb-4">
                                <div className="text-center">
                                    <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                                        Problem Intensity
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-2">
                                        {scores.problemIntensity.toFixed(1)}<span className="text-lg text-neutral-500">/10</span>
                                    </div>
                                    <Progress
                                        value={scores.problemIntensity * 10}
                                        className="h-2 mb-2 bg-white/10"
                                        indicatorClassName={scores.problemIntensity >= 8 ? "bg-rose-500" : "bg-neutral-400"}
                                    />
                                    <Badge variant="outline" className={`text-xs border-0 ${getScoreStatus(scores.problemIntensity, { high: 8, medium: 6 }).bg} ${getScoreStatus(scores.problemIntensity, { high: 8, medium: 6 }).color}`}>
                                        {getScoreStatus(scores.problemIntensity, { high: 8, medium: 6 }).label}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Concept Appeal */}
                    {scores.conceptAppeal !== null && (
                        <Card className="glass border-0">
                            <CardContent className="pt-4 pb-4">
                                <div className="text-center">
                                    <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                                        Concept Appeal
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-2">
                                        {scores.conceptAppeal.toFixed(1)}<span className="text-lg text-neutral-500">/10</span>
                                    </div>
                                    <Progress
                                        value={scores.conceptAppeal * 10}
                                        className="h-2 mb-2 bg-white/10"
                                        indicatorClassName={scores.conceptAppeal >= 7.5 ? "bg-emerald-500" : "bg-neutral-400"}
                                    />
                                    <Badge variant="outline" className={`text-xs border-0 ${getScoreStatus(scores.conceptAppeal, { high: 7.5, medium: 6 }).bg} ${getScoreStatus(scores.conceptAppeal, { high: 7.5, medium: 6 }).color}`}>
                                        {getScoreStatus(scores.conceptAppeal, { high: 7.5, medium: 6 }).label}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Adoption Likelihood */}
                    {scores.adoptionLikelihood !== null && (
                        <Card className="glass border-0">
                            <CardContent className="pt-4 pb-4">
                                <div className="text-center">
                                    <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                                        Adoption Likelihood
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-2">
                                        {scores.adoptionLikelihood.toFixed(1)}<span className="text-lg text-neutral-500">/10</span>
                                    </div>
                                    <Progress
                                        value={scores.adoptionLikelihood * 10}
                                        className="h-2 mb-2 bg-white/10"
                                        indicatorClassName={scores.adoptionLikelihood >= 7 ? "bg-blue-500" : "bg-neutral-400"}
                                    />
                                    <Badge variant="outline" className={`text-xs border-0 ${getScoreStatus(scores.adoptionLikelihood, { high: 7, medium: 5 }).bg} ${getScoreStatus(scores.adoptionLikelihood, { high: 7, medium: 5 }).color}`}>
                                        {getScoreStatus(scores.adoptionLikelihood, { high: 7, medium: 5 }).label}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* PROBLEM FREQUENCY BREAKDOWN - Only show if we have data */}
            {frequencyBreakdown.length > 0 && (
                <Card className="glass border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                            <BarChart3 className="h-4 w-4 text-emerald-400" />
                            Problem Frequency Breakdown
                            {isRunning && <span className="text-xs font-normal text-neutral-400 ml-1">(Updating...)</span>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {frequencyBreakdown.map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-neutral-300">{item.label}</span>
                                        <span className="text-neutral-500 text-xs">
                                            {item.percentage}% ({item.count} personas)
                                        </span>
                                    </div>
                                    <Progress
                                        value={item.percentage}
                                        className="h-2 bg-white/10"
                                        indicatorClassName="bg-emerald-500/80"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* TOP ADOPTION BARRIERS - Only show if we have data */}
            {topBarriers.length > 0 && (
                <Card className="glass border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                            <AlertTriangle className="h-4 w-4 text-rose-400" />
                            Top Adoption Barriers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topBarriers.map((item, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="h-6 w-6 bg-white/10 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                {i + 1}
                                            </span>
                                            <span className="font-medium text-white text-sm">{item.barrier}</span>
                                        </div>
                                        <span className="text-neutral-400 font-semibold text-sm">{item.percentage}%</span>
                                    </div>
                                    <Progress
                                        value={item.percentage}
                                        className="h-1.5 bg-white/10"
                                        indicatorClassName="bg-rose-500/80"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* FEATURE PRIORITY HEATMAP - Only show if we have data */}
            {featureCounts && (
                <Card className="glass border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                            <Target className="h-4 w-4 text-emerald-400" />
                            Feature Priority Heatmap
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {/* Must-Have */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        <span className="font-medium text-white">Must-Have</span>
                                    </div>
                                    <span className="text-neutral-400 font-semibold">{featureCounts.mustHave} votes</span>
                                </div>
                                <Progress
                                    value={(featureCounts.mustHave / featureCounts.total) * 100}
                                    className="h-3 bg-white/10"
                                    indicatorClassName="bg-emerald-500"
                                />
                            </div>

                            {/* Nice-to-Have */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-blue-400" />
                                        <span className="font-medium text-neutral-300">Nice-to-Have</span>
                                    </div>
                                    <span className="text-neutral-500 font-semibold">{featureCounts.niceToHave} votes</span>
                                </div>
                                <Progress
                                    value={(featureCounts.niceToHave / featureCounts.total) * 100}
                                    className="h-3 bg-white/10"
                                    indicatorClassName="bg-blue-500"
                                />
                            </div>

                            {/* Unnecessary */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-rose-400" />
                                        <span className="font-medium text-neutral-400">Unnecessary</span>
                                    </div>
                                    <span className="text-neutral-500 font-semibold">{featureCounts.unnecessary} votes</span>
                                </div>
                                <Progress
                                    value={(featureCounts.unnecessary / featureCounts.total) * 100}
                                    className="h-3 bg-white/10"
                                    indicatorClassName="bg-rose-500"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}


            {/* EMOTIONAL SENTIMENT - Only show if we have data */}
            {emotionBreakdown && (
                <Card className="glass border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                            <Heart className="h-4 w-4 text-rose-400" />
                            Emotional Sentiment Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Sentiment Distribution */}
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <h4 className="font-medium text-neutral-300 mb-3 text-sm">Sentiment Distribution</h4>
                                <div className="flex items-center justify-center mb-4">
                                    {/* Simple bar representation */}
                                    <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden flex">
                                        <div
                                            className="h-full bg-emerald-500"
                                            style={{ width: `${emotionBreakdown.positive}%` }}
                                        />
                                        <div
                                            className="h-full bg-neutral-400"
                                            style={{ width: `${emotionBreakdown.neutral}%` }}
                                        />
                                        <div
                                            className="h-full bg-rose-500"
                                            style={{ width: `${emotionBreakdown.negative}%` }}
                                        />
                                    </div>
                                </div>
                                {/* Legend */}
                                <div className="flex justify-between text-xs text-neutral-400">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span>Positive: {emotionBreakdown.positive}%</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-neutral-400"></div>
                                        <span>Neutral: {emotionBreakdown.neutral}%</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                        <span>Negative: {emotionBreakdown.negative}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dominant Emotions */}
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <h4 className="font-medium text-neutral-300 mb-3 text-sm">Dominant Emotions</h4>
                                <div className="space-y-2">
                                    {emotionBreakdown.dominant.map((item, i) => {
                                        const Icon = item.emotion.toLowerCase().includes('hope') || item.emotion.toLowerCase().includes('excit')
                                            ? Smile
                                            : item.emotion.toLowerCase().includes('skeptic') || item.emotion.toLowerCase().includes('concern')
                                                ? Frown
                                                : Meh;

                                        return (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4 text-neutral-400" />
                                                    <span className="text-sm text-neutral-300">{item.emotion}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-white">{item.percentage}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* KEY QUOTES - Only show if we have data */}
            {metrics.keyQuotes.length > 0 && (
                <Card className="glass border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                            <Zap className="h-4 w-4 text-amber-400" />
                            Key Participant Quotes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {metrics.keyQuotes.slice(0, 3).map((quote, i) => (
                                <div key={i} className="bg-white/5 border-l-2 border-amber-500/50 rounded p-3">
                                    <p className="text-sm text-neutral-300 italic">"{quote}"</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* VALIDATION SUMMARY - Only show if we have score data */}
            {(scores.problemIntensity !== null || scores.conceptAppeal !== null || scores.adoptionLikelihood !== null) && (
                <Card className="glass border-0 bg-emerald-900/10">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-white mb-3">Validation Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {scores.problemIntensity !== null && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                            <div className="text-xs text-neutral-400 font-medium">Problem Validation</div>
                                            <div className="text-sm font-bold text-white mt-1">
                                                {scores.problemIntensity >= 8 ? '✓ Strong' : scores.problemIntensity >= 6 ? '⚠ Moderate' : '✗ Weak'}
                                            </div>
                                            <div className="text-xs text-neutral-500 mt-0.5">
                                                {scores.problemIntensity >= 8 ? 'Problem is real' : 'Needs validation'}
                                            </div>
                                        </div>
                                    )}
                                    {scores.conceptAppeal !== null && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                            <div className="text-xs text-neutral-400 font-medium">Solution Fit</div>
                                            <div className="text-sm font-bold text-white mt-1">
                                                {scores.conceptAppeal >= 7.5 ? '✓ High' : scores.conceptAppeal >= 6 ? '⚠ Good' : '✗ Low'}
                                            </div>
                                            <div className="text-xs text-neutral-500 mt-0.5">
                                                {scores.conceptAppeal >= 7.5 ? 'Resonates well' : 'Consider pivoting'}
                                            </div>
                                        </div>
                                    )}
                                    {scores.adoptionLikelihood !== null && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                            <div className="text-xs text-neutral-400 font-medium">Market Readiness</div>
                                            <div className="text-sm font-bold text-white mt-1">
                                                {scores.adoptionLikelihood >= 7 ? '✓ Ready' : scores.adoptionLikelihood >= 5 ? '⚠ Cautious' : '✗ Not Ready'}
                                            </div>
                                            <div className="text-xs text-neutral-500 mt-0.5">
                                                {topBarriers.length > 0 ? `Address: ${topBarriers[0].barrier}` : 'Address barriers'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Show message if no data collected yet */}
            {!hasAnyData && !isRunning && (
                <Card className="glass border-0">
                    <CardContent className="py-8 text-center">
                        <p className="text-neutral-500 text-sm">No validation data collected yet.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
