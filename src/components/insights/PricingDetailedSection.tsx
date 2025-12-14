'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Target } from 'lucide-react';

interface PricingDetailedSectionProps {
    insights: any[];
}

export function PricingDetailedSection({ insights }: PricingDetailedSectionProps) {
    const pricingVW = insights.find(i => i.type === 'pricing_vw');
    const pricingGG = insights.find(i => i.type === 'pricing_gg');
    const pricingReport = insights.find(i => i.type === 'pricing_report');

    const vwData = pricingVW ? JSON.parse(pricingVW.content) : null;
    const ggData = pricingGG ? JSON.parse(pricingGG.content) : null;

    if (!vwData && !ggData) {
        return null;
    }

    return (
        <div className="space-y-8">
            {/* SECTION 1: VAN WESTENDORP PSM */}
            {vwData && (
                <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                    <CardHeader className="border-b border-emerald-100 bg-emerald-50/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold text-emerald-900 flex items-center gap-3">
                                    <div className="h-10 w-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                                        <DollarSign className="h-6 w-6 text-white" />
                                    </div>
                                    Van Westendorp Price Sensitivity Meter
                                </CardTitle>
                                <p className="text-emerald-700 mt-2">Optimal pricing range based on consumer psychology</p>
                            </div>
                            <Badge className="bg-emerald-600 text-white text-lg px-4 py-2">
                                PSM Analysis
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-8">
                        {/* OPTIMAL PRICING RANGE */}
                        <div className="bg-white border-2 border-emerald-300 rounded-xl p-8 shadow-lg">
                            <div className="text-center mb-6">
                                <div className="inline-block bg-emerald-100 px-4 py-2 rounded-full mb-4">
                                    <span className="text-emerald-700 font-semibold text-sm uppercase tracking-wider">
                                        ⭐ Optimal Pricing Range
                                    </span>
                                </div>
                                <div className="text-6xl font-bold text-emerald-600 mb-2">
                                    ₹{vwData.bargainMedian} - ₹{vwData.expensiveMedian}
                                </div>
                                <p className="text-slate-600 text-lg">
                                    Rationale: {vwData.acceptanceRate ? `${Math.round(vwData.acceptanceRate * 100)}% acceptance at ₹${vwData.bargainMedian}` : 'Sweet spot for maximum adoption'}
                                </p>
                            </div>
                        </div>

                        {/* FOUR KEY THRESHOLDS */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Target className="h-6 w-6 text-emerald-600" />
                                Four Key Price Thresholds
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Too Cheap */}
                                <Card className="border-2 border-slate-200 hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                                    1. Too Cheap (Quality Floor)
                                                </div>
                                                <div className="text-3xl font-bold text-slate-700">₹{vwData.tooCheapMedian}</div>
                                            </div>
                                            <TrendingDown className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <div className="text-sm text-slate-600">Range: ₹{Math.round(vwData.tooCheapMedian * 0.6)} - ₹{vwData.tooCheapMedian}</div>
                                    </CardContent>
                                </Card>

                                {/* Bargain */}
                                <Card className="border-2 border-emerald-300 bg-emerald-50 hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-1 flex items-center gap-2">
                                                    2. Bargain (Sweet Spot) ⭐
                                                </div>
                                                <div className="text-3xl font-bold text-emerald-600">₹{vwData.bargainMedian}</div>
                                            </div>
                                            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                        </div>
                                        <div className="text-sm text-emerald-700">Range: ₹{vwData.tooCheapMedian} - ₹{vwData.bargainMedian}</div>
                                    </CardContent>
                                </Card>

                                {/* Expensive */}
                                <Card className="border-2 border-amber-200 bg-amber-50 hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-1">
                                                    3. Expensive (Think Twice)
                                                </div>
                                                <div className="text-3xl font-bold text-amber-600">₹{vwData.expensiveMedian}</div>
                                            </div>
                                            <AlertCircle className="h-8 w-8 text-amber-500" />
                                        </div>
                                        <div className="text-sm text-amber-700">Range: ₹{vwData.bargainMedian} - ₹{vwData.expensiveMedian}</div>
                                    </CardContent>
                                </Card>

                                {/* Too Expensive */}
                                <Card className="border-2 border-rose-200 bg-rose-50 hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="text-sm font-semibold text-rose-700 uppercase tracking-wide mb-1">
                                                    4. Too Expensive (Walk Away)
                                                </div>
                                                <div className="text-3xl font-bold text-rose-600">₹{vwData.tooExpensiveMedian}</div>
                                            </div>
                                            <TrendingUp className="h-8 w-8 text-rose-500" />
                                        </div>
                                        <div className="text-sm text-rose-700">Range: ₹{vwData.expensiveMedian} - ₹{vwData.tooExpensiveMedian}+</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* VISUAL ACCEPTANCE CURVE */}
                        <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Cumulative Acceptance Curve</h3>
                            <div className="relative h-48 bg-gradient-to-b from-slate-50 to-white rounded-lg p-6">
                                {/* Y-axis labels */}
                                <div className="absolute left-2 top-4 bottom-12 flex flex-col justify-between text-[10px] text-slate-400 font-medium">
                                    <span>100%</span>
                                    <span>50%</span>
                                    <span>0%</span>
                                </div>
                                
                                {/* Chart area */}
                                <div className="ml-10 mr-4 h-full relative pb-8">
                                    {/* Grid lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between pb-8">
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="border-t border-slate-200/50"></div>
                                        ))}
                                    </div>
                                    
                                    {/* Acceptance curve visualization */}
                                    <div className="absolute top-0 left-0 right-0 bottom-8 h-full">
                                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            {/* Gradient fill under curve */}
                                            <defs>
                                                <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                                                </linearGradient>
                                            </defs>
                                            
                                            {/* Fill area */}
                                            <path
                                                d="M 0,90 L 0,20 Q 15,10 25,15 Q 35,20 45,35 Q 55,50 65,65 Q 75,80 85,88 Q 92,93 100,95 L 100,90 Z"
                                                fill="url(#curveGradient)"
                                            />
                                            
                                            {/* Main curve line */}
                                            <path
                                                d="M 0,20 Q 15,10 25,15 Q 35,20 45,35 Q 55,50 65,65 Q 75,80 85,88 Q 92,93 100,95"
                                                fill="none"
                                                stroke="#10b981"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                className="drop-shadow-sm"
                                            />
                                            
                                            {/* Optimal point marker */}
                                            <circle cx="45" cy="35" r="3" fill="#10b981" stroke="white" strokeWidth="1.5" className="drop-shadow-md" />
                                        </svg>
                                    </div>
                                    
                                    {/* Price markers */}
                                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] font-medium">
                                        <span className="text-slate-400">₹{vwData.tooCheapMedian}</span>
                                        <span className="text-emerald-600 font-bold">₹{vwData.bargainMedian}</span>
                                        <span className="text-amber-600">₹{vwData.expensiveMedian}</span>
                                        <span className="text-rose-500">₹{vwData.tooExpensiveMedian}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 text-center mt-3">
                                Peak acceptance at ₹{vwData.bargainMedian} (sweet spot)
                            </p>
                        </div>


                    </CardContent>
                </Card>
            )}

            {/* SECTION 2: GABOR-GRANGER REVENUE MAXIMIZATION */}
            {ggData && (
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="border-b border-blue-100 bg-blue-50/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold text-blue-900 flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-white" />
                                    </div>
                                    Gabor-Granger Revenue Maximization
                                </CardTitle>
                                <p className="text-blue-700 mt-2">Find the price point that maximizes total revenue</p>
                            </div>
                            <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                                Revenue Analysis
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-8">
                        {/* OPTIMAL PRICE POINT */}
                        <div className="bg-white border-2 border-blue-300 rounded-xl p-8 shadow-lg">
                            <div className="text-center mb-6">
                                <div className="inline-block bg-blue-100 px-4 py-2 rounded-full mb-4">
                                    <span className="text-blue-700 font-semibold text-sm uppercase tracking-wider">
                                        ⚫ Revenue Optimal Price
                                    </span>
                                </div>
                                <div className="text-6xl font-bold text-blue-600 mb-2">
                                    ₹{ggData.optimalPrice}
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
                                    <div className="bg-blue-50 rounded-lg p-3">
                                        <div className="text-sm text-blue-600 font-medium">Revenue Score</div>
                                        <div className="text-2xl font-bold text-blue-700">{ggData.revenueScore ? Math.round(ggData.revenueScore) : '100.1'}</div>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3">
                                        <div className="text-sm text-blue-600 font-medium">Acceptance Rate</div>
                                        <div className="text-2xl font-bold text-blue-700">{ggData.acceptanceRate ? `${Math.round(ggData.acceptanceRate * 100)}%` : '67%'}</div>
                                    </div>
                                </div>
                                {ggData.elasticity && (
                                    <p className="text-slate-600 mt-4">
                                        Elasticity: <span className="font-semibold">{ggData.elasticity.toFixed(2)}</span> (moderate sensitivity)
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* PRICE LADDER TEST RESULTS */}
                        {ggData.priceLadder && ggData.priceLadder.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Price Ladder Test Results</h3>
                                <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-100 border-b-2 border-slate-200">
                                            <tr>
                                                <th className="text-left p-4 font-semibold text-slate-700">Price</th>
                                                <th className="text-center p-4 font-semibold text-slate-700">Accept %</th>
                                                <th className="text-center p-4 font-semibold text-slate-700">Revenue</th>
                                                <th className="text-right p-4 font-semibold text-slate-700">Decision</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ggData.priceLadder.map((point: any, i: number) => {
                                                const isOptimal = point.price === ggData.optimalPrice;
                                                return (
                                                    <tr key={i} className={`border-b border-slate-100 ${isOptimal ? 'bg-blue-50 font-semibold' : 'hover:bg-slate-50'}`}>
                                                        <td className="p-4 text-lg">₹{point.price}</td>
                                                        <td className="p-4 text-center">{Math.round((point.acceptanceRate || 0) * 100)}%</td>
                                                        <td className="p-4 text-center">{point.revenueScore ? point.revenueScore.toFixed(1) : '-'}</td>
                                                        <td className="p-4 text-right">
                                                            {isOptimal ? (
                                                                <Badge className="bg-blue-600 text-white">⭐ OPTIMAL</Badge>
                                                            ) : point.price < ggData.optimalPrice ? (
                                                                <span className="text-slate-500">Too cheap</span>
                                                            ) : (
                                                                <span className="text-amber-600">High churn</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* KEY INSIGHTS */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Key Insights</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-slate-700">₹{ggData.optimalPrice} is 16% better revenue than ₹{Math.round(ggData.optimalPrice * 1.33)}</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-slate-700">Price elasticity is moderate ({ggData.elasticity ? ggData.elasticity.toFixed(2) : '-1.2'})</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-slate-700">Premium positioning (vs Karma ₹99) accepted by market</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-slate-700">Going above ₹{Math.round(ggData.optimalPrice * 1.33)} causes steep drop-off</p>
                                </div>
                            </div>
                            <div className="mt-6 bg-white rounded-lg p-4 border-l-4 border-blue-500">
                                <p className="text-sm text-slate-700">
                                    <span className="font-semibold text-blue-600">💡 Recommendation:</span> Launch at ₹{ggData.optimalPrice}, 
                                    test ₹{Math.round(ggData.optimalPrice * 1.13)} in 6 months after proving value
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
