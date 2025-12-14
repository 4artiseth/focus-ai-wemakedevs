import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertTriangle, TrendingUp, DollarSign, Target } from 'lucide-react';
import { InsightCard } from './InsightCard';
import { FeatureOverviewCards } from './FeatureOverviewCards';

interface ExecutiveSummaryProps {
    session: any;
    insights: any[];
    goal: string;
}

export function ExecutiveSummary({ session, insights, goal }: ExecutiveSummaryProps) {
    const status = session.status;
    const isRunning = status === 'running';
    const isCompleted = status === 'completed';

    // Calculate Progress
    const totalPersonas = session.project?.personas?.length || 15;
    const responseCount = session.messages?.filter((m: any) => m.sender !== 'Moderator').length || 0;
    const estimatedTotal = totalPersonas * 5;
    const progress = Math.min(100, Math.round((responseCount / estimatedTotal) * 100));

    // Extract Key Findings
    const pricingVW = insights.find(i => i.type === 'pricing_vw');
    const concerns = insights.find(i => i.type === 'concerns_barriers');
    const conjoint = insights.find(i => i.type === 'conjoint_report');

    const vwContent = pricingVW ? JSON.parse(pricingVW.content) : null;
    const concernsContent = concerns ? JSON.parse(concerns.content) : null;
    const conjointContent = conjoint ? JSON.parse(conjoint.content) : null;

    const optimalPrice = vwContent?.optimalPrice ? `₹${vwContent.optimalPrice}` : 'Calculating...';
    const topConcern = concernsContent?.concerns?.[0] || 'Analyzing feedback...';
    const topFeature = conjointContent?.mvpFeatures?.[0] || 'Identifying features...';

    // STRICT Goal-based filtering - Only show what's relevant
    const goalLower = (goal || 'all').toLowerCase();
    
    // Determine specific goal type
    const isPricingGoal = goalLower.includes('pricing') || goalLower.includes('price');
    const isValidationGoal = goalLower.includes('validat') || goalLower.includes('idea');
    const isFeatureGoal = goalLower.includes('feature') || goalLower.includes('priorit') || goalLower.includes('conjoint');
    const isMarketingGoal = goalLower.includes('position') || goalLower.includes('market') || goalLower.includes('brand');
    const isAllGoal = goalLower === 'all';

    // Show KPIs only for relevant goals
    const showPricing = isAllGoal || isPricingGoal;
    const showValidation = isAllGoal || isValidationGoal;
    const showFeatures = isAllGoal || isFeatureGoal;

    // Only show the KPI grid if at least one card is relevant
    const hasRelevantKPIs = showPricing || showValidation || showFeatures;

    // Debug logging
    console.log('[ExecutiveSummary] Goal:', goal, 'GoalLower:', goalLower, 'IsFeatureGoal:', isFeatureGoal);

    return (
        <div className="space-y-6">
            {/* Status Header - Clean Notion Style */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            {isRunning ? (
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-600 relative z-10" />
                                </div>
                            ) : (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            )}
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {isRunning ? 'Live Session In Progress' : 'Session Complete'}
                                </h2>
                                <p className="text-slate-500 text-sm">
                                    {isRunning ? `Gathering responses from ${totalPersonas} participants...` : 'All participants have responded.'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900">{progress}%</div>
                            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Completion</div>
                        </div>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-100" indicatorClassName={isRunning ? "bg-blue-600 transition-all duration-500" : "bg-emerald-500"} />
                </CardContent>
            </Card>

            {/* Key Findings / Feature Overview - Conditional based on goal */}
            {isFeatureGoal ? (
                /* Feature-specific overview cards */
                <FeatureOverviewCards insights={insights} />
            ) : hasRelevantKPIs ? (
                /* Standard KPI cards for other goals */
                <div className={`grid gap-4 ${(showPricing && showValidation && showFeatures) ? 'grid-cols-1 md:grid-cols-3' :
                    ((showPricing && showValidation) || (showPricing && showFeatures) || (showValidation && showFeatures)) ? 'grid-cols-1 md:grid-cols-2' :
                        'grid-cols-1'
                    }`}>
                    {showPricing && (
                        <InsightCard
                            title="Optimal Price Point"
                            value={optimalPrice}
                            subtitle="Based on Van Westendorp Analysis"
                            icon={<DollarSign className="h-4 w-4" />}
                            variant="success"
                        />
                    )}

                    {showValidation && topConcern && topConcern !== 'Analyzing feedback...' && (
                        <InsightCard
                            title="Primary Concern"
                            value={topConcern.length > 30 ? topConcern.substring(0, 30) + '...' : topConcern}
                            subtitle="Top barrier to adoption"
                            icon={<AlertTriangle className="h-4 w-4" />}
                            variant="warning"
                        />
                    )}

                    {showFeatures && topFeature && topFeature !== 'Identifying features...' && (
                        <InsightCard
                            title="Top Requested Feature"
                            value={topFeature.length > 30 ? topFeature.substring(0, 30) + '...' : topFeature}
                            subtitle="Must-have for MVP"
                            icon={<Target className="h-4 w-4" />}
                            variant="default"
                        />
                    )}
                </div>
            ) : null}

            {/* Recommendation Box - Only show for relevant goals */}
            {isCompleted && !isFeatureGoal && !isMarketingGoal && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-blue-800 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Strategic Recommendation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-blue-900 font-medium">
                            Launch at {optimalPrice}/month. Focus marketing on addressing "{topConcern}".
                            Ensure "{topFeature}" is polished for V1.0.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
