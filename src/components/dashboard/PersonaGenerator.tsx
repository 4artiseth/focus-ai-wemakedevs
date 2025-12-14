'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export function PersonaGenerator({ projectId, isRegenerate = false }: { projectId: string; isRegenerate?: boolean }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/generate-personas`, {
                method: 'POST'
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || data.message || 'Failed to generate personas');
            }
            router.refresh();
        } catch (e: any) {
            console.error(e);
            alert(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (isRegenerate) {
        return (
            <Button onClick={handleGenerate} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? "Regenerating..." : "Regenerate Personas"}
            </Button>
        );
    }

    return (
        <div className="glass text-center p-10 rounded-lg border-0">
            <p className="mb-4 text-neutral-300">No personas generated yet.</p>
            <Button onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating AI Personas..." : "Generate Personas"}
            </Button>
        </div>
    );
}
