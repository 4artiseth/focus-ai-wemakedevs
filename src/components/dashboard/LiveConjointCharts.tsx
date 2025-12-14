import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LiveConjointChartsProps {
    vwData?: any;
    ggData?: any;
    conjointData?: any;
}

export function LiveConjointCharts({ vwData, ggData, conjointData }: LiveConjointChartsProps) {
    if (!vwData && !ggData && !conjointData) return null;

    return (
        <div className="space-y-6">
            {/* PRICING ANALYSIS (Van Westendorp & Gabor-Granger) */}
            {(vwData || ggData) && (
                <Tabs defaultValue="vw" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="vw">Price Sensitivity (VW)</TabsTrigger>
                        <TabsTrigger value="gg">Revenue Optimization (GG)</TabsTrigger>
                    </TabsList>

                    {/* Van Westendorp View */}
                    <TabsContent value="vw" className="space-y-4">
                        {vwData ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Optimal Price Point (OPP)</CardTitle>
                                        <CardDescription>Where purchase resistance is lowest</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">
                                            ${Math.round(vwData.optimalPricePoint)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Acceptable Price Range</CardTitle>
                                        <CardDescription>From Cheap to Expensive</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            ${Math.round(vwData.acceptablePriceRange?.min || 0)} - ${Math.round(vwData.acceptablePriceRange?.max || 0)}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Simple Text Visualization of Curve Data */}
                                <Card className="md:col-span-2">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Price Sensitivity Curve Data</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {vwData.curveData?.map((pt: any, i: number) => (
                                                <div key={i} className="flex items-center text-xs">
                                                    <div className="w-12 font-bold">${pt.price}</div>
                                                    <div className="flex-1 flex h-2 bg-secondary rounded-full overflow-hidden ml-2">
                                                        <div className="bg-green-500" style={{ width: `${pt.cheap * 100}%` }} title="Cheap" />
                                                        <div className="bg-red-500" style={{ width: `${pt.expensive * 100}%` }} title="Expensive" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground justify-end">
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Cheap</div>
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Expensive</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="p-4 text-center text-muted-foreground">No Van Westendorp data available yet.</div>
                        )}
                    </TabsContent>

                    {/* Gabor-Granger View */}
                    <TabsContent value="gg" className="space-y-4">
                        {ggData ? (
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Max Revenue Price</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-blue-600">
                                            ${ggData.gg_revenue_max_price}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Revenue Projection</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {ggData.gg_optimal_revenue_points?.map((pt: any, i: number) => {
                                                const maxRev = Math.max(...ggData.gg_optimal_revenue_points.map((p: any) => p.revenue));
                                                const width = (pt.revenue / maxRev) * 100;
                                                return (
                                                    <div key={i} className="space-y-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="font-bold">${pt.price}</span>
                                                            <span className="text-muted-foreground">${Math.round(pt.revenue).toLocaleString()} / 1k users</span>
                                                        </div>
                                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${width}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="p-4 text-center text-muted-foreground">No Gabor-Granger data available yet.</div>
                        )}
                    </TabsContent>
                </Tabs>
            )}

            {/* CONJOINT ANALYSIS */}
            {conjointData && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Feature Importance (Conjoint)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* 
                           Handle different conjoint data structures. 
                           If it's a simple ranking list: 
                        */}
                        {conjointData.ranking ? (
                            <div className="space-y-2">
                                {conjointData.ranking.map((feature: string, i: number) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                            {i + 1}
                                        </div>
                                        <span className="text-sm font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                {JSON.stringify(conjointData, null, 2)}
                            </pre>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
