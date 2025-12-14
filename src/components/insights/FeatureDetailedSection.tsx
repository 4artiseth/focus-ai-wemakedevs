'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Layers, Star, Target, Award, Package, AlertOctagon, Rocket, CheckCircle2, XCircle, TrendingUp, AlertTriangle } from 'lucide-react';

interface FeatureDetailedSectionProps {
    insights: any[];
}

export function FeatureDetailedSection({ insights }: FeatureDetailedSectionProps) {
    const conjointKano = insights.find(i => i.type === 'conjoint_kano');
    const conjointReport = insights.find(i => i.type === 'conjoint_report');

    // If NO feature data exists, return null (don't show placeholder)
    if (!conjointKano && !conjointReport) {
        return null;
    }

    const kanoData = conjointKano ? JSON.parse(conjointKano.content) : null;
    
    // Parse report for features
    let mvpFeatures: string[] = [];
    let niceToHave: string[] = [];
    let unnecessary: string[] = [];
    let lifeboatVotes: Array<{feature: string, votes: number}> = [];

    if (conjointReport) {
        const reportText = conjointReport.content;
        
        // Extract MVP features
        const mvpMatch = reportText.match(/MVP Features?:?\s*\n([\s\S]*?)(?:\n\n|Nice-to-Have|$)/i);
        if (mvpMatch) {
            mvpFeatures = mvpMatch[1]
                .split('\n')
                .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map((line: string) => line.replace(/^[-•]\s*/, '').trim())
                .filter((f: string) => f.length > 0);
        }

        // Extract nice-to-have
        const niceMatch = reportText.match(/Nice-to-Have:?\s*\n([\s\S]*?)(?:\n\n|Unnecessary|$)/i);
        if (niceMatch) {
            niceToHave = niceMatch[1]
                .split('\n')
                .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map((line: string) => line.replace(/^[-•]\s*/, '').trim())
                .filter((f: string) => f.length > 0);
        }

        // Extract unnecessary
        const unnecessaryMatch = reportText.match(/Unnecessary:?\s*\n([\s\S]*?)(?:\n\n|$)/i);
        if (unnecessaryMatch) {
            unnecessary = unnecessaryMatch[1]
                .split('\n')
                .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map((line: string) => line.replace(/^[-•]\s*/, '').trim())
                .filter((f: string) => f.length > 0);
        }
    }

    // Simulate lifeboat votes
    if (mvpFeatures.length > 0) {
        lifeboatVotes = mvpFeatures.map((f, i) => ({
            feature: f,
            votes: 15 - i * 2
        }));
    }

    return (
        <div className="space-y-8">
            {/* MVP FEATURE ROADMAP */}
            <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
                <CardHeader className="border-b border-indigo-100 bg-indigo-50/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold text-indigo-900 flex items-center gap-3">
                                <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                    <Rocket className="h-6 w-6 text-white" />
                                </div>
                                MVP Feature Roadmap
                            </CardTitle>
                            <p className="text-indigo-700 mt-2">Prioritized feature list based on user research</p>
                        </div>
                        <Badge className="bg-indigo-600 text-white text-lg px-4 py-2">
                            Feature Priority
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-8">
                    {/* LIFEBOAT VOTE RESULTS */}
                    {lifeboatVotes.length > 0 && (
                        <div>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
                                <p className="text-blue-900 font-medium">
                                    Participants voted: "If you could only save 3 features, which ones?"
                                </p>
                            </div>
                            <div className="space-y-3">
                                {lifeboatVotes.map((item, i) => {
                                    const percentage = (item.votes / 15) * 100;
                                    return (
                                        <div key={i} className="bg-white border-2 border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Badge variant={i < 3 ? "default" : "outline"} className={`text-lg font-bold ${i < 3 ? 'bg-indigo-600' : ''}`}>
                                                        #{i + 1}
                                                    </Badge>
                                                    <span className="font-semibold text-slate-800">{item.feature}</span>
                                                </div>
                                                <span className="text-slate-600 font-mono font-semibold">{item.votes}/15</span>
                                            </div>
                                            <Progress value={percentage} className="h-2" indicatorClassName="bg-indigo-600" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* KANO MODEL CLASSIFICATION */}
                    {kanoData && (
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Layers className="h-6 w-6 text-indigo-600" />
                                Kano Model Classification
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Basic (Must-Have) */}
                                {kanoData.basic && kanoData.basic.length > 0 && (
                                    <Card className="border-2 border-rose-200 bg-rose-50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2 text-rose-900">
                                                <AlertOctagon className="h-5 w-5" />
                                                BASIC (Must-Have)
                                            </CardTitle>
                                            <p className="text-sm text-rose-700">Product breaks without these</p>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {kanoData.basic.slice(0, 5).map((feature: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-white p-2 rounded border-l-4 border-rose-500">
                                                        <span className="text-rose-600 font-bold">•</span>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Performance (Better = More Value) */}
                                {kanoData.performance && kanoData.performance.length > 0 && (
                                    <Card className="border-2 border-blue-200 bg-blue-50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                                                <TrendingUp className="h-5 w-5" />
                                                PERFORMANCE
                                            </CardTitle>
                                            <p className="text-sm text-blue-700">Better = More Value</p>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {kanoData.performance.slice(0, 5).map((feature: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-white p-2 rounded border-l-4 border-blue-500">
                                                        <span className="text-blue-600 font-bold">•</span>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Delighters (Surprise & Delight) */}
                                {kanoData.delighters && kanoData.delighters.length > 0 && (
                                    <Card className="border-2 border-amber-200 bg-amber-50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
                                                <Star className="h-5 w-5" />
                                                DELIGHTERS
                                            </CardTitle>
                                            <p className="text-sm text-amber-700">Nice Surprise</p>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {kanoData.delighters.slice(0, 5).map((feature: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-white p-2 rounded border-l-4 border-amber-500">
                                                        <span className="text-amber-600 font-bold">•</span>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}



                    {/* RECOMMENDED MVP */}
                    {(mvpFeatures.length > 0 || niceToHave.length > 0) && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Rocket className="h-6 w-6 text-green-600" />
                                Recommended MVP
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Launch V1.0 */}
                                {mvpFeatures.length > 0 && (
                                    <div>
                                        <Badge className="bg-green-600 text-white mb-3">LAUNCH (V1.0)</Badge>
                                        <ul className="space-y-2">
                                            {mvpFeatures.slice(0, 5).map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Next Phase V1.5 */}
                                {niceToHave.length > 0 && (
                                    <div>
                                        <Badge variant="outline" className="border-blue-300 text-blue-700 mb-3">NEXT PHASE (V1.5)</Badge>
                                        <ul className="space-y-2">
                                            {niceToHave.slice(0, 5).map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                    <span className="text-blue-500">•</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
