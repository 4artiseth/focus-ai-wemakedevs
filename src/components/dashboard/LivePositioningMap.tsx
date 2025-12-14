import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LivePositioningMapProps {
    messages: any[];
}

export function LivePositioningMap({ messages }: LivePositioningMapProps) {
    if (!messages) return null;

    // Filter for Positioning Map responses (look for x and y in metadata)
    const mapResponses = messages.filter(r => {
        try {
            const meta = JSON.parse(r.metadata || '{}');
            return typeof meta.x === 'number' && typeof meta.y === 'number';
        } catch (e) {
            return false;
        }
    });

    if (mapResponses.length === 0) return null;

    // Calculate average
    let totalX = 0;
    let totalY = 0;
    const points = mapResponses.map(r => {
        const meta = JSON.parse(r.metadata);
        totalX += meta.x;
        totalY += meta.y;
        return { x: meta.x, y: meta.y, name: r.persona?.name || 'Unknown' };
    });

    const avgX = totalX / points.length;
    const avgY = totalY / points.length;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Live Perceptual Map</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative w-full aspect-square border rounded-lg bg-slate-50 dark:bg-slate-900 p-4">
                    {/* Axis Labels */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">Advanced (10)</div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">Simple (0)</div>
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground -rotate-90">Budget (0)</div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground rotate-90">Premium (10)</div>

                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-px bg-slate-300 dark:bg-slate-700"></div>
                        <div className="h-full w-px bg-slate-300 dark:bg-slate-700 absolute"></div>
                    </div>

                    {/* Points */}
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        {points.map((p, i) => (
                            <circle
                                key={i}
                                cx={p.x * 10} // Scale 0-10 to 0-100
                                cy={100 - (p.y * 10)} // Invert Y (0 is bottom)
                                r="2"
                                className="fill-blue-500 opacity-60"
                            >
                                <title>{p.name}: ({p.x}, {p.y})</title>
                            </circle>
                        ))}

                        {/* Average Point */}
                        <circle
                            cx={avgX * 10}
                            cy={100 - (avgY * 10)}
                            r="4"
                            className="fill-red-600 stroke-white stroke-2"
                        />
                    </svg>
                </div>
                <div className="mt-2 text-center text-sm text-muted-foreground">
                    Avg: ({avgX.toFixed(1)}, {avgY.toFixed(1)})
                </div>
            </CardContent>
        </Card>
    );
}
