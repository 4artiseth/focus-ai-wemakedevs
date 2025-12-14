'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Loader2, User } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface LiveActivityFeedProps {
    messages: any[];
    status: string;
}

// Strip all markdown/formatting from text to make it look natural
function stripFormatting(text: string): string {
    if (!text) return '';
    return text
        // Remove bold/italic markers
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        // Remove section headers like "Direct Answer:" or "Here is the reality:"
        .replace(/\*\*[^*]+:\*\*/g, '')
        .replace(/^[A-Z][^:]+:\s*/gm, '')
        // Remove bullet points and dashes at start of lines
        .replace(/^[\s]*[-•*]\s*/gm, '')
        // Remove em dashes
        .replace(/—/g, ', ')
        // Remove excessive punctuation
        .replace(/\*+/g, '')
        // Clean up multiple spaces/newlines
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Clean up JSON responses to show readable text
function cleanMessageContent(content: string): string {
    if (!content) return '';

    // sanitize content for common LLM JSON errors
    const sanitizedContent = content
        .trim()
        // Fix "\$" which is invalid JSON but common LLM output for "$"
        // Also fix keys that might use single quotes or other invalid escapes
        .replace(/\\([^"\\/bfnrtu])/g, '$1')
        // Remove "Return JSON:" prefix if present
        .replace(/^Return JSON:[\s\S]*?(?={)/i, "");

    // Try to parse JSON and extract readable content
    if (sanitizedContent.startsWith('{') || sanitizedContent.startsWith('[')) {
        try {
            // Attempt standard parse first
            const parsed = JSON.parse(sanitizedContent);
            return extractContentFromParsed(parsed) || stripFormatting(content);
        } catch {
            // Not valid JSON, try regex extraction for "answer" as backup
            // Support multiline strings with [\s\S]
            const answerMatch = sanitizedContent.match(/"answer"\s*:\s*"((?:[^"\\]|\\.|[\r\n])*)"/);
            if (answerMatch && answerMatch[1]) {
                const unescaped = answerMatch[1]
                    .replace(/\\"/g, '"')
                    .replace(/\\n/g, '\n');
                return stripFormatting(unescaped);
            }
        }
    }

    // Fallback: Remove any JSON-like artifacts from text
    const cleaned = content
        .replace(/\{[\s\S]*\}/g, '') // Matches multiline JSON object
        .replace(/\[[\s\S]*\]/g, '')
        .replace(/Return JSON:.*/gi, '')
        .trim();

    return stripFormatting(cleaned || content.substring(0, 200));
}

function extractContentFromParsed(parsed: any): string | null {
    // Handle ranking arrays
    if (parsed.ranking && Array.isArray(parsed.ranking)) {
        return `My ranking: ${parsed.ranking.slice(0, 3).join(', ')}${parsed.ranking.length > 3 ? '...' : ''}`;
    }
    // Handle saved/lifeboat
    if (parsed.saved && Array.isArray(parsed.saved)) {
        return `I'd save: ${parsed.saved.join(', ')}`;
    }
    // Handle answer field
    if (parsed.answer) return stripFormatting(parsed.answer);
    // Handle reasoning
    if (parsed.reasoning) return stripFormatting(parsed.reasoning);
    // Handle decision
    if (parsed.decision) {
        return stripFormatting(`${parsed.decision}${parsed.reasoning ? ': ' + parsed.reasoning : ''}`);
    }
    return null;
}

export function LiveActivityFeed({ messages, status }: LiveActivityFeedProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isRunning = status === 'running';

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    // Get last 15 messages
    const recentMessages = [...(messages || [])]
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(-15);

    // Count stats
    const personaResponses = recentMessages.filter(m => m.sender !== 'Moderator').length;
    const moderatorQuestions = recentMessages.filter(m => m.sender === 'Moderator').length;

    return (
        <Card className="glass border-0">
            <CardHeader className="pb-3 border-b border-white/10">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-medium flex items-center gap-2 text-white">
                        <MessageSquare className="h-4 w-4 text-white/50" />
                        Live Session Feed
                    </CardTitle>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-3 text-xs text-neutral-400">
                            <span>{moderatorQuestions} questions</span>
                            <span>•</span>
                            <span>{personaResponses} responses</span>
                        </div>
                        {isRunning && (
                            <Badge variant="outline" className="text-xs text-neutral-300 border-white/20 bg-white/5">
                                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />
                                Live
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
                <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
                    <div className="space-y-3">
                        {recentMessages.length === 0 && (
                            <div className="text-center text-neutral-500 py-10 text-sm">
                                <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                <p className="font-medium">Waiting for discussion to start...</p>
                            </div>
                        )}

                        {recentMessages.map((msg: any) => {
                            const isModerator = msg.sender === 'Moderator';
                            const cleanContent = isModerator
                                ? msg.content?.replace(/Return JSON:.*/gi, '').trim()
                                : cleanMessageContent(msg.content);

                            // Try to extract reasoning/thinking from metadata
                            let reasoning = null;
                            try {
                                if (msg.metadata) {
                                    const meta = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata;
                                    reasoning = meta.reasoning;
                                }
                            } catch { }

                            return (
                                <div key={msg.id} className={`flex gap-3 mb-4 ${isModerator ? 'flex-row-reverse' : ''}`}>
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-md ${isModerator
                                        ? 'bg-neutral-900/80 border border-white/20 text-white'
                                        : 'bg-white/10 text-white border border-white/10'
                                        }`}>
                                        {isModerator ? (
                                            <User className="h-4 w-4" />
                                        ) : (
                                            msg.sender.substring(0, 2).toUpperCase()
                                        )}
                                    </div>

                                    <div className={`flex-1 max-w-[85%] ${isModerator ? 'text-right' : ''}`}>
                                        {/* Thinking/Reasoning - OUTSIDE the bubble */}
                                        {reasoning && !isModerator && (
                                            <div className="mb-1.5 flex items-start gap-1.5 text-[10px] text-neutral-400 italic">
                                                <div className="shrink-0 mt-0.5">💭</div>
                                                <span>{reasoning.length > 120 ? reasoning.substring(0, 120) + '...' : reasoning}</span>
                                            </div>
                                        )}

                                        <div className={`flex flex-col ${isModerator ? 'items-end' : 'items-start'}`}>
                                            {/* Name Label */}
                                            <div className={`text-[10px] font-medium mb-1 px-1 ${isModerator ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                                {msg.sender}
                                            </div>

                                            {/* Main message */}
                                            <div className={`inline-block px-4 py-2.5 rounded-xl text-sm shadow-sm border backdrop-blur-sm ${isModerator
                                                ? 'bg-neutral-900/60 border-white/10 text-white rounded-tr-none'
                                                : 'bg-white/5 border-white/10 text-neutral-200 rounded-tl-none'
                                                }`}>
                                                <div className="leading-relaxed whitespace-pre-wrap">
                                                    {cleanContent?.length > 250
                                                        ? cleanContent.substring(0, 250) + '...'
                                                        : cleanContent}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {isRunning && (
                            <div className="flex gap-2 items-center pl-11">
                                <div className="flex gap-1.5 items-center text-xs text-neutral-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="ml-1">Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
