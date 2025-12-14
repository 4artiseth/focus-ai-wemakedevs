import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LivePositioningMap } from '../dashboard/LivePositioningMap';
import { Compass } from 'lucide-react';

interface PositioningSectionProps {
    insights: any[];
    messages: any[];
}

export function PositioningSection({ insights, messages }: PositioningSectionProps) {
    const positioningInsight = insights.find(i => i.type === 'positioning_map');
    const data = positioningInsight ? JSON.parse(positioningInsight.content) : null;

    // Even if no insight yet, we might have map data points in messages
    const hasMapData = messages.some(m => {
        try {
            const meta = JSON.parse(m.metadata || '{}');
            return typeof meta.x === 'number';
        } catch { return false; }
    });

    if (!data && !hasMapData) return null;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 p-1 rounded">🧭</span>
                Positioning Strategy
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Perceptual Map */}
                <div className="md:col-span-2">
                    <LivePositioningMap messages={messages} />
                </div>

                {/* Brand Archetype */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Brand Archetype</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Compass className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-indigo-900">The Sage</div>
                                <p className="text-sm text-slate-500">Wisdom, Clarity, Understanding</p>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">
                            "It gives wisdom without being preachy. It's like a knowledgeable friend, not a judgmental priest."
                        </div>
                    </CardContent>
                </Card>

                {/* Competitive Differentiation */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Competitive Edge</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">vs. Karma (Traditional)</span>
                                <Badge variant="outline" className="text-blue-600 border-blue-200">For Skeptics</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">vs. Headspace (Wellness)</span>
                                <Badge variant="outline" className="text-purple-600 border-purple-200">Cultural Roots</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">vs. Books (Academic)</span>
                                <Badge variant="outline" className="text-green-600 border-green-200">Instant Clarity</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
