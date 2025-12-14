'use client';

import { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, MessageSquare, User, Zap, Loader2, ChevronDown, ChevronRight, Lightbulb, DollarSign, BarChart3, Target } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { LiveOverviewDashboard } from '@/components/insights/LiveOverviewDashboard';

import { PositioningSection } from '@/components/insights/PositioningSection';
import { LiveActivityFeed } from '@/components/insights/LiveActivityFeed';
import { LiveAnalysisCharts } from '@/components/insights/LiveAnalysisCharts';

import { PricingAnalysisCharts } from '@/components/insights/PricingAnalysisCharts';
import { ConjointAnalysisCharts } from '@/components/insights/ConjointAnalysisCharts';
import { PricingDetailedSection } from '@/components/insights/PricingDetailedSection';
import { ValidationDetailedSection } from '@/components/insights/ValidationDetailedSection';
import { FeatureDetailedSection } from '@/components/insights/FeatureDetailedSection';
import { PricingLiveDashboard } from '@/components/insights/PricingLiveDashboard';
import { ValidationLiveDashboard } from '@/components/insights/ValidationLiveDashboard';
import { PositioningLiveDashboard } from '@/components/insights/PositioningLiveDashboard';

// Placeholder Card for sections waiting for data
function PlaceholderCard({ title, description }: { title: string; description: string }) {
    return (
        <Card className="glass border-0 border-dashed border-white/20">
            <CardContent className="py-8 text-center">
                <Loader2 className="h-8 w-8 mx-auto mb-3 text-white/50 animate-spin" />
                <h4 className="font-semibold text-white mb-1">{title}</h4>
                <p className="text-neutral-300 text-sm max-w-md mx-auto">{description}</p>
            </CardContent>
        </Card>
    );
}

// Detect current phase based on messages
function detectCurrentPhase(messages: any[]): string {
    if (!messages || messages.length === 0) return 'validation';

    const lastMessages = messages.slice(-10);
    const content = lastMessages.map((m: any) => m.content?.toLowerCase() || '').join(' ');

    // Check for pricing-related keywords
    if (content.includes('price') || content.includes('cost') || content.includes('pay') ||
        content.includes('expensive') || content.includes('cheap') || content.includes('$') ||
        content.includes('van westendorp') || content.includes('gabor')) {
        return 'pricing';
    }

    // Check for feature-related keywords
    if (content.includes('feature') || content.includes('lifeboat') || content.includes('priorit') ||
        content.includes('must-have') || content.includes('nice-to-have') || content.includes('kano') ||
        content.includes('bundle') || content.includes('deal-breaker')) {
        return 'features';
    }

    // Check for positioning-related keywords
    if (content.includes('position') || content.includes('brand') || content.includes('competitor') ||
        content.includes('archetype') || content.includes('tagline') || content.includes('differentiat')) {
        return 'positioning';
    }

    // Default to validation
    return 'validation';
}

