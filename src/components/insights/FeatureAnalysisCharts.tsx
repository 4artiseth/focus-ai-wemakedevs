import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Star, TrendingUp, CircleDot } from 'lucide-react';

interface FeatureAnalysisChartsProps {
    messages: any[];
}

export function FeatureAnalysisCharts({ messages }: FeatureAnalysisChartsProps) {
    // Extract feature-related responses
    const participantMessages = messages.filter(m => m.sender !== 'Moderator');

    // Improved feature extraction - look for specific feature patterns
    const featureMentions: Array<{ feature: string, sentiment: string, speaker: string }> = [];

    participantMessages.forEach(msg => {
        const text = msg.content.toLowerCase();

        // Skip if not feature-related
        if (!text.includes('feature') && !text.includes('function') &&
            !text.includes('need') && !text.includes('want') &&
            !text.includes('add') && !text.includes('wish') &&
            !text.includes('capability') && !text.includes('tool')) {
            return;
        }

        // Extract feature name from common patterns
        let featureName = 'General Feature';

        // Pattern 1: "I need/want/wish [feature]"
        const wantMatch = text.match(/(?:need|want|wish|like|add)\s+(?:a\s+)?(?:feature\s+)?(?:to\s+)?([a-z\s]{3,30}?)(?:\.|,|!|\?|$)/i);
        if (wantMatch) {
            featureName = wantMatch[1].trim();
        }

        // Pattern 2: "[feature] feature/function/capability"
        const featureMatch = text.match(/([a-z\s]{3,20}?)\s+(?:feature|function|capability|tool)/i);
        if (featureMatch && !wantMatch) {
            featureName = featureMatch[1].trim();
        }

        // Clean up common words
        featureName = featureName
            .replace(/\b(would|could|should|the|a|an|this|that|these|those)\b/gi, '')
            .trim();

        if (featureName.length < 3) {
            featureName = 'General Feature';
        } else {
            // Capitalize first letter
            featureName = featureName.charAt(0).toUpperCase() + featureName.slice(1);
        }

        // Determine sentiment
        const isPositive = ['like', 'love', 'great', 'useful', 'yes', 'perfect', 'awesome'].some(p => text.includes(p));
        const isNegative = ['miss', 'lack', 'without', 'don\'t have', 'need', 'wish', 'no', 'not'].some(n => text.includes(n));

        featureMentions.push({
            feature: featureName,
            sentiment: isNegative ? 'missing' : (isPositive ? 'liked' : 'mentioned'),
            speaker: msg.sender
        });
    });

    // Group by feature
    const featureGroups: Record<string, { name: string, liked: number, missing: number, mentioned: number, total: number }> = {};

    featureMentions.forEach(mention => {
        if (!featureGroups[mention.feature]) {
            featureGroups[mention.feature] = {
                name: mention.feature,
                liked: 0,
                missing: 0,
                mentioned: 0,
                total: 0
            };
        }
        const sentiment = mention.sentiment as 'liked' | 'missing' | 'mentioned';
        featureGroups[mention.feature][sentiment]++;
        featureGroups[mention.feature].total++;
    });

    const topFeatures = Object.values(featureGroups)
        .sort((a, b) => b.total - a.total)
        .slice(0, 6);

    // Calculate priority score (missing requests weigh more)
    const featuresWithPriority = topFeatures.map(f => ({
        ...f,
        priorityScore: (f.missing * 3) + (f.liked * 1) + (f.mentioned * 0.5)
    })).sort((a, b) => b.priorityScore - a.priorityScore);

    // Calculate satisfaction
    const totalMissing = featureMentions.filter(m => m.sentiment === 'missing').length;
    const totalLiked = featureMentions.filter(m => m.sentiment === 'liked').length;
    const totalMentioned = featureMentions.filter(m => m.sentiment === 'mentioned').length;
    const totalCount = totalMissing + totalLiked + totalMentioned;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Top Priority Features */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                        Feature Priority Ranking
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-1">Based on urgency and demand</p>
                </CardHeader>
                <CardContent>
                    {featuresWithPriority.length === 0 ? (
                        <div className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                            No feature discussions yet...
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {featuresWithPriority.map((feature, i) => (
                                <div key={i} className="group">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={`text-xs font-bold ${i === 0 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                        i === 1 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            'bg-slate-50 text-slate-600 border-slate-200'
                                                    }`}
                                            >
                                                #{i + 1}
                                            </Badge>
                                            <span className="text-sm font-semibold text-slate-800">{feature.name}</span>
                                        </div>
                                        <span className="text-xs text-slate-400">{feature.total} mentions</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden flex">
                                            {feature.missing > 0 && (
                                                <div
                                                    className="bg-rose-500 h-full transition-all duration-500"
                                                    style={{ width: `${(feature.missing / feature.total) * 100}%` }}
                                                />
                                            )}
                                            {feature.liked > 0 && (
                                                <div
                                                    className="bg-emerald-500 h-full transition-all duration-500"
                                                    style={{ width: `${(feature.liked / feature.total) * 100}%` }}
                                                />
                                            )}
                                            {feature.mentioned > 0 && (
                                                <div
                                                    className="bg-blue-400 h-full transition-all duration-500"
                                                    style={{ width: `${(feature.mentioned / feature.total) * 100}%` }}
                                                />
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity min-w-[60px] text-right">
                                            {feature.missing}M {feature.liked}L {feature.mentioned}N
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {featuresWithPriority.length > 0 && (
                        <div className="flex gap-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1">
                                <CircleDot className="h-3 w-3 text-rose-500" />
                                Missing ({totalMissing})
                            </div>
                            <div className="flex items-center gap-1">
                                <CircleDot className="h-3 w-3 text-emerald-500" />
                                Liked ({totalLiked})
                            </div>
                            <div className="flex items-center gap-1">
                                <CircleDot className="h-3 w-3 text-blue-400" />
                                Mentioned ({totalMentioned})
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Feature Request Stats */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Layers className="h-4 w-4 text-purple-500" />
                        Feature Request Breakdown
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-1">Overall feature demand analysis</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-rose-600">{totalMissing}</div>
                                <div className="text-xs text-rose-600 font-medium mt-1">Missing</div>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-emerald-600">{totalLiked}</div>
                                <div className="text-xs text-emerald-600 font-medium mt-1">Liked</div>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-blue-600">{totalMentioned}</div>
                                <div className="text-xs text-blue-600 font-medium mt-1">Mentioned</div>
                            </div>
                        </div>

                        {/* Visual Distribution */}
                        {totalCount > 0 && (
                            <>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>Sentiment Distribution</span>
                                        <span className="font-mono">{totalCount} total</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                                        {totalMissing > 0 && (
                                            <div
                                                className="bg-rose-500 h-full transition-all duration-700"
                                                style={{ width: `${(totalMissing / totalCount) * 100}%` }}
                                            />
                                        )}
                                        {totalLiked > 0 && (
                                            <div
                                                className="bg-emerald-500 h-full transition-all duration-700"
                                                style={{ width: `${(totalLiked / totalCount) * 100}%` }}
                                            />
                                        )}
                                        {totalMentioned > 0 && (
                                            <div
                                                className="bg-blue-400 h-full transition-all duration-700"
                                                style={{ width: `${(totalMentioned / totalCount) * 100}%` }}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                                    <div className="text-xs text-slate-500 mb-1">Priority Index</div>
                                    <div className="text-3xl font-bold text-slate-800">
                                        {Math.round((totalMissing / (totalCount || 1)) * 100)}%
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">% of requests are missing features</div>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
