import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, Zap } from 'lucide-react';

interface FeaturePrioritizationSectionProps {
    insights: any[];
}

export function FeaturePrioritizationSection({ insights }: FeaturePrioritizationSectionProps) {
    const kanoInsight = insights.find(i => i.type === 'conjoint_kano');
    const conjointReport = insights.find(i => i.type === 'conjoint_report');

    const kanoData = kanoInsight ? JSON.parse(kanoInsight.content) : null;
    const reportData = conjointReport ? JSON.parse(conjointReport.content) : null;

    if (!kanoData && !reportData) return null;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="bg-amber-100 text-amber-700 p-1 rounded">⚡</span>
                Feature Prioritization
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lifeboat Vote Results */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">"Lifeboat" Vote Results (Must-Haves)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {reportData?.mvpFeatures?.map((feature: string, i: number) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium">{feature}</span>
                                            <span className="text-slate-500 font-mono">High Priority</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600" style={{ width: `${100 - (i * 10)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {!reportData?.mvpFeatures && <p className="text-sm text-muted-foreground">Waiting for voting results...</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Kano Model */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Kano Classification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Basic (Must-Haves)</h4>
                            <div className="flex flex-wrap gap-2">
                                {kanoData?.basic?.map((f: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700">{f}</Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Performance (More is Better)</h4>
                            <div className="flex flex-wrap gap-2">
                                {kanoData?.performance?.map((f: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">{f}</Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Delighters (Wow Factor)</h4>
                            <div className="flex flex-wrap gap-2">
                                {kanoData?.excitement?.map((f: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100">{f}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Deal Breakers */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Deal Breakers & Rejections</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {reportData?.rejectedFeatures?.map((feature: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-2 rounded border border-red-100">
                                    <X className="h-4 w-4 shrink-0" />
                                    <span>{feature} (Rejected)</span>
                                </div>
                            ))}
                            {!reportData?.rejectedFeatures && <p className="text-sm text-muted-foreground">No rejections recorded.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
