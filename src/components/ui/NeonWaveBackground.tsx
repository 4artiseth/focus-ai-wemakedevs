'use client';

import React, { useEffect, useRef } from 'react';

export function NeonWaveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width: number, height: number;
        let animationFrameId: number;

        // The mathematical shape of the wave
        function getWaveY(x: number) {
            const normX = x / width;
            const angle = normX * Math.PI * 2 - Math.PI;

            // Tweak these to match the image shape exactly
            const center = height * 0.35;
            const amp = height * 0.22;

            return center + amp * Math.cos(angle);
        }

        function draw() {
            if (!ctx || !canvas) return;

            // 1. Background (The void above the wave)
            const cx = width / 2;
            const cy = height * 0.1; // Center the darkness near the top middle

            // Gradient: Center is Black, Edges are Deep Purple
            const bgGradient = ctx.createRadialGradient(
                cx,
                cy,
                0,
                cx,
                cy,
                width * 0.8
            );
            bgGradient.addColorStop(0.0, '#000000'); // Deepest void in center
            bgGradient.addColorStop(0.4, '#0f001a'); // Fading out
            bgGradient.addColorStop(1.0, '#400080'); // Rich purple at the far corners/sides

            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, width, height);

            // 2. The Layers
            // REVERSED ORDER: Draw the "highest" (top of screen) stuff first.
            // Then draw the lower stuff on top of it so it doesn't get hidden.

            const layers = [
                // Layer 1: The purple "Glow" emanating from the top edge
                { color: '#5e00ff', blur: 60, offset: -40 },

                // Layer 2: The Main Purple Band (Top Edge)
                { color: '#8000ff', blur: 30, offset: 0 },

                // Layer 3: Transition Magenta
                { color: '#cc00ff', blur: 35, offset: 30 },

                // Layer 4: The Deep Hot Pink Body
                { color: '#ff00aa', blur: 40, offset: 80 },

                // Layer 5: The Bottom Light Pink/Peach
                { color: '#ff5e99', blur: 50, offset: 180 },

                // Layer 6: Smooth bridge color (Soft Rose)
                { color: '#ff8fb8', blur: 55, offset: 320 },

                // Layer 7: Extra smooth pale pink transition - Pushed down
                { color: '#ffb6c1', blur: 60, offset: 550 },

                // Layer 8: Bright center highlight - Pushed almost entirely off-screen
                // Increased offset from 650 to 850
                { color: '#ffe6f0', blur: 75, offset: 850 },
            ];

            layers.forEach((layer) => {
                ctx.save();
                ctx.filter = `blur(${layer.blur}px)`;
                ctx.fillStyle = layer.color;

                ctx.beginPath();
                ctx.moveTo(-100, height); // Start bottom-left offscreen

                // Draw the wave top edge
                for (let x = -100; x <= width + 100; x += 20) {
                    const y = getWaveY(x);
                    ctx.lineTo(x, y + layer.offset);
                }

                // Close shape at bottom-right offscreen -> bottom-left offscreen
                ctx.lineTo(width + 100, height);
                ctx.lineTo(-100, height);
                ctx.fill();

                ctx.restore();
            });

            // 3. Noise / Dither Overlay
            // This is crucial for the "airbrushed" look
            addNoise();
        }

        // Detect Safari specifically to apply the banding fix
        // Safari (WebKit) often exhibits "Mach banding" with canvas filters and gradients due to linear interpolation issues.
        // We will increase the noise/dithering ONLY for Safari to mask these bands.
        const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        function addNoise() {
            if (!ctx || !canvas) return;

            const w = canvas.width;
            const h = canvas.height;
            const idata = ctx.createImageData(w, h);
            const buffer32 = new Uint32Array(idata.data.buffer);
            const len = buffer32.length;

            // Safari needs significantly stronger noise to hide the rendering artifacts (banding)
            // Other browsers get the standard subtle noise
            const noiseDensity = isSafari ? 0.25 : 0.08; // Increased from 0.08 to 0.25 for Safari
            const noiseAlpha = isSafari ? 0x25 : 0x15;   // Increased opacity (0x25 is ~14%, 0x15 is ~8%)

            for (let i = 0; i < len; i++) {
                if (Math.random() < noiseDensity) {
                    // Subtle purple/white noise
                    // 0x15 is the alpha (transparency) - we keep it low-ish even on Safari
                    // Format: Alpha | Blue | Green | Red (Little Endian typically, but here constructed as RGBA logic often varies by endianness but assuming standard 32bit int usage)
                    // Actually Uint32Array views ABGR on Little Endian. 
                    // 0x15 << 24 is Alpha.
                    buffer32[i] = (noiseAlpha << 24) | (0xff << 16) | (0xaa << 8) | 0xff;
                }
            }

            const noiseCanvas = document.createElement('canvas');
            noiseCanvas.width = w;
            noiseCanvas.height = h;
            const noiseCtx = noiseCanvas.getContext('2d');
            if (noiseCtx) {
                noiseCtx.putImageData(idata, 0, 0);

                ctx.save();
                ctx.globalCompositeOperation = 'overlay'; // Blend mode makes it look like film grain
                ctx.drawImage(noiseCanvas, 0, 0);

                // For Safari, we sometimes need a second pass or a different blend if overlay isn't enough, 
                // but increasing density/alpha usually does the trick.
                ctx.restore();
            }
        }

        function resize() {
            if (!canvas) return;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            draw();
        }

        window.addEventListener('resize', resize);
        resize();

        return () => {
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            id="neon-wave-canvas"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none', // Ensure clicks pass through
            }}
        />
    );
}
