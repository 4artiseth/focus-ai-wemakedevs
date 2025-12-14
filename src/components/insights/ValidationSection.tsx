import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, ThumbsDown, ThumbsUp, MessageSquare } from 'lucide-react';

interface ValidationSectionProps {
    insights: any[];
}

export function ValidationSection({ insights }: ValidationSectionProps) {
    const concernsInsight = insights.find(i => i.type === 'concerns_barriers');
    const data = concernsInsight ? JSON.parse(concernsInsight.content) : null;

    if (!data) return null;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 p-1 rounded">🔬</span>
                Idea Validation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quantitative Scores (Mocked for now based on qualitative data presence) */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Validation Scorecard</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Problem Intensity</span>
                                <span className="font-bold">High</span>
                            </div>
                            <Progress value={82} className="h-2" indicatorClassName="bg-blue-600" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Concept Appeal</span>
                                <span className="font-bold">Medium</span>
                            </div>
                            <Progress value={65} className="h-2" indicatorClassName="bg-amber-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Adoption Likelihood</span>
                                <span className="font-bold">Medium-High</span>
                            </div>
                            <Progress value={70} className="h-2" indicatorClassName="bg-green-500" />
                        </div>
                    </CardContent>
                </Card>

                {/* Top Concerns */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Adoption Barriers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.barriers?.map((barrier: string, i: number) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>{barrier}</span>
                                </div>
                            ))}
                            {(!data.barriers || data.barriers.length === 0) && (
                                <p className="text-muted-foreground text-sm">No barriers detected yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Concerns List */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Key Concerns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {data.concerns?.map((concern: string, i: number) => (
                                <div key={i} className="bg-slate-50 p-3 rounded-md border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="bg-white">Concern #{i + 1}</Badge>
                                    </div>
                                    <p className="text-sm text-slate-700">"{concern}"</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
