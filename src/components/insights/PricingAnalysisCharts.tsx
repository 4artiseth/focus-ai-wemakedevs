'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface PricingAnalysisChartsProps {
    insights: any[];
}

export function PricingAnalysisCharts({ insights }: PricingAnalysisChartsProps) {
    // Extract pricing insights
    const pricingVW = insights.find(i => i.type === 'pricing_vw');
    const pricingGG = insights.find(i => i.type === 'pricing_gg');

    if (!pricingVW && !pricingGG) {
        return null;
    }

    const vwData = pricingVW ? JSON.parse(pricingVW.content) : null;
    const ggData = pricingGG ? JSON.parse(pricingGG.content) : null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Van Westendorp Price Sensitivity Meter */}
            {vwData && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                            Van Westendorp PSM
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Price Sensitivity Analysis
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Optimal Price Point */}
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                            <div className="text-xs text-emerald-600 font-medium mb-1">OPTIMAL PRICE</div>
                            <div className="text-3xl font-bold text-emerald-700">
                                ₹{vwData.optimalPrice || vwData.bargainMedian}
                            </div>
                            <div className="text-xs text-emerald-600 mt-1">
                                {vwData.acceptanceRate ? `${Math.round(vwData.acceptanceRate * 100)}% acceptance` : 'Sweet spot'}
                            </div>
                        </div>

                        {/* Price Thresholds */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-600">Too Cheap</span>
                                <span className="font-mono font-semibold">₹{vwData.tooCheapMedian}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-emerald-600 font-medium">Bargain ⭐</span>
                                <span className="font-mono font-semibold text-emerald-600">₹{vwData.bargainMedian}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-amber-600">Expensive</span>
                                <span className="font-mono font-semibold text-amber-600">₹{vwData.expensiveMedian}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-rose-600">Too Expensive</span>
                                <span className="font-mono font-semibold text-rose-600">₹{vwData.tooExpensiveMedian}</span>
                            </div>
                        </div>

                        {/* Visual Range */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="text-xs text-slate-500 mb-2">Acceptable Range</div>
                            <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="absolute h-full bg-emerald-500 rounded-full"
                                    style={{
                                        left: `${(vwData.bargainMedian / vwData.tooExpensiveMedian) * 100}%`,
                                        width: `${((vwData.expensiveMedian - vwData.bargainMedian) / vwData.tooExpensiveMedian) * 100}%`
                                    }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>₹0</span>
                                <span>₹{vwData.tooExpensiveMedian}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Gabor-Granger Revenue Optimization */}
            {ggData && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            Gabor-Granger Analysis
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Revenue Maximization
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Optimal Revenue Price */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="text-xs text-blue-600 font-medium mb-1">REVENUE OPTIMAL</div>
                            <div className="text-3xl font-bold text-blue-700">
                                ₹{ggData.optimalPrice}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                                {ggData.revenueScore ? `Revenue Score: ${Math.round(ggData.revenueScore)}` : 'Maximum revenue point'}
                            </div>
                        </div>

                        {/* Price Ladder Results */}
                        {ggData.priceLadder && (
                            <div className="space-y-2">
                                <div className="text-xs text-slate-500 mb-2">Price Ladder Test</div>
                                {ggData.priceLadder.slice(0, 5).map((point: any, i: number) => {
                                    const isOptimal = point.price === ggData.optimalPrice;
                                    return (
                                        <div key={i} className={`flex justify-between items-center text-xs p-2 rounded ${isOptimal ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'}`}>
                                            <span className="font-mono font-semibold">₹{point.price}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500">{Math.round(point.acceptanceRate * 100)}% accept</span>
                                                {isOptimal && <Badge variant="default" className="text-xs">PEAK</Badge>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Elasticity */}
                        {ggData.elasticity && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-600">Price Elasticity</span>
                                    <span className="text-sm font-semibold">{ggData.elasticity.toFixed(2)}</span>
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    {Math.abs(ggData.elasticity) > 1.5 ? 'Highly sensitive' : 'Moderately sensitive'}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
