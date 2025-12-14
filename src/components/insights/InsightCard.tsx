import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface InsightCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral';
    className?: string;
}

export function InsightCard({
    title,
    value,
    subtitle,
    icon,
    variant = 'default',
    className
}: InsightCardProps) {
    const variantStyles = {
        default: 'border-slate-200',
        success: 'border-green-200 bg-green-50/50',
        warning: 'border-amber-200 bg-amber-50/50',
        danger: 'border-red-200 bg-red-50/50',
        neutral: 'border-slate-100 bg-slate-50/50'
    };

    return (
        <Card className={cn("shadow-sm transition-all duration-200 hover:shadow-md", variantStyles[variant], className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </CardContent>
        </Card>
    );
}
