import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface PricingSectionProps {
    insights: any[];
}

export function PricingSection({ insights }: PricingSectionProps) {
    const pricingVW = insights.find(i => i.type === 'pricing_vw');
    const pricingGG = insights.find(i => i.type === 'pricing_gg');

    const vwData = pricingVW ? JSON.parse(pricingVW.content) : null;
    const ggData = pricingGG ? JSON.parse(pricingGG.content) : null;

    if (!vwData && !ggData) {
        return (
            <Card className="h-[400px] flex flex-col justify-center items-center text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
                <div className="w-full max-w-md space-y-4 p-8 opacity-50">
                    <div className="flex items-end justify-center gap-2 h-32">
                        <div className="w-8 bg-slate-300 rounded-t-md h-[40%] animate-pulse delay-75"></div>
                        <div className="w-8 bg-slate-300 rounded-t-md h-[70%] animate-pulse delay-150"></div>
                        <div className="w-8 bg-slate-300 rounded-t-md h-[50%] animate-pulse delay-100"></div>
                        <div className="w-8 bg-slate-300 rounded-t-md h-[80%] animate-pulse delay-200"></div>
                        <div className="w-8 bg-slate-300 rounded-t-md h-[60%] animate-pulse delay-300"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-3/4 bg-slate-200 rounded mx-auto animate-pulse"></div>
                        <div className="h-3 w-1/2 bg-slate-200 rounded mx-auto animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mt-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Gathering pricing data...</span>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 p-1 rounded">💰</span>
                    Pricing Research
                </h3>
                {vwData && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Analysis Complete</Badge>}
            </div>

            <Tabs defaultValue="vw" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="vw">Van Westendorp (PSM)</TabsTrigger>
                    <TabsTrigger value="gg">Revenue Optimization (GG)</TabsTrigger>
                </TabsList>

                {/* Van Westendorp View */}
                <TabsContent value="vw" className="space-y-4">
                    {vwData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Optimal Range Card */}
                            <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-blue-600">OPTIMAL PRICING RANGE</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-slate-900">
                                        ${Math.round(vwData.optimalPricePoint)} - ${Math.round(vwData.acceptablePriceRange?.max || 0)}
                                        <span className="text-sm font-normal text-slate-500 ml-1">/month</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-2">
                                        Rationale: Purchase resistance is minimized at ${Math.round(vwData.optimalPricePoint)}.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Thresholds Card */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-500">KEY THRESHOLDS</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Too Cheap (Quality Concern)</span>
                                        <span className="font-mono font-bold text-amber-600">${Math.round(vwData.acceptablePriceRange?.min || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Too Expensive (Rejection)</span>
                                        <span className="font-mono font-bold text-red-600">${Math.round(vwData.acceptablePriceRange?.max || 0)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Visual Curve Representation */}
                            <Card className="md:col-span-2">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Price Sensitivity Curve</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 mt-2">
                                        {vwData.curveData?.map((pt: any, i: number) => (
                                            <div key={i} className="flex items-center text-xs group">
                                                <div className="w-12 font-mono font-bold text-slate-600">${pt.price}</div>
                                                <div className="flex-1 flex h-3 bg-slate-100 rounded-sm overflow-hidden ml-2 relative">
                                                    {/* Cheap Bar (Green) */}
                                                    <div
                                                        className="bg-green-500/80 absolute left-0 h-full transition-all duration-500"
                                                        style={{ width: `${pt.cheap * 100}%` }}
                                                    />
                                                    {/* Expensive Bar (Red) */}
                                                    <div
                                                        className="bg-red-500/80 absolute right-0 h-full transition-all duration-500"
                                                        style={{ width: `${pt.expensive * 100}%` }}
                                                    />
                                                    {/* Intersection Marker */}
                                                    {Math.abs(pt.cheap - pt.expensive) < 0.1 && (
                                                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-600 z-10 transform -translate-x-1/2" />
                                                    )}
                                                </div>
                                                <div className="w-24 text-right text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {Math.round(pt.cheap * 100)}% vs {Math.round(pt.expensive * 100)}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-4 mt-4 text-xs text-slate-500 justify-center">
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Too Cheap</div>
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Too Expensive</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                            Waiting for Van Westendorp results...
                        </div>
                    )}
                </TabsContent>

                {/* Gabor-Granger View */}
                <TabsContent value="gg" className="space-y-4">
                    {ggData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-slate-900 text-white border-slate-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-blue-400">MAX REVENUE PRICE</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold text-white">
                                        ${ggData.gg_revenue_max_price}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                                        <TrendingUp className="h-4 w-4 text-green-400" />
                                        Projected Revenue Score: {Math.round(Math.max(...ggData.gg_optimal_revenue_points.map((p: any) => p.revenue)))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Revenue Curve</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {ggData.gg_optimal_revenue_points?.map((pt: any, i: number) => {
                                            const maxRev = Math.max(...ggData.gg_optimal_revenue_points.map((p: any) => p.revenue));
                                            const width = (pt.revenue / maxRev) * 100;
                                            const isMax = pt.price === ggData.gg_revenue_max_price;

                                            return (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className={`font-mono ${isMax ? 'font-bold text-blue-600' : 'text-slate-600'}`}>${pt.price}</span>
                                                        <span className="text-slate-400">{Math.round(pt.revenue)} pts</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-500 ${isMax ? 'bg-blue-600' : 'bg-slate-400'}`}
                                                            style={{ width: `${width}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                            Waiting for Gabor-Granger results...
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