// Collapsible Dashboard Sections Component
function CollapsibleDashboardSections({
    goal,
    insights,
    messages,
    responses,
    personas,
    currentPhase
}: {
    goal: string;
    insights: any[];
    messages: any[];
    responses: any[];
    personas: any[];
    currentPhase: string;
}) {
    const goalLower = goal.toLowerCase();
    const isAll = goalLower === 'all' || goalLower.includes('all');

    // State for which sections are open
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        validation: currentPhase === 'validation',
        pricing: currentPhase === 'pricing',
        features: currentPhase === 'features',
        positioning: currentPhase === 'positioning'
    });

    // Auto-expand current phase section
    useEffect(() => {
        setOpenSections(prev => ({
            ...prev,
            [currentPhase]: true
        }));
    }, [currentPhase]);

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // If not ALL goal, just show the relevant section without collapsible
    if (!isAll) {
        if (goalLower.includes('pricing') || goalLower.includes('price')) {
            // Use the new live pricing dashboard
            return <PricingLiveDashboard session={{ responses, messages, project: { personas }, status: 'running', insights }} goal={goal} />;
        }
        if (goalLower.includes('validat') || goalLower.includes('idea') || goalLower.includes('validate')) {
            // Use the new live validation dashboard
            return <ValidationLiveDashboard session={{ responses, messages, project: { personas }, status: 'running', insights }} goal={goal} />;
        }
        if (goalLower.includes('feature') || goalLower.includes('priorit') || goalLower.includes('conjoint')) {
            return <FeatureDetailedSection insights={insights} />;
        }
        if (goalLower.includes('position') || goalLower.includes('market') || goalLower.includes('brand')) {
            return <PositioningLiveDashboard session={{ responses, messages, project: { personas }, status: 'running', insights }} goal={goal} />;
        }
        return <ValidationLiveDashboard session={{ responses, messages, project: { personas }, status: 'running', insights }} goal={goal} />;
    }

    // ALL goal - show collapsible sections with charts included
    // Use slate/gray theme colors
    const sections = [
        {
            id: 'validation',
            title: 'Idea Validation Dashboard',
            icon: <Lightbulb className="h-5 w-5" />,
            color: 'bg-blue-600/20 text-blue-100 border-blue-500/30',
            component: (
                <ValidationLiveDashboard
                    session={{ responses, messages, project: { personas }, status: currentPhase === 'validation' ? 'running' : 'completed', insights }}
                    goal="validation"
                />
            )
        },
        {
            id: 'pricing',
            title: 'Pricing Strategy Dashboard',
            icon: <DollarSign className="h-5 w-5" />,
            color: 'bg-emerald-600/20 text-emerald-100 border-emerald-500/30',
            component: (
                <PricingLiveDashboard
                    session={{ responses, messages, project: { personas }, status: currentPhase === 'pricing' ? 'running' : 'completed', insights }}
                    goal="pricing"
                />
            )
        },
        {
            id: 'features',
            title: 'Feature Prioritization Dashboard',
            icon: <BarChart3 className="h-5 w-5" />,
            color: 'bg-purple-600/20 text-purple-100 border-purple-500/30',
            component: (
                <div className="space-y-6">
                    <FeatureDetailedSection insights={insights} />
                    {!insights.find((i: any) => i.type === 'conjoint_kano' || i.type === 'conjoint_report') && (
                        <PlaceholderCard title="Feature Analysis" description="Feature prioritization, Kano model, and MVP recommendations will appear here when feature questions are asked." />
                    )}
                </div>
            )
        },
        {
            id: 'positioning',
            title: 'Positioning Strategy Dashboard',
            icon: <Target className="h-5 w-5" />,
            color: 'bg-pink-600/20 text-pink-100 border-pink-500/30',
            component: (
                <PositioningLiveDashboard
                    session={{ responses, messages, project: { personas }, status: currentPhase === 'positioning' ? 'running' : 'completed', insights }}
                    goal="positioning"
                />
            )
        }
    ];

    return (
        <div className="space-y-4">
            {sections.map((section) => (
                <Collapsible
                    key={section.id}
                    open={openSections[section.id]}
                    onOpenChange={() => toggleSection(section.id)}
                >
                    <Card className={`glass border-0 ${currentPhase === section.id ? 'ring-1 ring-white/20' : ''}`}>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${section.color} text-white`}>
                                            {section.icon}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {section.title}
                                                {currentPhase === section.id && (
                                                    <Badge variant="secondary" className="text-xs animate-pulse">
                                                        Live
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {openSections[section.id] ? (
                                            <ChevronDown className="h-5 w-5 text-slate-500" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-slate-500" />
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="pt-0">
                                {section.component}
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>
            ))}
        </div>
    );
}

export function ResultsView({ session }: { session: any }) {
    const printRef = useRef<HTMLDivElement>(null);
    const [currentSession, setCurrentSession] = useState(session);
    const [exporting, setExporting] = useState(false);
    const [dateStr, setDateStr] = useState('');

    // Fix hydration error by setting date only after mount
    useEffect(() => {
        setDateStr(new Date().toLocaleDateString());
    }, []);

    // Polling Logic - Fetch fresh data every 1.5 seconds for live updates
    useEffect(() => {
        if (currentSession.status !== 'running') return;

        const interval = setInterval(async () => {
            try {
                // Use no-store and timestamp to ensure we get fresh data every poll
                const res = await fetch(`/api/sessions/${currentSession.id}?t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                if (res.ok) {
                    const updated = await res.json();
                    // Merge updated data while preserving project if not returned
                    setCurrentSession((prev: any) => ({
                        ...prev,
                        ...updated,
                        project: updated.project || prev.project,
                        responses: updated.responses || prev.responses || [],
                        messages: updated.messages || prev.messages || [],
                        insights: updated.insights || prev.insights || []
                    }));
                    // Stop polling if completed/failed
                    if (updated.status !== 'running') {
                        clearInterval(interval);
                        // Small delay before reload to show final state
                        setTimeout(() => window.location.reload(), 1000);
                    }
                }
            } catch (e) {
                console.error("Polling failed", e);
            }
        }, 1500); // Poll every 1.5 seconds for faster live updates

        return () => clearInterval(interval);
    }, [currentSession.id, currentSession.status]);

    if (!currentSession) return null;

    // Extract Insights
    const pricingVW = currentSession.insights.find((i: any) => i.type === 'pricing_vw');
    const pricingGG = currentSession.insights.find((i: any) => i.type === 'pricing_gg');
    const pricingReport = currentSession.insights.find((i: any) => i.type === 'pricing_report');
    const transcriptSummary = currentSession.insights.find((i: any) => i.type === 'transcript_summary');
    const conjointReport = currentSession.insights.find((i: any) => i.type === 'conjoint_report');
    const concernsInsight = currentSession.insights.find((i: any) => i.type === 'concerns_barriers');

    // Fallback for legacy "report" type
    const legacyReport = currentSession.insights.find((i: any) => i.type === 'report');
    const finalReport = pricingReport ? pricingReport.content : (conjointReport ? conjointReport.content : (legacyReport ? legacyReport.content : null));

    const vwContent = pricingVW ? JSON.parse(pricingVW.content) : null;
    const ggContent = pricingGG ? JSON.parse(pricingGG.content) : null;
    const transcriptContent = transcriptSummary ? JSON.parse(transcriptSummary.content) : null;
    const concernsContent = concernsInsight ? JSON.parse(concernsInsight.content) : null;

    // Strip all markdown/formatting from text to make it look natural
    const stripFormatting = (text: string): string => {
        if (!text) return '';
        return text
            // Remove bold/italic markers
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/__([^_]+)__/g, '$1')
            .replace(/_([^_]+)_/g, '$1')
            // Remove section headers like "Direct Answer:" or "Here is the reality:"
            .replace(/\*\*[^*]+:\*\*/g, '')
            .replace(/^[A-Z][^:]{0,30}:\s*/gm, '')
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
    };

    // Helper to clean up JSON artifacts from legacy transcripts
    const cleanText = (text: string) => {
        if (!text) return "";

        // Strategy: Look for "reasoning" field specifically.
        const reasoningRegex = /reasoning:\s*(?:["']([^"']+)["']|([^,}]+))/i;
        const match = text.match(reasoningRegex);

        if (match) {
            const reasoning = (match[1] || match[2]).trim();
            // If the text looks like a JSON blob or code artifact, replace the whole blob with the reasoning
            if (text.includes('({') || text.trim().startsWith('{')) {
                // Try to preserve the prefix if it exists (e.g. "- At $1: YES ")
                const prefixMatch = text.match(/^(.*?)(\({|{)/);
                if (prefixMatch) {
                    return stripFormatting(prefixMatch[1] + reasoning);
                }
                return stripFormatting(reasoning);
            }
        }

        // Fallback: If we see a JSON block but couldn't extract reasoning, try to parse it
        const jsonRegex = /({[\s\S]*?})/;
        const jsonMatch = text.match(jsonRegex);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[1]);
                const replacement = parsed.reasoning || parsed.answer || "";
                return stripFormatting(text.replace(jsonMatch[1], replacement).trim());
            } catch (e) {
                return stripFormatting(text.replace(jsonMatch[1], jsonMatch[1].replace(/[{}"']/g, '')).trim());
            }
        }

        return stripFormatting(text);
    };

    // Clean message content for display
    const cleanMessageContent = (content: string): string => {
        if (!content) return '';

        // Try to parse JSON and extract readable content
        if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
            try {
                const parsed = JSON.parse(content);
                if (parsed.answer) return stripFormatting(parsed.answer);
                if (parsed.reasoning) return stripFormatting(parsed.reasoning);
                if (parsed.decision) return stripFormatting(`${parsed.decision}${parsed.reasoning ? ': ' + parsed.reasoning : ''}`);
            } catch {
                // Not valid JSON, continue
            }
        }

        return stripFormatting(content);
    };

    // Parse Transcript for UI
    const parseTranscript = (text: string) => {
        if (!text) return [];
        const sections = text.split('###').filter(s => s.trim().length > 0);
        const parsedSections: any[] = [];

        sections.forEach(section => {
            const lines = section.trim().split('\n');
            const title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();

            if (title.includes('Van Westendorp')) {
                const entries = content.split('---').map(e => e.trim()).filter(e => e.length > 0);
                const conversations = entries.map(entry => {
                    const nameMatch = entry.match(/\*\*(.*?)\*\*\s*\((.*?)\):/);
                    const name = nameMatch ? nameMatch[1] : 'Participant';
                    const details = nameMatch ? nameMatch[2] : '';
                    let body = entry.replace(/\*\*(.*?)\*\*\s*\((.*?)\):/, '').trim();
                    body = cleanText(body);

                    const pricePoints: any = {};
                    const priceLines = body.match(/- (.*?): \$(.*?)$/gm);
                    if (priceLines) {
                        priceLines.forEach(line => {
                            const [label, val] = line.replace('- ', '').split(': $');
                            pricePoints[label.trim()] = val.trim();
                        });
                        body = body.replace(/- (.*?): \$(.*?)$/gm, '').trim();
                    }
                    return { type: 'vw', name, details, body, pricePoints };
                });
                parsedSections.push({ title, conversations });
            } else if (title.includes('Gabor-Granger')) {
                const chunks = content.split(/\n\n(?=\*\*.*?\*\* Session:)/);
                const conversations = chunks.map(chunk => {
                    const nameMatch = chunk.match(/\*\*(.*?)\*\*\s*Session:/);
                    const name = nameMatch ? nameMatch[1] : 'Participant';
                    let body = chunk.replace(/\*\*(.*?)\*\*\s*Session:/, '').trim();
                    body = body.split('\n').map(line => cleanText(line)).join('\n');
                    const wtpMatch = body.match(/-> Max WTP: \$(.*)/);
                    const maxWTP = wtpMatch ? wtpMatch[1] : null;
                    return { type: 'gg', name, body, maxWTP };
                });
                parsedSections.push({ title, conversations });
            }
        });
        return parsedSections;
    };

    const handleDownloadPDF = async () => {
        const goal = (currentSession.project?.researchGoal || currentSession.project?.details?.researchGoal || 'all').toLowerCase();

        // Always use AI report generation - it's better than screenshot
        // Covers: feature, pricing, validation, idea, all, and any other goal
        const isAiReportGoal = true; // Always use AI-generated HTML report

        if (isAiReportGoal) {
            // Ask for popup permission first
            const userConfirmed = window.confirm(
                'This will generate a professional PDF report in a new window.\n\n' +
                'Please ensure popups are allowed for this site.\n\n' +
                'Click OK to continue.'
            );

            if (!userConfirmed) {
                return;
            }

            // Open window immediately to bypass popup blockers
            const reportWindow = window.open('', '_blank');
            if (!reportWindow) {
                alert('Popup was blocked!\n\nPlease allow popups for this site:\n1. Click the popup blocked icon in your browser address bar\n2. Select "Always allow popups from this site"\n3. Try again');
                return;
            }

            reportWindow.document.write(`
                <html>
                <head>
                    <title>Generating Report...</title>
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
                    <style>
                        body { 
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            height: 100vh; 
                            margin: 0;
                            background: linear-gradient(to bottom, #AECFEF, #E4F0F6, #FFF8E7);
                            color: #262626;
                        }
                        .loader-container {
                            text-align: center;
                            background: rgba(255, 255, 255, 0.85);
                            backdrop-filter: blur(10px);
                            padding: 50px 70px;
                            border-radius: 16px;
                            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                            border: 1px solid rgba(255,255,255,0.5);
                        }
                        .spinner {
                            width: 50px;
                            height: 50px;
                            border: 3px solid #E4F0F6;
                            border-top: 3px solid #262626;
                            border-radius: 50%;
                            animation: spin 0.8s linear infinite;
                            margin: 0 auto 24px;
                        }
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        h2 { 
                            color: #262626; 
                            margin: 0 0 12px; 
                            font-size: 22px; 
                            font-weight: 600;
                            letter-spacing: -0.02em;
                        }
                        p { 
                            color: #525252; 
                            margin: 0; 
                            font-size: 14px;
                            font-weight: 500;
                        }
                        .subtext {
                            margin-top: 8px;
                            font-size: 13px;
                            color: #737373;
                            font-weight: 400;
                        }
                    </style>
                </head>
                <body>
                    <div class="loader-container">
                        <div class="spinner"></div>
                        <h2>Generating Your Report</h2>
                        <p>AI is analyzing your research data...</p>
                        <p class="subtext">This may take up to 30 seconds</p>
                    </div>
                </body>
                </html>
            `);

            setExporting(true);
            try {
                const res = await fetch('/api/reports/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: currentSession.id })
                });

                if (!res.ok) throw new Error('Failed to generate report');

                const { html } = await res.json();

                // Populate the window
                reportWindow.document.open();
                reportWindow.document.write(html);
                reportWindow.document.close();

            } catch (error) {
                console.error('Export failed:', error);
                reportWindow.document.body.innerHTML = '<h2 style="color: red; font-family: sans-serif; padding: 20px;">Failed to generate report. Please try again.</h2>';
                alert('Failed to generate report. Please try again.');
            } finally {
                setExporting(false);
            }
            return;
        }

        // Default: Screenshot export for other types
        if (!printRef.current) return;
        setExporting(true);

        // PRE-FLIGHT SANITIZATION: Inject safe styles into the REAL DOM
        const safeStyleId = 'pdf-safe-styles';
        const existingStyle = document.getElementById(safeStyleId);
        if (existingStyle) existingStyle.remove();

        const styleEl = document.createElement('style');
        styleEl.id = safeStyleId;
        styleEl.textContent = `
            /* Force everything to use safe hex colors */
            * {
                color: #0a0a0a !important;
                background-color: transparent !important;
                border-color: #e5e5e5 !important;
                text-shadow: none !important;
                box-shadow: none !important;
            }
            body, html {
                background-color: #ffffff !important;
                color: #0a0a0a !important;
            }
            [class*="bg-primary"] { background-color: #f5f5f5 !important; }
            [class*="bg-orange"] { background-color: #fff7ed !important; }
            [class*="bg-purple"] { background-color: #faf5ff !important; }
            [class*="bg-muted"] { background-color: #f5f5f5 !important; }
            [class*="bg-background"] { background-color: #ffffff !important; }
            [class*="text-primary"] { color: #171717 !important; }
            [class*="text-orange-500"] { color: #f97316 !important; }
            [class*="text-purple-500"] { color: #a855f7 !important; }
            [class*="text-muted-foreground"] { color: #737373 !important; }
            [class*="border-purple"] { border-color: #c4b5fd !important; }
            .border { border-color: #e5e5e5 !important; }
            svg { color: currentColor !important; fill: currentColor !important; }
        `;
        document.head.appendChild(styleEl);

        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (!printRef.current) return;
            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const stylesheets = clonedDoc.querySelectorAll('link[rel="stylesheet"], style:not(#' + safeStyleId + ')');
                    stylesheets.forEach(sheet => sheet.remove());
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Focus_Group_Report_${session.project?.name || 'Session'}.pdf`);
        } catch (error) {
            console.error("Export failed", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            const styleToRemove = document.getElementById(safeStyleId);
            if (styleToRemove) styleToRemove.remove();
            setExporting(false);
        }
    };

    const getMessageType = (question: string) => {
        if (question.includes("Reaction to:")) return 'reaction';
        if (question.includes("Follow-up:")) return 'follow-up';
        return 'standard';
    };

    // --- Live Transcript Logic ---
    const messages = currentSession.messages || [];
    // Ensure chronological order
    const sortedMessages = [...messages].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Find active question and pending users
    const lastModeratorMsg = [...sortedMessages].reverse().find((m: any) => m.sender === 'Moderator');
    const activeQuestion = lastModeratorMsg ? lastModeratorMsg.content : "Waiting for moderator...";

    // --- Render ---
    return (
        <div className="space-y-6" ref={printRef}>
            {/* Header */}
            <div className="flex justify-between items-start pt-2">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-wide text-white">{currentSession.project?.name || 'Session Results'}</h2>
                    <div className="flex items-center gap-3 mt-3 text-neutral-300">
                        <Badge variant={currentSession.status === 'completed' ? 'default' : 'secondary'} className="bg-white/10 text-white hover:bg-white/20 border-0 px-3 py-1">
                            {currentSession.status === 'completed' ? 'Completed' : 'Live Session'}
                        </Badge>
                        <span className="text-neutral-500">•</span>
                        <span className="tracking-wide text-sm font-medium opacity-80">{dateStr}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleDownloadPDF}
                        disabled={exporting}
                        className={`bg-white hover:bg-neutral-200 text-black border-0 font-medium px-6 shadow-lg transition-all duration-500 ${currentSession.status === 'completed' ? 'animate-glow' : ''}`}
                    >
                        {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Export PDF
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full mt-2">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/20 border border-white/5 p-1 h-auto rounded-xl backdrop-blur-sm">
                    <TabsTrigger
                        value="overview"
                        className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm text-white font-medium py-3 rounded-lg transition-all hover:bg-white/5"
                    >
                        Overview & Analysis
                    </TabsTrigger>
                    <TabsTrigger
                        value="transcript"
                        className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm text-white font-medium py-3 rounded-lg transition-all hover:bg-white/5"
                    >
                        Live Transcript
                    </TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-8">
                    {/* 1. Live Overview Dashboard (Always Visible) */}
                    <LiveOverviewDashboard
                        session={currentSession}
                        goal={currentSession.project?.researchGoal || currentSession.project?.details?.researchGoal || 'all'}
                    />

                    {/* 2. Goal-Specific Live Analysis Charts */}
                    {(() => {
                        const goal = (currentSession.project?.researchGoal || currentSession.project?.details?.researchGoal || 'all').toLowerCase();
                        const isAll = goal === 'all' || goal.includes('all');

                        // For ALL goal, charts are included in the collapsible sections below
                        if (isAll) {
                            return null;
                        }

                        // PRICING ONLY - PricingLiveDashboard is shown in CollapsibleDashboardSections
                        if (goal.includes('pricing') || goal.includes('price')) {
                            return null; // Full dashboard shown below
                        }

                        // FEATURES ONLY
                        if (goal.includes('feature') || goal.includes('priorit') || goal.includes('conjoint')) {
                            return <ConjointAnalysisCharts insights={currentSession.insights || []} />;
                        }

                        // VALIDATION ONLY - ValidationLiveDashboard is shown in CollapsibleDashboardSections
                        if (goal.includes('validation') || goal.includes('idea') || goal.includes('validate')) {
                            return null; // Full dashboard shown below
                        }

                        // MARKETING/POSITIONING ONLY
                        if (goal.includes('position') || goal.includes('market') || goal.includes('brand')) {
                            return <LiveAnalysisCharts messages={currentSession.messages || []} />;
                        }

                        // Default fallback
                        return <LiveAnalysisCharts messages={currentSession.messages || []} />;
                    })()}

                    {/* Main Insights - Collapsible Sections for ALL goal */}
                    <CollapsibleDashboardSections
                        goal={currentSession.project?.researchGoal || currentSession.project?.details?.researchGoal || 'all'}
                        insights={currentSession.insights}
                        messages={currentSession.messages || []}
                        responses={currentSession.responses || []}
                        personas={currentSession.project?.personas || []}
                        currentPhase={detectCurrentPhase(currentSession.messages || [])}
                    />

                    {/* Live Session Feed - Full Width */}
                    <LiveActivityFeed
                        messages={currentSession.messages}
                        status={currentSession.status}
                    />
                </TabsContent>

                {/* TRANSCRIPT TAB */}
                <TabsContent value="transcript">
                    <Card className="glass border-0 h-[700px] flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <MessageSquare className="h-5 w-5 text-white" />
                                <span className="font-semibold">Full Transcript</span>
                            </CardTitle>
                            <CardDescription className="text-neutral-300">
                                Complete history of the focus group discussion
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden p-0">
                            <ScrollArea className="h-full p-4">
                                <div className="space-y-4">
                                    {sortedMessages.length === 0 && (
                                        <div className="text-center text-muted-foreground py-10">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 opacity-50" />
                                            <p>Waiting for simulation to start...</p>
                                        </div>
                                    )}

                                    {sortedMessages.map((msg: any) => {
                                        const isModerator = msg.sender === 'Moderator';
                                        const persona = !isModerator && currentSession.project?.personas
                                            ? currentSession.project.personas.find((p: any) => p.name === msg.sender)
                                            : null;

                                        // Try to parse metadata for reasoning
                                        let reasoning = null;
                                        try {
                                            if (msg.metadata) {
                                                const meta = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata;
                                                reasoning = meta.reasoning;
                                            }
                                        } catch (e) { }

                                        return (
                                            <div key={msg.id} className={`flex gap-4 mb-6 ${isModerator ? 'flex-row-reverse' : ''}`}>
                                                {/* Avatar */}
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-lg ${isModerator
                                                    ? 'bg-neutral-900/80 border border-white/20 text-white'
                                                    : 'glass border-0 text-white'
                                                    }`}>
                                                    {isModerator ? (
                                                        <User className="h-5 w-5" />
                                                    ) : (
                                                        msg.sender.substring(0, 2).toUpperCase()
                                                    )}
                                                </div>

                                                {/* Message Content */}
                                                <div className={`flex-1 max-w-[80%] ${isModerator ? 'text-right' : ''}`}>
                                                    {/* Thinking/Reasoning - OUTSIDE the bubble */}
                                                    {reasoning && !isModerator && (
                                                        <div className="mb-2 flex items-start gap-2 text-xs text-neutral-400 italic">
                                                            <div className="shrink-0 mt-0.5">💭</div>
                                                            <span>{reasoning}</span>
                                                        </div>
                                                    )}

                                                    <div className={`flex flex-col ${isModerator ? 'items-end' : 'items-start'}`}>
                                                        {/* Name Label */}
                                                        <div className={`text-xs font-medium mb-1.5 px-1 ${isModerator ? 'text-neutral-400' : 'text-neutral-300'}`}>
                                                            {msg.sender}
                                                            {persona && <span className="font-normal ml-1 opacity-60">- {persona.age}, {persona.occupation}</span>}
                                                        </div>

                                                        {/* Speech Bubble */}
                                                        <div className={`inline-block px-5 py-3 rounded-2xl text-sm shadow-xl backdrop-blur-md border ${isModerator
                                                            ? 'bg-neutral-900/60 border-white/10 text-white rounded-tr-none'
                                                            : 'bg-white/10 border-white/10 text-neutral-100 rounded-tl-none'
                                                            }`}>
                                                            <div className="leading-relaxed whitespace-pre-wrap">
                                                                {isModerator ? msg.content : cleanMessageContent(msg.content)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
