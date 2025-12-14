'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Progress } from '@/components/ui/progress';
import { Loader2, Users, BarChart3, CheckCircle2 } from 'lucide-react';
import { deduplicateFeatures, normalizeFeature } from '@/lib/utils/featureDeduplication';

interface LiveOverviewDashboardProps {
    session: any;
    goal: string;
}


export function LiveOverviewDashboard({ session, goal }: LiveOverviewDashboardProps) {
    const [animatedProgress, setAnimatedProgress] = useState(0);

    // Calculate metrics from responses AND messages
    const metrics = useMemo(() => {
        const responses = session.responses || [];
        const messages = session.messages || [];
        const personas = session.project?.personas || [];
        const totalPersonas = personas.length || 8;

        // Calculate ACCURATE progress based on actual questions asked
        const moderatorQuestions = messages.filter((m: any) => m.sender === 'Moderator').length;
        const personaResponses = messages.filter((m: any) => m.sender !== 'Moderator').length;

        // Expected responses = personas × questions asked so far
        const expectedResponses = totalPersonas * moderatorQuestions;

        // Calculate progress
        let progress = 0;
        if (expectedResponses > 0) {
            progress = Math.round((personaResponses / expectedResponses) * 100);
        } else if (personaResponses > 0) {
            // If we have responses but no moderator questions counted, estimate
            progress = Math.min(95, Math.round((personaResponses / totalPersonas) * 20));
        }

        // Cap at 99% while running, only show 100% when completed
        const finalProgress = session.status === 'completed' ? 100 : Math.min(99, progress);
        const confidence = finalProgress < 30 ? 'LOW' : finalProgress < 70 ? 'MEDIUM' : 'HIGH';

        // Parse analysis data from responses
        const analysisData = responses
            .filter((r: any) => r.analysis)
            .map((r: any) => {
                try {
                    return { ...JSON.parse(r.analysis), personaName: r.persona?.name };
                } catch {
                    return null;
                }
            })
            .filter((a: any) => a !== null);

        // Count unique personas
        const respondedPersonas = new Set<string>();
        messages.forEach((m: any) => {
            if (m.sender !== 'Moderator') {
                respondedPersonas.add(m.sender);
            }
        });

        return {
            responseCount: respondedPersonas.size,
            totalPersonas,
            progress: finalProgress,
            confidence,
            analysisData,
            totalResponses: responses.length,
            totalMessages: messages.length
        };
    }, [session.responses, session.messages, session.project?.personas, session.status]);


    // Animate progress bar
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedProgress(metrics.progress);
        }, 100);
        return () => clearTimeout(timer);
    }, [metrics.progress]);

    const isRunning = session.status === 'running';
    const isCompleted = session.status === 'completed';
    const goalLower = goal.toLowerCase();

    // Determine goal type
    const isAll = goalLower === 'all' || goalLower.includes('all');
    const isFeatures = isAll || goalLower.includes('feature') || goalLower.includes('priorit') || goalLower === 'features';

    const getGoalLabel = () => {
        if (isAll) return 'Complete Analysis';
        if (goalLower.includes('pricing') || goalLower.includes('price')) return 'Pricing Analysis';
        if (goalLower.includes('validat') || goalLower.includes('idea')) return 'Idea Validation';
        if (isFeatures) return 'Feature Prioritization';
        if (goalLower.includes('market') || goalLower.includes('position') || goalLower.includes('brand')) return 'Market Positioning';
        return 'Live Analysis';
    };

    return (
        <div className="space-y-6">
            {/* Main Progress Card - Glass theme */}
            <Card className={`glass border-0`}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${isCompleted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white'}`}>
                                {isCompleted ? (
                                    <CheckCircle2 className="h-7 w-7" />
                                ) : isRunning ? (
                                    <Loader2 className="h-7 w-7 animate-spin" />
                                ) : (
                                    <Users className="h-7 w-7" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{getGoalLabel()}</h3>
                                <p className="text-sm text-neutral-400">
                                    {isCompleted
                                        ? `${metrics.responseCount} participants completed`
                                        : isRunning
                                            ? `${metrics.responseCount} of ${metrics.totalPersonas} participants active`
                                            : 'Waiting to start...'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-white">{animatedProgress}%</div>
                            <Badge variant="outline" className="mt-1 border-white/20 text-neutral-300">
                                {metrics.confidence} Confidence
                            </Badge>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <Progress
                        value={animatedProgress}
                        className="h-3 bg-white/10"
                        indicatorClassName="bg-white/90 transition-all duration-1000 ease-out"
                    />

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4 mt-6">
                        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="text-2xl font-bold text-white">{metrics.responseCount}</div>
                            <div className="text-xs text-neutral-400">Responded</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="text-2xl font-bold text-white">{metrics.totalPersonas}</div>
                            <div className="text-xs text-neutral-400">Total Personas</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="text-2xl font-bold text-white">{metrics.totalResponses}</div>
                            <div className="text-xs text-neutral-400">Responses</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="text-2xl font-bold text-white">{metrics.totalMessages}</div>
                            <div className="text-xs text-neutral-400">Messages</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Goal-Specific Metrics - Only show Feature metrics for now */}
            {isFeatures && <FeatureQuickMetrics data={metrics.analysisData} totalPersonas={metrics.totalPersonas} messages={session.messages || []} />}
        </div>
    );
}


function FeatureQuickMetrics({ data, totalPersonas, messages }: { data: any[], totalPersonas: number, messages: any[] }) {
    // Extract features ONLY from JSON responses (structured data)
    const extractFeaturesFromMessages = () => {
        const featureVotes: Record<string, number> = {};
        const personaMessages = messages.filter((m: any) => m.sender !== 'Moderator');

        personaMessages.forEach((m: any) => {
            const content = m.content || '';

            // ONLY parse JSON responses - ignore conversational text
            if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
                try {
                    const parsed = JSON.parse(content);

                    // Handle ranking arrays
                    if (parsed.ranking && Array.isArray(parsed.ranking)) {
                        parsed.ranking.forEach((f: string, idx: number) => {
                            if (f && typeof f === 'string' && f.length > 2 && f.length < 100) {
                                const weight = parsed.ranking.length - idx;
                                featureVotes[f] = (featureVotes[f] || 0) + weight;
                            }
                        });
                    }

                    // Handle saved/lifeboat arrays
                    if (parsed.saved && Array.isArray(parsed.saved)) {
                        parsed.saved.forEach((f: string) => {
                            if (f && typeof f === 'string' && f.length > 2 && f.length < 100) {
                                featureVotes[f] = (featureVotes[f] || 0) + 3;
                            }
                        });
                    }
                } catch {
                    // Not valid JSON, skip
                }
            }
        });

        return featureVotes;
    };

    // Get features from analysis data with deduplication
    const lifeboatVotes: Record<string, number> = {};
    const dealBreakers: Record<string, { cancelCount: number, totalAsked: number }> = {};
    const kanoBasic: Record<string, number> = {};
    const kanoPerformance: Record<string, number> = {};
    const kanoDelighters: Record<string, number> = {};
    const bundleVotes: Record<string, number> = {};

    data.forEach(d => {
        const fp = d.session_specific?.feature_priority;
        if (!fp) return;

        if (fp.lifeboat_saves && Array.isArray(fp.lifeboat_saves)) {
            fp.lifeboat_saves.forEach((f: string) => {
                lifeboatVotes[f] = (lifeboatVotes[f] || 0) + 1;
            });
        }

        if (fp.deal_breakers_if_removed && Array.isArray(fp.deal_breakers_if_removed)) {
            fp.deal_breakers_if_removed.forEach((db: any) => {
                if (db.feature) {
                    if (!dealBreakers[db.feature]) {
                        dealBreakers[db.feature] = { cancelCount: 0, totalAsked: 0 };
                    }
                    dealBreakers[db.feature].totalAsked++;
                    if (db.would_cancel) dealBreakers[db.feature].cancelCount++;
                }
            });
        }

        if (fp.feature_classifications) {
            const fc = fp.feature_classifications;
            if (fc.basic_expectations) fc.basic_expectations.forEach((f: string) => { kanoBasic[f] = (kanoBasic[f] || 0) + 1; });
            if (fc.performance_drivers) fc.performance_drivers.forEach((f: string) => { kanoPerformance[f] = (kanoPerformance[f] || 0) + 1; });
            if (fc.delighters) fc.delighters.forEach((f: string) => { kanoDelighters[f] = (kanoDelighters[f] || 0) + 1; });
        }

        if (fp.bundle_choice) {
            bundleVotes[fp.bundle_choice] = (bundleVotes[fp.bundle_choice] || 0) + 1;
        }
    });

    // Deduplicate all feature lists
    const deduplicatedLifeboat = deduplicateFeatures(lifeboatVotes);
    const deduplicatedKanoBasic = deduplicateFeatures(kanoBasic);
    const deduplicatedKanoPerformance = deduplicateFeatures(kanoPerformance);
    const deduplicatedKanoDelighters = deduplicateFeatures(kanoDelighters);
    const deduplicatedBundles = deduplicateFeatures(bundleVotes);

    // Deduplicate deal breakers and recalculate cancel rates
    const dealBreakerFeatureMap = new Map<string, { cancelCount: number, totalAsked: number }>();
    Object.entries(dealBreakers).forEach(([feature, stats]) => {
        const normalized = normalizeFeature(feature);
        const existing = dealBreakerFeatureMap.get(normalized);
        if (existing) {
            existing.cancelCount += stats.cancelCount;
            existing.totalAsked += stats.totalAsked;
        } else {
            dealBreakerFeatureMap.set(normalized, { ...stats });
        }
    });

    const deduplicatedDealBreakers = Array.from(dealBreakerFeatureMap.entries())
        .map(([feature, stats]) => ({
            feature,
            cancelRate: stats.totalAsked > 0 ? Math.round((stats.cancelCount / stats.totalAsked) * 100) : 0,
            cancelCount: stats.cancelCount,
            totalAsked: stats.totalAsked
        }))
        .sort((a, b) => b.cancelRate - a.cancelRate);

    // Use deduplicated lifeboat for main display, fall back to messages if empty
    const messageFeatures = extractFeaturesFromMessages();
    const topFeatures = deduplicatedLifeboat.length > 0
        ? deduplicatedLifeboat.slice(0, 10)
        : deduplicateFeatures(messageFeatures).slice(0, 10);

    // Count unique personas
    const uniqueVoters = new Set<string>();
    data.forEach(d => {
        if (d.personaName) uniqueVoters.add(d.personaName);
    });

    if (uniqueVoters.size === 0) {
        const personaMessages = messages.filter((m: any) => m.sender !== 'Moderator');
        personaMessages.forEach((m: any) => {
            if (m.sender) uniqueVoters.add(m.sender);
        });
    }

    const totalResponses = Math.max(uniqueVoters.size, 1);

    // If no data at all, show simple loading
    if (topFeatures.length === 0) {
        return (
            <Card className="glass border-0">
                <CardContent className="py-8 text-center">
                    <Loader2 className="h-6 w-6 mx-auto mb-2 text-white/50 animate-spin" />
                    <p className="text-neutral-400 text-sm">Collecting feature preferences...</p>
                </CardContent>
            </Card>
        );
    }

    const maxVotes = topFeatures[0]?.count || 1;

    return (
        <div className="space-y-4">
            {/* MVP Must-Haves */}
            <Card className="glass border-0">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-white">
                        <BarChart3 className="h-4 w-4 text-emerald-400" />
                        MVP Must-Haves (Feature Votes)
                        <Badge variant="outline" className="ml-auto text-xs border-white/20 text-neutral-300">
                            {topFeatures.length} features
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {topFeatures.map((item, i) => {
                            const percentage = Math.round((item.count / maxVotes) * 100);
                            const isMustHave = percentage >= 60;
                            return (
                                <div key={i} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className={`font-medium ${isMustHave ? 'text-white' : 'text-neutral-400'}`}>
                                            {item.name}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span className="text-neutral-500">{item.count} votes</span>
                                            {isMustHave && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                                        </span>
                                    </div>
                                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${isMustHave ? 'bg-emerald-500' : 'bg-neutral-600'}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Deal-Breaker + Kano in grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Deal-Breaker Analysis */}
                {deduplicatedDealBreakers.length > 0 && (
                    <Card className="glass border-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-white">Deal-Breaker Analysis</CardTitle>
                            <p className="text-xs text-neutral-400">"If removed, would you cancel?"</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {deduplicatedDealBreakers.slice(0, 5).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded -mx-2">
                                        <span className="text-sm text-neutral-300 truncate max-w-[150px]">{item.feature}</span>
                                        <span className={`text-sm font-medium ${item.cancelRate >= 60 ? 'text-rose-400' : 'text-neutral-500'}`}>
                                            {item.cancelRate}% cancel
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Kano Model */}
                {(deduplicatedKanoBasic.length > 0 || deduplicatedKanoPerformance.length > 0) && (
                    <Card className="glass border-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-white">Kano Model</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {deduplicatedKanoBasic.length > 0 && (
                                <div>
                                    <div className="text-xs font-semibold text-neutral-400 mb-1">Basic (Must Have)</div>
                                    {deduplicatedKanoBasic.slice(0, 3).map((item, i) => (
                                        <div key={i} className="text-sm text-neutral-300">• {item.name}</div>
                                    ))}
                                </div>
                            )}
                            {deduplicatedKanoPerformance.length > 0 && (
                                <div>
                                    <div className="text-xs font-semibold text-neutral-400 mb-1">Performance</div>
                                    {deduplicatedKanoPerformance.slice(0, 3).map((item, i) => (
                                        <div key={i} className="text-sm text-neutral-300">• {item.name}</div>
                                    ))}
                                </div>
                            )}
                            {deduplicatedKanoDelighters.length > 0 && (
                                <div>
                                    <div className="text-xs font-semibold text-neutral-400 mb-1">Delighters</div>
                                    {deduplicatedKanoDelighters.slice(0, 3).map((item, i) => (
                                        <div key={i} className="text-sm text-neutral-300">• {item.name}</div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* MVP Recommendation + Bundle Winner in grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MVP Recommendation - Auto-generated (Left side - narrower) */}
                {topFeatures.length >= 3 && (
                    <Card className="glass border-0">
                        <CardHeader className="pb-3 bg-white/5 border-b border-white/10">
                            <CardTitle className="text-base font-bold text-white">Recommended MVP</CardTitle>
                            <p className="text-xs text-neutral-400 mt-1">Based on {totalResponses} participant votes</p>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                {/* V1.0 - Launch */}
                                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-5 w-5 bg-emerald-500/20 text-emerald-300 rounded flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                                            V1
                                        </div>
                                        <span className="font-semibold text-sm text-white">Launch</span>
                                    </div>
                                    <div className="space-y-1">
                                        {topFeatures.slice(0, 3).map((item, i) => (
                                            <div key={i} className="flex items-start gap-1.5 text-xs">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                                                <span className="text-neutral-300">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* V1.5 - Next Phase */}
                                {topFeatures.length > 3 && (
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-5 w-5 bg-white/10 text-neutral-400 rounded flex items-center justify-center text-xs font-bold border border-white/10">
                                                V2
                                            </div>
                                            <span className="font-semibold text-sm text-neutral-300">Next Phase</span>
                                        </div>
                                        <div className="space-y-1">
                                            {topFeatures.slice(3, 6).map((item, i) => (
                                                <div key={i} className="flex items-start gap-1.5 text-xs">
                                                    <span className="text-neutral-500 mt-0.5">•</span>
                                                    <span className="text-neutral-400">{item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Bundle Winner (Right side) */}
                {deduplicatedBundles.length > 0 && (
                    <Card className="glass border-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-white">Bundle Winner</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {deduplicatedBundles.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-1">
                                    <span className={`text-sm ${i === 0 ? 'font-semibold text-white' : 'text-neutral-400'}`}>
                                        {i === 0 && '⭐ '}{item.name}
                                    </span>
                                    <span className="text-sm text-neutral-500">{item.count} votes</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}



