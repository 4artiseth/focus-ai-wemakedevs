'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';

export function StartSessionButton({ projectId, label = "Start Focus Group Session" }: { projectId: string; label?: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/start-session`, {
                method: 'POST'
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                console.error('Session start failed:', errorData);
                throw new Error(errorData.error || 'Failed to start session');
            }

            // Wait a moment for DB propagation
            await new Promise(resolve => setTimeout(resolve, 500));

            // Force refresh and navigation to ensure the new session is picked up
            router.refresh();
            // Also push to the same URL to trigger a re-render if refresh is subtle
            router.push(pathname);
        } catch (e: any) {
            console.error('Session start error:', e);
            alert(`Error starting session: ${e.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleStart} disabled={loading}>
            {loading ? "Running Simulation..." : label}
        </Button>
    );
}
