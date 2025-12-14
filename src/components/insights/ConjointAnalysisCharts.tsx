'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Star, Target, AlertCircle } from 'lucide-react';

interface ConjointAnalysisChartsProps {
    insights: any[];
}

export function ConjointAnalysisCharts({ insights }: ConjointAnalysisChartsProps) {
    // Extract conjoint insights
    const conjointKano = insights.find(i => i.type === 'conjoint_kano');
    const conjointReport = insights.find(i => i.type === 'conjoint_report');

    if (!conjointKano && !conjointReport) {
        return null;
    }

    const kanoData = conjointKano ? JSON.parse(conjointKano.content) : null;

    // Parse report for MVP features
    let mvpFeatures: string[] = [];
    let niceToHave: string[] = [];
    let unnecessary: string[] = [];

    if (conjointReport) {
        const reportText = conjointReport.content;
        // Extract MVP features from report
        const mvpMatch = reportText.match(/MVP Features?:?\s*\n([\s\S]*?)(?:\n\n|Nice-to-Have|$)/i);
        if (mvpMatch) {
            mvpFeatures = mvpMatch[1]
                .split('\n')
                .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map((line: string) => line.replace(/^[-•]\s*/, '').trim())
                .filter((f: string) => f.length > 0)
                .slice(0, 5);
        }

        const niceMatch = reportText.match(/Nice-to-Have:?\s*\n([\s\S]*?)(?:\n\n|Unnecessary|$)/i);
        if (niceMatch) {
            niceToHave = niceMatch[1]
                .split('\n')
                .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map((line: string) => line.replace(/^[-•]\s*/, '').trim())
                .filter((f: string) => f.length > 0)
                .slice(0, 3);
        }

        const unnecessaryMatch = reportText.match(/Unnecessary:?\s*\n([\s\S]*?)(?:\n\n|$)/i);
        if (unnecessaryMatch) {
            unnecessary = unnecessaryMatch[1]
                .split('\n')
                .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map((line: string) => line.replace(/^[-•]\s*/, '').trim())
                .filter((f: string) => f.length > 0)
                .slice(0, 3);
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Kano Model Classification */}
            {kanoData && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Layers className="h-4 w-4 text-purple-500" />
                            Kano Model Classification
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Feature satisfaction analysis
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Basic (Must-Have) */}
                            {kanoData.basic && kanoData.basic.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-2 w-2 bg-rose-500 rounded-full"></div>
                                        <span className="text-xs font-semibold text-slate-700">BASIC (Must-Have)</span>
                                    </div>
                                    <div className="space-y-1">
                                        {kanoData.basic.slice(0, 3).map((feature: string, i: number) => (
                                            <div key={i} className="text-xs text-slate-600 pl-4 py-1 bg-rose-50 rounded border-l-2 border-rose-500">
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Performance (Better = More Value) */}
                            {kanoData.performance && kanoData.performance.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-xs font-semibold text-slate-700">PERFORMANCE (Linear Value)</span>
                                    </div>
                                    <div className="space-y-1">
                                        {kanoData.performance.slice(0, 3).map((feature: string, i: number) => (
                                            <div key={i} className="text-xs text-slate-600 pl-4 py-1 bg-blue-50 rounded border-l-2 border-blue-500">
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Delighters (Surprise & Delight) */}
                            {kanoData.delighters && kanoData.delighters.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                                        <span className="text-xs font-semibold text-slate-700">DELIGHTERS (Wow Factor)</span>
                                    </div>
                                    <div className="space-y-1">
                                        {kanoData.delighters.slice(0, 3).map((feature: string, i: number) => (
                                            <div key={i} className="text-xs text-slate-600 pl-4 py-1 bg-amber-50 rounded border-l-2 border-amber-500">
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* MVP Roadmap */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-emerald-500" />
                        MVP Feature Roadmap
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Prioritized feature list
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* MVP Features */}
                        {mvpFeatures.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="default" className="text-xs bg-emerald-600">LAUNCH (V1.0)</Badge>
                                </div>
                                <div className="space-y-1">
                                    {mvpFeatures.map((feature: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700 py-1">
                                            <Star className="h-3 w-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Nice-to-Have */}
                        {niceToHave.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs">NEXT PHASE (V1.5)</Badge>
                                </div>
                                <div className="space-y-1">
                                    {niceToHave.map((feature: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600 py-1">
                                            <div className="h-1.5 w-1.5 bg-slate-400 rounded-full mt-1 flex-shrink-0"></div>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Unnecessary */}
                        {unnecessary.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="destructive" className="text-xs">CUT THESE</Badge>
                                </div>
                                <div className="space-y-1">
                                    {unnecessary.map((feature: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-slate-500 line-through py-1">
                                            <span className="text-rose-500">✗</span>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Fallback if no features extracted */}
                        {mvpFeatures.length === 0 && niceToHave.length === 0 && (
                            <div className="text-center text-slate-400 text-xs py-4">
                                Feature roadmap will be generated from analysis...
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
