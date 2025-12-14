import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, PieChart, Activity } from 'lucide-react';

interface LiveAnalysisChartsProps {
    messages: any[];
}

export function LiveAnalysisCharts({ messages }: LiveAnalysisChartsProps) {
    // 1. Sentiment Analysis (Heuristic)
    const positiveWords = ['love', 'great', 'good', 'like', 'amazing', 'useful', 'easy', 'best', 'happy', 'agree', 'yes', 'cool', 'nice'];
    const negativeWords = ['hate', 'bad', 'hard', 'difficult', 'expensive', 'confusing', 'slow', 'boring', 'disagree', 'no', 'worst', 'issue', 'problem'];

    const sentimentData = messages.reduce((acc: any, msg: any) => {
        if (msg.sender === 'Moderator') return acc;

        const text = msg.content.toLowerCase();
        let score = 0;
        positiveWords.forEach(w => { if (text.includes(w)) score++; });
        negativeWords.forEach(w => { if (text.includes(w)) score--; });

        if (score > 0) acc.positive++;
        else if (score < 0) acc.negative++;
        else acc.neutral++;

        return acc;
    }, { positive: 0, neutral: 0, negative: 0 });

    const total = sentimentData.positive + sentimentData.neutral + sentimentData.negative || 1;
    const posPct = (sentimentData.positive / total) * 100;
    const negPct = (sentimentData.negative / total) * 100;
    const neuPct = (sentimentData.neutral / total) * 100;

    // 2. Topic Frequency (Heuristic)
    const topics = [
        { key: 'price', label: 'Pricing', keywords: ['price', 'cost', 'expensive', 'cheap', 'money', 'pay', 'subscription'] },
        { key: 'feature', label: 'Features', keywords: ['feature', 'function', 'app', 'tool', 'capability', 'add', 'missing'] },
        { key: 'ux', label: 'Usability', keywords: ['easy', 'hard', 'ui', 'design', 'look', 'feel', 'confusing', 'simple'] },
        { key: 'trust', label: 'Trust', keywords: ['trust', 'secure', 'safe', 'privacy', 'data', 'reliable', 'legit'] }
    ];

    const topicCounts = topics.map(topic => {
        const count = messages.filter(m =>
            m.sender !== 'Moderator' &&
            topic.keywords.some(k => m.content.toLowerCase().includes(k))
        ).length;
        return { ...topic, count };
    }).sort((a, b) => b.count - a.count);

    const maxTopicCount = Math.max(...topicCounts.map(t => t.count)) || 1;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Sentiment Chart */}
            <Card className="glass border-0">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                        <PieChart className="h-4 w-4 text-blue-400" />
                        Live Sentiment Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden flex">
                            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${posPct}%` }} />
                            <div className="bg-neutral-500 h-full transition-all duration-500" style={{ width: `${neuPct}%` }} />
                            <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${negPct}%` }} />
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-400">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            Positive ({Math.round(posPct)}%)
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
                            Neutral ({Math.round(neuPct)}%)
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                            Negative ({Math.round(negPct)}%)
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Topic Frequency Chart */}
            <Card className="glass border-0">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                        <BarChart3 className="h-4 w-4 text-indigo-400" />
                        Discussion Topics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {topicCounts.map((topic) => (
                            <div key={topic.key} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="font-medium text-neutral-300">{topic.label}</span>
                                    <span className="text-neutral-500">{topic.count} mentions</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                        style={{ width: `${(topic.count / maxTopicCount) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
