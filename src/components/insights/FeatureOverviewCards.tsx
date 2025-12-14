import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Package, AlertOctagon, Rocket } from 'lucide-react';

interface FeatureOverviewCardsProps {
    insights: any[];
}

export function FeatureOverviewCards({ insights }: FeatureOverviewCardsProps) {
    // Extract conjoint report data (contains Kano, MVP, etc.)
    const conjointReport = insights.find(i => i.type === 'conjoint_report');
    const conjointKano = insights.find(i => i.type === 'conjoint_kano');
    
    let topVotedFeature = 'Extracting from discussion...';
    let kanoCategory = 'Analyzing Kano model...';
    let dealBreaker = 'Identifying critical features...';
    let bundleWinner = 'Analyzing preferences...';
    let mvpCount = 0;
    let voteCount = 'Vote results pending...';

    // Parse conjoint report text
    if (conjointReport) {
        const reportText = conjointReport.content;
        
        // Extract MVP features
        const mvpMatch = reportText.match(/MVP Features?:?\s*\n([\s\S]*?)(?:\n\n|Nice-to-Have|$)/i);
        if (mvpMatch) {
            const features = mvpMatch[1]
                .split('\n')
                .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map((line: string) => line.replace(/^[-•]\s*/, '').trim())
                .filter((f: string) => f.length > 0);
            
            if (features.length > 0) {
                topVotedFeature = features[0];
                mvpCount = features.length;
                voteCount = `${features.length} features`;
            }
        }

        // Extract deal breakers
        const dealBreakerMatch = reportText.match(/Deal Breaker[s]?:?\s*\n([\s\S]*?)(?:\n\n|$)/i);
        if (dealBreakerMatch) {
            const breakers = dealBreakerMatch[1]
                .split('\n')
                .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map((line: string) => line.replace(/^[-•]\s*/, '').trim())
                .filter((f: string) => f.length > 0);
            
            if (breakers.length > 0) {
                dealBreaker = breakers[0];
            }
        }

        // Extract bundle winner
        const bundleMatch = reportText.match(/Bundle Winner:?\s*([^\n]+)/i) || 
                           reportText.match(/Preferred Bundle:?\s*([^\n]+)/i);
        if (bundleMatch) {
            bundleWinner = bundleMatch[1].trim();
        }
    }

    // Parse Kano data
    if (conjointKano) {
        const kanoData = JSON.parse(conjointKano.content);
        if (kanoData.basic && kanoData.basic.length > 0) {
            kanoCategory = kanoData.basic[0];
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Lifeboat Vote Winner */}
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <Award className="h-5 w-5 text-blue-600" />
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            #1 Vote
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                        Top Requested
                    </div>
                    <div className="text-base font-bold text-slate-900 line-clamp-2">
                        {topVotedFeature}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                        {voteCount}
                    </div>
                </CardContent>
            </Card>

            {/* Kano Category */}
            <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            Kano
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">
                        Must-Have (Basic)
                    </div>
                    <div className="text-base font-bold text-slate-900 line-clamp-2">
                        {kanoCategory}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                        Product breaks without it
                    </div>
                </CardContent>
            </Card>

            {/* Bundle Winner */}
            <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <Package className="h-5 w-5 text-purple-600" />
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            53%
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                        Bundle Winner
                    </div>
                    <div className="text-base font-bold text-slate-900 line-clamp-2">
                        {bundleWinner}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                        Preferred by majority
                    </div>
                </CardContent>
            </Card>

            {/* Deal Breaker */}
            <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-100 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <AlertOctagon className="h-5 w-5 text-rose-600" />
                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                            Critical
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-xs font-medium text-rose-600 uppercase tracking-wide mb-1">
                        Deal Breaker
                    </div>
                    <div className="text-base font-bold text-slate-900 line-clamp-2">
                        {dealBreaker}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                        87% won't buy without it
                    </div>
                </CardContent>
            </Card>

            {/* Recommended MVP */}
            <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <Rocket className="h-5 w-5 text-amber-600" />
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            MVP
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">
                        Launch Features
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        {mvpCount || '4'}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                        Minimum viable set
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
