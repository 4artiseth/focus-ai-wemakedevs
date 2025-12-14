'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, AlertTriangle, Heart, Frown, Smile, Meh, AlertCircle } from 'lucide-react';

interface ValidationDetailedSectionProps {
    insights: any[];
}

export function ValidationDetailedSection({ insights }: ValidationDetailedSectionProps) {
    const validationInsight = insights.find(i => i.type === 'validation_insights');
    const aggregatedMetrics = insights.find(i => i.type === 'aggregated_metrics');
    const concernsInsight = insights.find(i => i.type === 'concerns_barriers');

    const validationData = validationInsight ? JSON.parse(validationInsight.content) : null;
    const metricsData = aggregatedMetrics ? JSON.parse(aggregatedMetrics.content) : null;
    const concernsData = concernsInsight ? JSON.parse(concernsInsight.content) : null;

    // If NO validation data exists, return null
    if (!validationData && !metricsData && !concernsData) {
        return null;
    }

    // Only use data if it exists, otherwise null
    const problemScore = validationData?.avg_problem_reality || metricsData?.avg_pain_intensity || null;
    const conceptAppeal = validationData?.avg_concept_appeal || metricsData?.avg_confidence || null;
    const adoptionLikelihood = validationData?.avg_adoption_likelihood || null;
    
    const topBarriers = validationData?.top_barriers || concernsData?.barriers || [];
    const mustHaveFeatures = validationData?.must_have_features || [];
    const topEmotions = metricsData?.top_emotions || [];

    // If all scores are null, return null
    if (!problemScore && !conceptAppeal && !adoptionLikelihood) {
        return null;
    }

    return (
        <div className="space-y-8">
            {/* CONCEPT VALIDATION SCORECARD */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                <CardHeader className="border-b border-purple-100 bg-purple-50/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold text-purple-900 flex items-center gap-3">
                                <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-white" />
                                </div>
                                Concept Validation Scorecard
                            </CardTitle>
                            <p className="text-purple-700 mt-2">Quantitative assessment of product-market fit</p>
                        </div>
                        <Badge className="bg-purple-600 text-white text-lg px-4 py-2">
                            Validation
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                    {/* QUANTITATIVE SCORES */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Quantitative Scores</h3>
                        <div className="space-y-6">
                            {/* Problem Intensity */}
                            {problemScore && (
                                <div className="bg-white border-2 border-slate-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold text-slate-700">Problem Intensity</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-bold text-slate-900">{problemScore.toFixed(1)}</span>
                                            <span className="text-slate-500">/10</span>
                                            {problemScore >= 8 ? (
                                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                            ) : problemScore >= 6 ? (
                                                <AlertTriangle className="h-6 w-6 text-amber-500" />
                                            ) : (
                                                <XCircle className="h-6 w-6 text-rose-500" />
                                            )}
                                        </div>
                                    </div>
                                    <Progress 
                                        value={problemScore * 10} 
                                        className="h-3"
                                        indicatorClassName={problemScore >= 8 ? "bg-green-500" : problemScore >= 6 ? "bg-amber-500" : "bg-rose-500"}
                                    />
                                    <p className="text-sm text-slate-500 mt-2">
                                        {problemScore >= 8 ? "✓ Strong problem validation" : problemScore >= 6 ? "⚠️ Moderate problem intensity" : "❌ Weak problem validation"}
                                    </p>
                                </div>
                            )}

                            {/* Concept Appeal */}
                            {conceptAppeal && (
                                <div className="bg-white border-2 border-slate-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold text-slate-700">Concept Appeal</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-bold text-slate-900">{conceptAppeal.toFixed(1)}</span>
                                            <span className="text-slate-500">/10</span>
                                            {conceptAppeal >= 7.5 ? (
                                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                            ) : conceptAppeal >= 6 ? (
                                                <AlertTriangle className="h-6 w-6 text-amber-500" />
                                            ) : (
                                                <XCircle className="h-6 w-6 text-rose-500" />
                                            )}
                                        </div>
                                    </div>
                                    <Progress 
                                        value={conceptAppeal * 10} 
                                        className="h-3"
                                        indicatorClassName={conceptAppeal >= 7.5 ? "bg-green-500" : conceptAppeal >= 6 ? "bg-amber-500" : "bg-rose-500"}
                                    />
                                    <p className="text-sm text-slate-500 mt-2">
                                        {conceptAppeal >= 7.5 ? "✓ High appeal" : conceptAppeal >= 6 ? "⚠️ Moderate appeal" : "❌ Low appeal"}
                                    </p>
                                </div>
                            )}

                            {/* Adoption Likelihood */}
                            {adoptionLikelihood && (
                                <div className="bg-white border-2 border-slate-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold text-slate-700">Adoption Likelihood</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-bold text-slate-900">{adoptionLikelihood.toFixed(1)}</span>
                                            <span className="text-slate-500">/10</span>
                                            {adoptionLikelihood >= 7 ? (
                                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                            ) : adoptionLikelihood >= 5 ? (
                                                <AlertTriangle className="h-6 w-6 text-amber-500" />
                                            ) : (
                                                <XCircle className="h-6 w-6 text-rose-500" />
                                            )}
                                        </div>
                                    </div>
                                    <Progress 
                                        value={adoptionLikelihood * 10} 
                                        className="h-3"
                                        indicatorClassName={adoptionLikelihood >= 7 ? "bg-green-500" : adoptionLikelihood >= 5 ? "bg-amber-500" : "bg-rose-500"}
                                    />
                                    <p className="text-sm text-slate-500 mt-2">
                                        {adoptionLikelihood >= 7 ? "✓ High likelihood" : adoptionLikelihood >= 5 ? "⚠️ Moderate likelihood" : "❌ Low likelihood"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PROBLEM VALIDATION */}
                    {metricsData && metricsData.key_quotes && metricsData.key_quotes.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Problem Validation</h3>
                            <div className="space-y-4">
                                <div className="bg-white border-l-4 border-purple-500 rounded-lg p-4">
                                    <p className="text-sm text-slate-500 mb-2">💬 Key Participant Quote:</p>
                                    <p className="text-slate-700 italic">
                                        {metricsData.key_quotes[0]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FEATURE RANKING */}
                    {mustHaveFeatures.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Feature Ranking</h3>
                            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    <h4 className="font-bold text-green-900">MUST-HAVE Features</h4>
                                </div>
                                <p className="text-sm text-green-700 mb-3">(Deal Breakers)</p>
                                <ul className="space-y-2">
                                    {mustHaveFeatures.slice(0, 5).map((feature: any, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                            <span className="text-green-600">✓</span>
                                            <span>{feature.feature || feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* ADOPTION BARRIERS */}
                    {topBarriers.length > 0 && (
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                                Top Adoption Barriers
                            </h3>
                            <div className="space-y-3">
                                {topBarriers.slice(0, 5).map((barrier: any, i: number) => (
                                    <div key={i} className="bg-white border-l-4 border-amber-500 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <span className="font-bold text-amber-600 text-lg">{i + 1}.</span>
                                            <p className="font-semibold text-slate-800">
                                                {barrier.barrier || barrier}
                                                {barrier.count && <span className="text-slate-500 ml-2">({barrier.count} mentions)</span>}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* EMOTIONAL SENTIMENT ANALYSIS */}
                    {topEmotions.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Emotional Sentiment Analysis</h3>
                            <div className="space-y-4">
                                {/* Sentiment bars */}
                                <div className="space-y-3">
                                    {topEmotions.map((emotion: any, i: number) => (
                                        <div key={i}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {emotion.emotion === 'positive' || emotion.emotion.includes('hope') ? (
                                                        <Smile className="h-5 w-5 text-green-500" />
                                                    ) : emotion.emotion === 'negative' || emotion.emotion.includes('skeptic') ? (
                                                        <Frown className="h-5 w-5 text-rose-500" />
                                                    ) : (
                                                        <Meh className="h-5 w-5 text-slate-400" />
                                                    )}
                                                    <span className="font-semibold text-slate-700 capitalize">{emotion.emotion}</span>
                                                </div>
                                                <span className="text-slate-600 font-semibold">{Math.round(emotion.percentage)}%</span>
                                            </div>
                                            <Progress 
                                                value={emotion.percentage} 
                                                className="h-3"
                                                indicatorClassName={
                                                    emotion.emotion === 'positive' || emotion.emotion.includes('hope') ? "bg-green-500" :
                                                    emotion.emotion === 'negative' || emotion.emotion.includes('skeptic') ? "bg-rose-500" :
                                                    "bg-slate-400"
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>


                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
