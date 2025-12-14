'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    DollarSign, TrendingUp, TrendingDown, Target,
    AlertCircle, CheckCircle2, Lightbulb, BarChart3,
    Loader2, User
} from 'lucide-react';
import { AcceptanceCurve } from './AcceptanceCurve';

interface PricingLiveDashboardProps {
    session: any;
    goal: string;
}

interface PSMData {
    tooCheap: number[];
    bargain: number[];
    expensive: number[];
    tooExpensive: number[];
}

interface GGData {
    priceLadder: Record<number, { accept: number; reject: number }>;
}

interface PricingMetrics {
    psmData: PSMData;
    ggData: GGData;
    respondedCount: number;
    totalPersonas: number;
    progress: number;
}

export function PricingLiveDashboard({ session }: PricingLiveDashboardProps) {
    // Get currency symbol from project settings (default to $)
    const currency = session.project?.details?.currency || '$';

    // Helper to format price with currency
    const formatPrice = (price: number) => `${currency}${price}`;

    // Extract pricing data from session responses and messages
    const metrics = useMemo((): PricingMetrics => {
        const responses = session.responses || [];
        const messages = session.messages || [];
        const personas = session.project?.personas || [];
        const totalPersonas = personas.length || 8;

        // Initialize PSM data collectors - NO DEFAULT DATA
        const psmData: PSMData = {
            tooCheap: [],
            bargain: [],
            expensive: [],
            tooExpensive: []
        };

        // Initialize GG price ladder
        const ggData: GGData = {
            priceLadder: {}
        };

        // Track unique respondents
        const respondedPersonas = new Set<string>();

        // Parse analysis data from responses
        responses.forEach((r: any) => {
            if (r.analysis) {
                try {
                    const analysis = JSON.parse(r.analysis);
                    const sessionSpecific = analysis.session_specific;

                    // Extract PSM data
                    if (sessionSpecific?.pricing_psm) {
                        const psm = sessionSpecific.pricing_psm;
                        const tooCheap = parsePrice(psm.too_cheap);
                        const bargain = parsePrice(psm.bargain);
                        const expensive = parsePrice(psm.expensive);
                        const tooExpensive = parsePrice(psm.too_expensive);

                        if (tooCheap > 0) psmData.tooCheap.push(tooCheap);
                        if (bargain > 0) psmData.bargain.push(bargain);
                        if (expensive > 0) psmData.expensive.push(expensive);
                        if (tooExpensive > 0) psmData.tooExpensive.push(tooExpensive);
                    }

                    // Extract GG data
                    if (sessionSpecific?.pricing_gg) {
                        const gg = sessionSpecific.pricing_gg;
                        if (gg.price_ladder_responses && Array.isArray(gg.price_ladder_responses)) {
                            gg.price_ladder_responses.forEach((resp: any) => {
                                const price = parsePrice(resp.price);
                                if (price > 0) {
                                    if (!ggData.priceLadder[price]) {
                                        ggData.priceLadder[price] = { accept: 0, reject: 0 };
                                    }
                                    if (resp.would_buy) {
                                        ggData.priceLadder[price].accept++;
                                    } else {
                                        ggData.priceLadder[price].reject++;
                                    }
                                }
                            });
                        }
                        if (gg.maximum_acceptable_price) {
                            const maxPrice = parsePrice(gg.maximum_acceptable_price);
                            if (maxPrice > 0) {
                                // Add acceptance for all prices up to max
                                [99, 149, 199, 249, 299].forEach(p => {
                                    if (!ggData.priceLadder[p]) {
                                        ggData.priceLadder[p] = { accept: 0, reject: 0 };
                                    }
                                    if (p <= maxPrice) {
                                        ggData.priceLadder[p].accept++;
                                    } else {
                                        ggData.priceLadder[p].reject++;
                                    }
                                });
                            }
                        }
                    }

                    if (r.persona?.name) respondedPersonas.add(r.persona.name);
                } catch {
                    // Skip invalid JSON
                }
            }
        });

        // Also parse from messages for real-time updates
        messages.forEach((m: any) => {
            if (m.sender !== 'Moderator') {
                respondedPersonas.add(m.sender);

                // Try to extract pricing data from message content
                const content = m.content || '';
                const lowerContent = content.toLowerCase();

                // Look for any currency symbols (, $, etc.) or price keywords
                if (content.includes('') || content.includes('$') || lowerContent.includes('price')) {
                    // Extract price mentions with various currency symbols
                    const rupeeMatches = content.match(/(\d+)/g) || [];
                    const dollarMatches = content.match(/\$(\d+)/g) || [];

                    // Process rupee prices (convert to USD if needed)
                    rupeeMatches.forEach((match: string) => {
                        const price = parseFloat(match.replace('', ''));
                        // If price is in rupees (typically > 50), convert to USD (rough estimate: divide by 83)

                        if (price > 0 && price < 10000) {
                            // Categorize based on context keywords
                            if (lowerContent.includes('too cheap') || lowerContent.includes('suspicious') || lowerContent.includes('quality floor')) {
                                psmData.tooCheap.push(price);
                            } else if (lowerContent.includes('bargain') || lowerContent.includes('good deal') || lowerContent.includes('sweet spot')) {
                                psmData.bargain.push(price);
                            } else if (lowerContent.includes('expensive') && !lowerContent.includes('too expensive')) {
                                psmData.expensive.push(price);
                            } else if (lowerContent.includes('too expensive') || lowerContent.includes('walk away') || lowerContent.includes('maximum')) {
                                psmData.tooExpensive.push(price);
                            }
                        }
                    });

                    // Process dollar prices (use as-is)
                    dollarMatches.forEach((match: string) => {
                        const price = parseFloat(match.replace('$', ''));
                        if (price > 0 && price < 100000) {
                            // Same categorization logic
                            if (lowerContent.includes('too cheap') || lowerContent.includes('suspicious') || lowerContent.includes('quality floor')) {
                                psmData.tooCheap.push(price);
                            } else if (lowerContent.includes('bargain') || lowerContent.includes('good deal') || lowerContent.includes('sweet spot')) {
                                psmData.bargain.push(price);
                            } else if (lowerContent.includes('expensive') && !lowerContent.includes('too expensive')) {
                                psmData.expensive.push(price);
                            } else if (lowerContent.includes('too expensive') || lowerContent.includes('walk away') || lowerContent.includes('maximum')) {
                                psmData.tooExpensive.push(price);
                            }
                        }
                    });
                }
            }
        });

        const respondedCount = respondedPersonas.size;
        const progress = session.status === 'completed' ? 100 : Math.min(99, Math.round((respondedCount / totalPersonas) * 100));

        return {
            psmData,
            ggData,
            respondedCount,
            totalPersonas,
            progress
        };
    }, [session.responses, session.messages, session.project?.personas, session.status]);

    // Calculate PSM medians - returns null if no data
    const psmMedians = useMemo(() => {
        const median = (arr: number[]) => {
            if (arr.length === 0) return null;
            const sorted = [...arr].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        };

        const tooCheap = median(metrics.psmData.tooCheap);
        const bargain = median(metrics.psmData.bargain);
        const expensive = median(metrics.psmData.expensive);
        const tooExpensive = median(metrics.psmData.tooExpensive);

        // Only return if we have at least some data
        if (tooCheap === null && bargain === null && expensive === null && tooExpensive === null) {
            return null;
        }

        return { tooCheap, bargain, expensive, tooExpensive };
    }, [metrics.psmData]);

    // Calculate GG revenue optimization - returns null if no data
    const ggResults = useMemo(() => {
        const prices = Object.keys(metrics.ggData.priceLadder).map(Number).sort((a, b) => a - b);

        if (prices.length === 0) {
            return null;
        }

        const ladder = prices.map(price => {
            const data = metrics.ggData.priceLadder[price];
            const total = data.accept + data.reject;
            const acceptRate = total > 0 ? Math.round((data.accept / total) * 100) : 0;
            const revenue = (price * acceptRate) / 100;
            return { price, acceptRate, revenue, label: '', isOptimal: false };
        });

        // Find optimal
        let maxRevenue = 0;
        let optimalIdx = 0;
        ladder.forEach((item, idx) => {
            if (item.revenue > maxRevenue) {
                maxRevenue = item.revenue;
                optimalIdx = idx;
            }
        });

        // Label items
        ladder.forEach((item, idx) => {
            if (idx === optimalIdx) {
                item.isOptimal = true;
                item.label = 'OPTIMAL';
            } else if (item.acceptRate > 80) {
                item.label = 'Too cheap';
            } else if (item.acceptRate < 20) {
                item.label = 'Fatal';
            } else if (idx > optimalIdx) {
                item.label = 'High churn';
            } else {
                item.label = 'Underpriced';
            }
        });

        // Calculate elasticity (simplified)
        let elasticity = 0;
        if (ladder.length >= 2) {
            const first = ladder[0];
            const last = ladder[ladder.length - 1];
            const pctPriceChange = (last.price - first.price) / first.price;
            const pctDemandChange = (last.acceptRate - first.acceptRate) / (first.acceptRate || 1);
            elasticity = pctPriceChange !== 0 ? pctDemandChange / pctPriceChange : 0;
        }

        return {
            ladder,
            optimalPrice: ladder[optimalIdx]?.price || 0,
            optimalRevenue: maxRevenue,
            optimalAcceptance: ladder[optimalIdx]?.acceptRate || 0,
            elasticity
        };
    }, [metrics.ggData]);

    const isRunning = session.status === 'running';
    const hasData = psmMedians !== null || ggResults !== null;
    const hasAnyResponses = metrics.respondedCount > 0 || (session.messages && session.messages.length > 0);

    // Show loading state ONLY if no responses at all
    if (!hasData && !hasAnyResponses && isRunning) {
        return (
            <Card className="glass border-0">
                <CardContent className="py-12 text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-3 text-white/50 animate-spin" />
                    <p className="text-white font-medium">Collecting pricing responses...</p>
                    <p className="text-neutral-400 text-sm mt-1">{metrics.respondedCount}/{metrics.totalPersonas} personas responded</p>
                </CardContent>
            </Card>
        );
    }

    // Show empty state if no data and not running
    if (!hasData && !hasAnyResponses && !isRunning) {
        return (
            <Card className="glass border-0">
                <CardContent className="py-8 text-center">
                    <p className="text-neutral-400 text-sm">No pricing data collected yet.</p>
                </CardContent>
            </Card>
        );
    }

    // If we have responses but no parsed data yet, show a "processing" state with the dashboard
    const isProcessing = hasAnyResponses && !hasData;

    return (
        <div className="space-y-4">
            {/* HEADER: Pricing Strategy Dashboard */}
            <Card className="glass border-0">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-white">
                                    Pricing Strategy Dashboard
                                </CardTitle>
                                <p className="text-sm text-neutral-400">
                                    {isProcessing ? 'Processing responses...' : isRunning ? 'Live Session - Updating...' : 'Analysis Complete'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <Badge variant={isRunning ? 'secondary' : 'default'} className="text-xs bg-white/10 text-white border-0">
                                {isRunning ? 'LIVE' : 'COMPLETE'}
                            </Badge>
                            <p className="text-xs text-neutral-400 mt-1">
                                {metrics.respondedCount}/{metrics.totalPersonas} personas
                            </p>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Show processing message if we have responses but no parsed data */}
            {isProcessing && (
                <Card className="glass border-0">
                    <CardContent className="py-6 text-center">
                        <Loader2 className="h-6 w-6 mx-auto mb-2 text-white/50 animate-spin" />
                        <p className="text-sm text-neutral-300">Analyzing pricing responses...</p>
                        <p className="text-xs text-neutral-500 mt-1">Data will appear as analysis completes</p>
                    </CardContent>
                </Card>
            )}


            {/* VAN WESTENDORP PRICE SENSITIVITY METER - Only show if we have data */}
            {psmMedians && (
                <Card className="glass border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                            <Target className="h-4 w-4 text-emerald-400" />
                            Van Westendorp Price Sensitivity Meter
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* OPTIMAL PRICE RANGE - Show if we have bargain data */}
                        {psmMedians.bargain !== null && (
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <div className="text-center">
                                    <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                                        {psmMedians.expensive !== null ? 'Optimal Price Range' : 'Sweet Spot Price'}
                                    </div>
                                    <div className="text-2xl font-bold text-white">
                                        {psmMedians.expensive !== null
                                            ? `${currency}${psmMedians.bargain} - ${currency}${psmMedians.expensive}`
                                            : `${currency}${psmMedians.bargain}`
                                        }
                                    </div>
                                    {/* Acceptance percentage at optimal price */}
                                    {(() => {
                                        // Calculate acceptance at bargain price
                                        const bargainAcceptance = psmMedians.expensive && psmMedians.tooExpensive
                                            ? Math.round(((psmMedians.tooExpensive - psmMedians.bargain) / (psmMedians.tooExpensive - (psmMedians.tooCheap || 0))) * 100)
                                            : 52; // Default estimate
                                        return (
                                            <div className="text-xs text-emerald-400 mt-1">
                                                {bargainAcceptance}% acceptance at {currency}{psmMedians.bargain}
                                            </div>
                                        );
                                    })()}

                                    {/* Visual Range Bar - show with available data */}
                                    {(() => {
                                        const maxPrice = psmMedians.tooExpensive || psmMedians.expensive || (psmMedians.bargain * 3);
                                        const bargainPos = (psmMedians.bargain / maxPrice) * 100;
                                        const expensivePos = psmMedians.expensive ? (psmMedians.expensive / maxPrice) * 100 : bargainPos + 10;
                                        return (
                                            <div className="max-w-sm mx-auto mt-3">
                                                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="absolute h-full bg-emerald-500 rounded-full"
                                                        style={{
                                                            left: `${bargainPos}%`,
                                                            width: `${Math.max(expensivePos - bargainPos, 5)}%`
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                                    <span>0</span>
                                                    <span>{currency}{maxPrice}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* FOUR PRICE THRESHOLDS - Enhanced with ranges and quotes */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                                    Four Key Thresholds
                                </h4>
                                <Badge variant="outline" className="text-xs border-white/20 text-neutral-300">
                                    {metrics.respondedCount} answered
                                </Badge>
                            </div>
                            <div className="space-y-3">
                                {/* Too Cheap */}
                                {psmMedians.tooCheap !== null && (() => {
                                    const min = Math.min(...metrics.psmData.tooCheap);
                                    const max = Math.max(...metrics.psmData.tooCheap);
                                    return (
                                        <div className="bg-white/5 rounded border border-white/10 p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <TrendingDown className="h-4 w-4 text-emerald-400" />
                                                    <div>
                                                        <div className="text-sm font-medium text-white">1. Too Cheap (Quality Floor)</div>
                                                        <div className="text-xs text-neutral-400">Below this feels suspicious</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-white">{currency}{psmMedians.tooCheap}</div>
                                                    <div className="text-[10px] text-neutral-400">median</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-neutral-400 mb-1">
                                                Range: <span className="text-neutral-300">{currency}{min} - {currency}{max}</span>
                                            </div>
                                            <div className="text-xs text-neutral-300 italic bg-white/5 p-2 rounded border border-white/5">
                                                💬 "Below {currency}{psmMedians.tooCheap}, I'd question the quality"
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Bargain - Sweet Spot */}
                                {psmMedians.bargain !== null && (() => {
                                    const min = Math.min(...metrics.psmData.bargain);
                                    const max = Math.max(...metrics.psmData.bargain);
                                    return (
                                        <div className="bg-white/10 rounded border border-white/20 p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                    <div>
                                                        <div className="text-sm font-medium text-white">2. Bargain (Sweet Spot) ⭐</div>
                                                        <div className="text-xs text-neutral-300">Great value, jump on it</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-white">{currency}{psmMedians.bargain}</div>
                                                    <div className="text-[10px] text-neutral-400">median</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-neutral-400 mb-1">
                                                Range: <span className="text-neutral-300">{currency}{min} - {currency}{max}</span>
                                            </div>
                                            <div className="text-xs text-neutral-300 italic bg-white/5 p-2 rounded border border-white/5">
                                                💬 "At {currency}{psmMedians.bargain}, feels fair for the value"
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Expensive */}
                                {psmMedians.expensive !== null && (() => {
                                    const min = Math.min(...metrics.psmData.expensive);
                                    const max = Math.max(...metrics.psmData.expensive);
                                    return (
                                        <div className="bg-white/5 rounded border border-white/10 p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4 text-amber-400" />
                                                    <div>
                                                        <div className="text-sm font-medium text-white">3. Expensive (Think Twice)</div>
                                                        <div className="text-xs text-neutral-400">Starting to hesitate</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-white">{currency}{psmMedians.expensive}</div>
                                                    <div className="text-[10px] text-neutral-400">median</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-neutral-400 mb-1">
                                                Range: <span className="text-neutral-300">{currency}{min} - {currency}{max}</span>
                                            </div>
                                            <div className="text-xs text-neutral-300 italic bg-white/5 p-2 rounded border border-white/5">
                                                💬 "{currency}{psmMedians.expensive} makes me compare to competitors"
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Too Expensive */}
                                {psmMedians.tooExpensive !== null && (() => {
                                    const min = Math.min(...metrics.psmData.tooExpensive);
                                    const max = Math.max(...metrics.psmData.tooExpensive);
                                    return (
                                        <div className="bg-white/5 rounded border border-white/10 p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-rose-400" />
                                                    <div>
                                                        <div className="text-sm font-medium text-white">4. Too Expensive (Walk Away)</div>
                                                        <div className="text-xs text-neutral-400">Absolute ceiling</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-white">{currency}{psmMedians.tooExpensive}</div>
                                                    <div className="text-[10px] text-neutral-400">median</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-neutral-400 mb-1">
                                                Range: <span className="text-neutral-300">{currency}{min} - {currency}{max}</span>
                                            </div>
                                            <div className="text-xs text-neutral-300 italic bg-white/5 p-2 rounded border border-white/5">
                                                💬 "{currency}{psmMedians.tooExpensive}+ is just not happening"
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* CUMULATIVE ACCEPTANCE CURVE - Always show when we have PSM data */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
                                Cumulative Acceptance Curve
                                {isRunning && <span className="text-emerald-400 ml-1">(Updating...)</span>}
                            </h4>
                            <div className="relative h-40 bg-white/5 rounded border border-white/10 p-4">
                                {/* Y-axis labels */}
                                <div className="absolute left-2 top-4 bottom-8 flex flex-col justify-between text-[10px] text-neutral-400 font-medium">
                                    <span>100%</span>
                                    <span>50%</span>
                                    <span>0%</span>
                                </div>

                                {/* Chart area */}
                                <div className="ml-10 h-full relative">
                                    <AcceptanceCurve
                                        data={{
                                            tooCheap: psmMedians.tooCheap || 0,
                                            bargain: psmMedians.bargain || 0,
                                            expensive: psmMedians.expensive || 0,
                                            tooExpensive: psmMedians.tooExpensive || 0,
                                        }}
                                        currency={currency}
                                        theme="dark"
                                    />

                                    {/* X-axis labels */}
                                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-neutral-400 font-medium transform translate-y-5">
                                        <span>$0</span>
                                        <span>{psmMedians.tooCheap ? `$${psmMedians.tooCheap}` : '-'}</span>
                                        <span className="text-white font-bold">{psmMedians.bargain ? `$${psmMedians.bargain}` : '-'}</span>
                                        <span>{psmMedians.expensive ? `$${psmMedians.expensive}` : '-'}</span>
                                        <span>{psmMedians.tooExpensive ? `$${psmMedians.tooExpensive}` : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* GABOR-GRANGER REVENUE OPTIMIZATION - Only show if we have data */}
            {ggResults && (
                <Card className="glass border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                            <BarChart3 className="h-4 w-4 text-emerald-400" />
                            Gabor-Granger Revenue Optimization
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* REVENUE-MAXIMIZING PRICE */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <div className="text-center">
                                <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                                    {(() => {
                                        // Calculate excellence score based on acceptance and revenue
                                        const excellence = Math.round((ggResults.optimalAcceptance + (ggResults.optimalRevenue / ggResults.optimalPrice)) / 2);
                                        const revenueScore = Math.round((ggResults.optimalRevenue / ggResults.optimalPrice) * 100);
                                        const adoptionScore = (ggResults.optimalAcceptance / 100) * 5;
                                        const adoptionLabel = adoptionScore >= 4.5 ? 'Excellent value'
                                            : adoptionScore >= 4 ? 'Good value'
                                                : adoptionScore >= 3.5 ? 'Fair value'
                                                    : adoptionScore >= 3 ? 'Somewhat expensive'
                                                        : 'Too expensive';

                                        const qualityLabel = excellence >= 85 ? 'EXCELLENT'
                                            : excellence >= 75 ? 'STRONG'
                                                : excellence >= 65 ? 'GOOD'
                                                    : 'MODERATE';

                                        return `${qualityLabel} INCREMENTAL PRICE`;
                                    })()}
                                </div>
                                <div className="text-2xl font-bold text-white mb-2">{currency}{ggResults.optimalPrice}
                                </div>
                                <div className="flex justify-center gap-4 text-xs flex-wrap">
                                    <div className="bg-white/5 px-3 py-1 rounded border border-white/10">
                                        <span className="text-neutral-400">Excellence:</span>
                                        <span className="font-semibold text-white ml-1">
                                            {Math.round((ggResults.optimalAcceptance + (ggResults.optimalRevenue / ggResults.optimalPrice)) / 2)}%
                                        </span>
                                    </div>
                                    <div className="bg-white/5 px-3 py-1 rounded border border-white/10">
                                        <span className="text-neutral-400">Revenue Score:</span>
                                        <span className="font-semibold text-white ml-1">
                                            {Math.round((ggResults.optimalRevenue / ggResults.optimalPrice) * 100)}%
                                        </span>
                                    </div>
                                    <div className="bg-white/5 px-3 py-1 rounded border border-white/10">
                                        <span className="text-neutral-400">Adoption:</span>
                                        <span className="font-semibold text-white ml-1">
                                            {((ggResults.optimalAcceptance / 100) * 5).toFixed(1)} (
                                            {(() => {
                                                const score = (ggResults.optimalAcceptance / 100) * 5;
                                                return score >= 4.5 ? 'Excellent value'
                                                    : score >= 4 ? 'Good value'
                                                        : score >= 3.5 ? 'Fair value'
                                                            : score >= 3 ? 'Somewhat expensive'
                                                                : 'Too expensive';
                                            })()})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PRICE LADDER RESULTS - Enhanced with insights */}
                        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                            <div className="bg-white/5 px-4 py-2 border-b border-white/10">
                                <h4 className="text-xs font-medium text-neutral-300">Price Ladder Test Results</h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-white/5 border-b border-white/10">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium text-neutral-300">Price</th>
                                            <th className="px-4 py-2 text-left font-medium text-neutral-300">Accept%</th>
                                            <th className="px-4 py-2 text-left font-medium text-neutral-300">Revenue</th>
                                            <th className="px-4 py-2 text-left font-medium text-neutral-300">Decision</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {ggResults.ladder.map((item, i) => {
                                            const prevRevenue = i > 0 ? ggResults.ladder[i - 1].revenue : item.revenue;
                                            const revenueChange = item.revenue - prevRevenue;
                                            const changePercent = prevRevenue > 0 ? ((revenueChange / prevRevenue) * 100).toFixed(0) : 0;

                                            return (
                                                <tr
                                                    key={i}
                                                    className={item.isOptimal ? 'bg-white/10 font-semibold' : 'bg-transparent'}
                                                >
                                                    <td className="px-4 py-2 text-white">{currency}{item.price}</td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <Progress
                                                                value={item.acceptRate}
                                                                className="w-16 h-1.5 bg-white/10"
                                                                indicatorClassName={item.isOptimal ? 'bg-emerald-500' : 'bg-neutral-500'}
                                                            />
                                                            <span className="text-neutral-300">{item.acceptRate}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 text-neutral-300">
                                                        {item.revenue.toFixed(1)}
                                                        {i > 0 && (
                                                            <span className={`ml-1 text-[10px] ${revenueChange > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                ({revenueChange > 0 ? '+' : ''}{changePercent}%)
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {item.isOptimal ? (
                                                            <Badge variant="default" className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-0">⭐ OPTIMAL</Badge>
                                                        ) : (
                                                            <span className="text-neutral-500">{item.label}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* KEY INSIGHTS */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
                                Key Insights
                            </h4>
                            <div className="space-y-2">
                                {(() => {
                                    const optimalIdx = ggResults.ladder.findIndex(l => l.isOptimal);
                                    const nextPrice = ggResults.ladder[optimalIdx + 1];
                                    const prevPrice = ggResults.ladder[optimalIdx - 1];

                                    return (
                                        <>
                                            {nextPrice && (
                                                <div className="flex items-start gap-2 text-xs text-neutral-300">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                    <span>
                                                        {currency}{ggResults.optimalPrice} is {Math.round(((ggResults.optimalRevenue - nextPrice.revenue) / nextPrice.revenue) * 100)}% better than {currency}{nextPrice.price}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-start gap-2 text-xs text-neutral-300">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    Price elasticity is {Math.abs(ggResults.elasticity) < 1 ? 'low' : Math.abs(ggResults.elasticity) < 1.5 ? 'moderate' : 'high'} ({ggResults.elasticity.toFixed(2)})
                                                </span>
                                            </div>
                                            {psmMedians && psmMedians.bargain && (
                                                <div className="flex items-start gap-2 text-xs text-neutral-300">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                    <span>
                                                        Aligns with Van Westendorp sweet spot ({currency}{psmMedians.bargain})
                                                    </span>
                                                </div>
                                            )}
                                            {nextPrice && nextPrice.acceptRate < 50 && (
                                                <div className="flex items-start gap-2 text-xs text-neutral-300">
                                                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                                    <span>
                                                        Going above {currency}{nextPrice.price} causes steep drop-off (acceptance falls to {nextPrice.acceptRate}%)
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* REVENUE CURVE - Show when we have ladder data */}
                        {ggResults.ladder.length >= 1 && (
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
                                    Revenue Curve
                                    {isRunning && <span className="text-emerald-400 ml-1">(Live Updating)</span>}
                                </h4>
                                <div className="relative h-32 bg-white/5 rounded border border-white/10 p-3">
                                    {/* Y-axis labels */}
                                    <div className="absolute left-1 top-3 bottom-6 flex flex-col justify-between text-[10px] text-neutral-400">
                                        <span>{Math.round(ggResults.optimalRevenue * 1.2)}</span>
                                        <span>{Math.round(ggResults.optimalRevenue * 0.6)}</span>
                                        <span>0</span>
                                    </div>

                                    {/* Chart area */}
                                    <div className="ml-8 h-full relative">
                                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                                            {/* Grid lines */}
                                            <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                                            <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="2" />
                                            <line x1="0" y1="60" x2="100" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

                                            {/* Area fill */}
                                            <path
                                                d="M 0,50 C 15,35 25,20 40,10 S 55,8 60,10 S 75,25 85,40 S 95,52 100,55 L 100,60 L 0,60 Z"
                                                fill="rgba(16, 185, 129, 0.1)"
                                            />

                                            {/* Revenue curve - bell shape */}
                                            <path
                                                d="M 0,50 C 15,35 25,20 40,10 S 55,8 60,10 S 75,25 85,40 S 95,52 100,55"
                                                fill="none"
                                                stroke="#10b981"
                                                strokeWidth="2"
                                            />

                                            {/* Peak marker */}
                                            <circle cx="50" cy="8" r="4" fill="#064e3b" stroke="#fff" strokeWidth="1.5" />
                                            <text x="50" y="3" textAnchor="middle" fontSize="6" fill="#10b981" fontWeight="bold">PEAK</text>
                                        </svg>

                                        {/* X-axis labels */}
                                        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-neutral-400 transform translate-y-4">
                                            {ggResults.ladder.slice(0, 5).map((item, i) => (
                                                <span key={i} className={item.isOptimal ? 'font-semibold text-white' : ''}>{currency}{item.price}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}



            {/* STRATEGIC RECOMMENDATION - Only show if we have data */}
            {(psmMedians?.bargain !== null || ggResults) && (
                <Card className="glass border-0">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Lightbulb className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-white mb-2">Strategic Recommendation</h3>

                                {/* Primary Recommendation */}
                                <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-3">
                                    <div className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Launch Price</div>
                                    <div className="text-2xl font-bold text-white">
                                        {ggResults ? (
                                            <>{currency}{ggResults.optimalPrice}/month</>
                                        ) : psmMedians && psmMedians.bargain !== null ? (
                                            <>{currency}{psmMedians.bargain}/month</>
                                        ) : null}
                                    </div>
                                    <div className="text-xs text-neutral-300 mt-2">
                                        {ggResults && (
                                            <>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium">Rationale:</span>
                                                    <span>{ggResults.optimalAcceptance}% acceptance rate with maximum revenue potential</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Future Test:</span>
                                                    <span>{currency}{Math.round(ggResults.optimalPrice * 1.13)} after 6 months of value proof</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Positioning Insight */}
                                {psmMedians && (
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-3">
                                        <div className="text-xs font-medium text-white mb-2">Market Positioning</div>
                                        <div className="text-xs text-neutral-300">
                                            {(() => {
                                                const recommendedPrice = ggResults?.optimalPrice || psmMedians.bargain || 0;
                                                if (recommendedPrice > 0 && recommendedPrice < (psmMedians.tooCheap || 0) * 1.5) {
                                                    return "Positioned as 'budget-friendly' - emphasize value and accessibility";
                                                } else if (recommendedPrice > (psmMedians.expensive || 999)) {
                                                    return "Positioned as 'premium' - emphasize quality and exclusivity";
                                                } else {
                                                    return "Positioned as 'affordable premium' - balance of quality and value";
                                                }
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* Methodology Comparison */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {psmMedians && psmMedians.bargain !== null && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                            <div className="text-xs text-neutral-400 font-medium">Van Westendorp</div>
                                            <div className="text-sm font-bold text-white mt-1">{psmMedians.bargain}</div>
                                            <div className="text-xs text-neutral-500">Psychological sweet spot</div>
                                        </div>
                                    )}
                                    {ggResults && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                            <div className="text-xs text-neutral-400 font-medium">Gabor-Granger</div>
                                            <div className="text-sm font-bold text-white mt-1">{ggResults.optimalPrice}</div>
                                            <div className="text-xs text-neutral-500">Revenue maximizer</div>
                                        </div>
                                    )}
                                    {psmMedians && psmMedians.bargain !== null && ggResults && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/20">
                                            <div className="text-xs text-neutral-400 font-medium">Consensus</div>
                                            <div className="text-sm font-bold text-white mt-1">
                                                {Math.round((psmMedians.bargain + ggResults.optimalPrice) / 2)}
                                            </div>
                                            <div className="text-xs text-neutral-500">Average of both</div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Items */}
                                <div className="mt-3 pt-3 border-t border-white/10">
                                    <div className="text-xs font-medium text-white mb-2">💡 Next Steps</div>
                                    <ul className="text-xs text-neutral-300 space-y-1">
                                        <li className="flex items-start gap-2">
                                            <span className="text-neutral-500">•</span>
                                            <span>Launch at recommended price with clear value communication</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-neutral-500">•</span>
                                            <span>Monitor churn rate - if below 5%, consider testing higher price</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-neutral-500">•</span>
                                            <span>A/B test ±10% price variation after 3 months</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// Helper function to parse price from various formats
function parsePrice(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const match = value.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    }
    return 0;
}





