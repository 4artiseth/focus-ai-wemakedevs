'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AudioInput } from '@/components/ui/audio-input';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Search, Loader2, Mic } from 'lucide-react';

// --- Validation Schemas ---

const formSchema = z.object({
    // Tier 1: Required
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    problem: z.string().min(10, "Problem description must be at least 10 characters"),
    category: z.string().min(1, "Category is required"),
    audience: z.string().min(10, "Audience description must be at least 10 characters"),
    researchGoal: z.string().min(1, "Research goal is required"),
    panelSize: z.number().min(5).max(15),

    // Tier 2: Recommended
    customQuestions: z.string().optional(), // Newline separated
    priceExpected: z.number().optional(),
    priceMin: z.number().optional(),
    priceMax: z.number().optional(),
    pricingModel: z.string().optional(),

    featuresCore: z.string().optional(),
    featuresPremium: z.string().optional(),
    featuresFuture: z.string().optional(),

    // Tier 3: Advanced
    competitors: z.string().optional(), // Newline separated
    personaConstraints: z.string().optional(),
    toneFormality: z.number().optional(),
    toneSkepticism: z.number().optional(),
    analysisDepth: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ProjectForm() {
    const [step, setStep] = useState(1);
    const [searchingCompetitors, setSearchingCompetitors] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            problem: "",
            category: "",
            audience: "",
            researchGoal: "",
            panelSize: 8,
            toneFormality: 50,
            toneSkepticism: 50,
            analysisDepth: "standard",
            customQuestions: "",
        }
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error("Failed to create project");

            const project = await res.json();
            router.push(`/dashboard/projects/${project.id}`);
        } catch (error) {
            console.error(error);
            alert("Failed to create project");
            setIsSubmitting(false);
        }
    };

    const nextStep = async () => {
        let fieldsToValidate: (keyof FormValues)[] = [];
        if (step === 1) fieldsToValidate = ['name', 'description', 'problem', 'category', 'audience', 'researchGoal'];

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) setStep(step + 1);
    };

    const handleCompetitorSearch = async () => {
        const productName = form.watch('name');
        if (!productName) {
            alert('Please enter a product name first');
            return;
        }

        setSearchingCompetitors(true);

        try {
            // Extract all context from the form
            const category = form.watch('category');
            const description = form.watch('description');
            const coreFeatures = form.watch('featuresCore');
            const premiumFeatures = form.watch('featuresPremium');

            // Build additional features array
            const features: string[] = [];
            if (premiumFeatures) features.push(...premiumFeatures.split(',').map(f => f.trim()));

            const response = await fetch('/api/competitor-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName,
                    category,
                    description,
                    coreFeatures,
                    features: features.slice(0, 5) // Top 5 premium features
                })
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const result = await response.json();

            // Parse the result and format it for the textarea
            const competitorText = parseCompetitorData(result.data);
            form.setValue('competitors', competitorText);

        } catch (error) {
            console.error('Competitor search error:', error);
            alert('Failed to search competitors. Please try again.');
        } finally {
            setSearchingCompetitors(false);
        }
    };

    const parseCompetitorData = (data: string): string => {
        const lines: string[] = [];

        // Split by competitor sections (## 1., ## 2., etc.)
        const sections = data.split(/##\s*\d+\.\s*/);

        sections.forEach((section, index) => {
            if (index === 0 || !section.trim()) return; // Skip header

            const sectionLines = section.split('\n');
            let competitorName = sectionLines[0].trim();

            // Extract pricing information
            const pricingInfo: string[] = [];
            let billingCycle = '';

            // Look for pricing patterns
            const freeTier = section.match(/free|Free Plan|Free Tier/i);
            const monthlyPrices = section.match(/\$[\d,]+(?:\.[\d]{2})?\/(?:user\/)?(?:month|mo)/gi);
            const annualPrices = section.match(/\$[\d,]+(?:\.[\d]{2})?\/(?:user\/)?(?:year|yr|annually)/gi);
            const oneTimePrices = section.match(/\$[\d,]+(?:\.[\d]{2})?\s*(?:one-time|one time|lifetime)/gi);

            // Determine billing cycle
            if (monthlyPrices && monthlyPrices.length > 0) {
                billingCycle = 'Monthly';
                pricingInfo.push(monthlyPrices[0]);
            } else if (annualPrices && annualPrices.length > 0) {
                billingCycle = 'Annual';
                pricingInfo.push(annualPrices[0]);
            } else if (oneTimePrices && oneTimePrices.length > 0) {
                billingCycle = 'One-time';
                pricingInfo.push(oneTimePrices[0]);
            } else if (freeTier) {
                pricingInfo.push('Free');
            }

            // Extract key features (look for bullet points or feature lists)
            const features: string[] = [];
            const featureMatches = section.match(/[-•]\s*([^\n]+)/g);
            if (featureMatches) {
                featureMatches.slice(0, 3).forEach(f => {
                    const cleaned = f.replace(/[-•]\s*/, '').trim();
                    if (cleaned.length > 5 && cleaned.length < 50) {
                        features.push(cleaned);
                    }
                });
            }

            // Format the output
            if (pricingInfo.length > 0) {
                const priceStr = pricingInfo[0];
                const cycleStr = billingCycle ? ` (${billingCycle})` : '';
                const featureStr = features.length > 0 ? ` | ${features.slice(0, 2).join(', ')}` : '';
                lines.push(`${competitorName} - ${priceStr}${cycleStr}${featureStr}`);
            } else {
                lines.push(competitorName);
            }
        });

        // Fallback: if parsing failed, try simpler extraction
        if (lines.length === 0) {
            const simpleMatches = data.match(/##\s*\d+\.\s*(.+?)(?=\n|$)/g);
            if (simpleMatches) {
                simpleMatches.forEach(match => {
                    const name = match.replace(/##\s*\d+\.\s*/, '').trim();
                    const afterName = data.substring(data.indexOf(match));
                    const priceMatch = afterName.match(/\$[\d,]+(?:\.[\d]{2})?(?:\/(?:user\/)?(?:month|mo|year|yr))?/i);

                    if (priceMatch) {
                        lines.push(`${name} - ${priceMatch[0]}`);
                    } else {
                        lines.push(name);
                    }
                });
            }
        }

        return lines.slice(0, 5).join('\n') || data.substring(0, 300);
    };

    return (
        <div className="max-w-5xl mx-auto p-4">
            <form onSubmit={form.handleSubmit(onSubmit)}>

                {/* Step 1: The Basics */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold text-white tracking-tight">Step 1: The Basics</h2>
                            <p className="text-neutral-400">Core information needed to generate realistic personas.</p>
                        </div>

                        <Card className="glass border-0">
                            <CardContent className="space-y-6 pt-6">
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                        <Mic className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <p className="text-sm text-blue-200">
                                        <span className="font-semibold text-blue-100">Pro tip:</span> Use the "Voice Input" buttons to speak your answers instead of typing!
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <Label>Product Name</Label>
                                        </div>
                                        <AudioInput onTranscript={(text) => form.setValue('name', text)} />
                                    </div>
                                    <Input {...form.register('name')} placeholder="e.g. TaskMaster Pro" />
                                    {form.formState.errors.name && <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <Label>Description</Label>
                                        </div>
                                        <AudioInput onTranscript={(text) => form.setValue('description', text)} />
                                    </div>
                                    <Textarea {...form.register('description')} placeholder="Describe your product in 2-3 sentences..." className="h-24" />
                                    {form.formState.errors.description && <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-white font-semibold">Problem Solved</Label>
                                        <AudioInput onTranscript={(text) => form.setValue('problem', text)} />
                                    </div>
                                    <Textarea {...form.register('problem')} placeholder="What specific problem does this solve? (e.g. 'Teams struggle to track tasks across multiple platforms')" className="h-20" />
                                    {form.formState.errors.problem && <p className="text-red-500 text-sm">{form.formState.errors.problem.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-white font-semibold">Category</Label>
                                        <Select onValueChange={(val) => form.setValue('category', val)}>
                                            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="saas">SaaS</SelectItem>
                                                <SelectItem value="app">Mobile App</SelectItem>
                                                <SelectItem value="physical">Physical Product</SelectItem>
                                                <SelectItem value="service">Service</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {form.formState.errors.category && <p className="text-red-500 text-sm">{form.formState.errors.category.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white font-semibold">Research Goal</Label>
                                        <Select onValueChange={(val) => form.setValue('researchGoal', val)}>
                                            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="validate">Validate Idea</SelectItem>
                                                <SelectItem value="pricing">Test Pricing Strategy</SelectItem>
                                                <SelectItem value="features">Feature Prioritization</SelectItem>
                                                <SelectItem value="market">Market Positioning</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {form.formState.errors.researchGoal && <p className="text-red-500 text-sm">{form.formState.errors.researchGoal.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-white font-semibold">Target Audience</Label>
                                        <AudioInput onTranscript={(text) => form.setValue('audience', text)} />
                                    </div>
                                    <Textarea {...form.register('audience')} placeholder="Who is this for? (e.g. Busy professionals, 25-45, tech-savvy...)" />
                                    {form.formState.errors.audience && <p className="text-red-500 text-sm">{form.formState.errors.audience.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white font-semibold">Panel Size: {form.watch('panelSize')} Personas</Label>
                                    <Slider
                                        min={5} max={15} step={1}
                                        defaultValue={[8]}
                                        onValueChange={(vals) => form.setValue('panelSize', vals[0])}
                                    />
                                    <p className="text-xs text-muted-foreground">Larger panels take longer but provide more diversity.</p>
                                </div>

                                <Button type="button" onClick={nextStep} className="w-full">Continue to Specifics →</Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Step 2: Specifics */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold text-white tracking-tight">Step 2: Specifics</h2>
                        </div>

                        <Card className="glass border-0">
                            <CardContent className="space-y-6 pt-6">

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-white font-semibold">Custom Research Questions (One per line)</Label>
                                        <AudioInput onTranscript={(text) => form.setValue('customQuestions', text)} />
                                    </div>
                                    <Textarea {...form.register('customQuestions')} placeholder="What's your biggest frustration?&#10;Would you switch tools?" className="h-24" />
                                </div>

                                <div className="p-6 border border-white/10 rounded-xl bg-white/5 space-y-4">
                                    <h3 className="font-bold text-lg text-white tracking-tight">Pricing Strategy</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-white font-semibold">Expected Price ($)</Label>
                                            <Input type="number" {...form.register('priceExpected', { valueAsNumber: true })} placeholder="e.g. 29" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-white font-semibold">Model</Label>
                                            <Select onValueChange={(val) => form.setValue('pricingModel', val)}>
                                                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="monthly">Monthly Subscription</SelectItem>
                                                    <SelectItem value="annual">Annual Subscription</SelectItem>
                                                    <SelectItem value="one-time">One-time Purchase</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-white font-semibold">Min Test Price ($)</Label>
                                            <Input type="number" {...form.register('priceMin', { valueAsNumber: true })} placeholder="e.g. 10" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-white font-semibold">Max Test Price ($)</Label>
                                            <Input type="number" {...form.register('priceMax', { valueAsNumber: true })} placeholder="e.g. 100" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg text-white tracking-tight">Feature Set</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <Label className="text-white font-semibold">Core Features (Comma separated)</Label>
                                            </div>
                                            <AudioInput onTranscript={(text) => form.setValue('featuresCore', text)} />
                                        </div>
                                        <Input {...form.register('featuresCore')} placeholder="e.g. Task lists, Reminders, Mobile App" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <Label className="text-white font-semibold">Premium Features (Comma separated)</Label>
                                            </div>
                                            <AudioInput onTranscript={(text) => form.setValue('featuresPremium', text)} />
                                        </div>
                                        <Input {...form.register('featuresPremium')} placeholder="e.g. AI Prioritization, Team Collaboration" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <Label className="text-white font-semibold">Future Roadmap (Comma separated)</Label>
                                            </div>
                                            <AudioInput onTranscript={(text) => form.setValue('featuresFuture', text)} />
                                        </div>
                                        <Input {...form.register('featuresFuture')} placeholder="e.g. Voice Commands, Predictive Analytics" />
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button type="button" variant="outline" onClick={() => setStep(1)}>← Back</Button>
                                    <Button type="button" onClick={() => setStep(3)}>Continue to Advanced →</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Step 3: Advanced */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold text-white tracking-tight">Step 3: Advanced</h2>
                        </div>

                        <Card className="glass border-0">
                            <CardContent className="space-y-6 pt-6">

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-white font-semibold">Competitors (One per line)</Label>
                                            <AudioInput onTranscript={(text) => form.setValue('competitors', text)} />
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={handleCompetitorSearch}
                                            disabled={searchingCompetitors || !form.watch('name')}
                                            className="text-xs"
                                        >
                                            {searchingCompetitors ? (
                                                <>
                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                    Searching...
                                                </>
                                            ) : (
                                                <>
                                                    <Search className="h-3 w-3 mr-1" />
                                                    Web Search
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <Textarea {...form.register('competitors')} placeholder="Competitor A - $10/mo&#10;Competitor B - Free" className="min-h-[100px]" />
                                    {!form.watch('name') && (
                                        <p className="text-xs text-muted-foreground">Enter a product name first to enable competitor search</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-white font-semibold">Persona Constraints</Label>
                                        <AudioInput onTranscript={(text) => form.setValue('personaConstraints', text)} />
                                    </div>
                                    <Textarea {...form.register('personaConstraints')} placeholder="e.g. Include at least 2 skeptics. No students." />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-white font-semibold">Formality: {form.watch('toneFormality')}%</Label>
                                        <Slider
                                            min={0} max={100} step={10}
                                            defaultValue={[50]}
                                            onValueChange={(vals) => form.setValue('toneFormality', vals[0])}
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Casual</span>
                                            <span>Professional</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white font-semibold">Skepticism: {form.watch('toneSkepticism')}%</Label>
                                        <Slider
                                            min={0} max={100} step={10}
                                            defaultValue={[50]}
                                            onValueChange={(vals) => form.setValue('toneSkepticism', vals[0])}
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Optimistic</span>
                                            <span>Critical</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white font-semibold">Analysis Depth</Label>
                                    <Select onValueChange={(val) => form.setValue('analysisDepth', val)} defaultValue="standard">
                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="quick">Quick (5 mins)</SelectItem>
                                            <SelectItem value="standard">Standard (15 mins)</SelectItem>
                                            <SelectItem value="deep">Deep (30 mins)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex justify-between pt-6">
                                    <Button type="button" variant="outline" onClick={() => setStep(2)} disabled={isSubmitting}>← Back</Button>
                                    <Button type="submit" size="lg" className="w-1/3" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                Starting Focus Group...
                                            </>
                                        ) : (
                                            <>Start Focus Group 🚀</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

            </form>
        </div>
    );
}
