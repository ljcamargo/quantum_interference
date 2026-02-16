'use client';

import React, { useRef, useEffect, useMemo, useImperativeHandle } from 'react';
import * as Complex from '../lib/quantum/complex';

const QuantumVisualizer = React.forwardRef(({ stateVector, k = 40, omega = 5 }, ref) => {
    const innerRef = useRef(null);
    const requestRef = useRef();
    const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 });

    // Expose innerRef as ref
    React.useImperativeHandle(ref, () => innerRef.current);

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Positions of sources for each state
    const sources = useMemo(() => {
        if (!stateVector) return [];
        const n = stateVector.size;
        const res = [];
        const radius = 0.4; // 40% of canvas size
        for (let i = 0; i < n; i++) {
            const angle = (i * 2 * Math.PI) / n;
            res.push({
                x: 0.5 + radius * Math.cos(angle),
                y: 0.5 + radius * Math.sin(angle),
                amplitude: Complex.magnitude(stateVector.amplitudes[i] || Complex.ZERO),
                phase: Complex.phase(stateVector.amplitudes[i] || Complex.ZERO),
            });
        }
        return res.filter(s => s.amplitude > 0.001); // Only active sources
    }, [stateVector]);

    const draw = (time) => {
        const canvas = innerRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;

        // Use a smaller resolution for performance
        const scale = 4;
        const w = Math.floor(width / scale);
        const h = Math.floor(height / scale);
        if (w <= 0 || h <= 0) return;

        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;

        const t = time / 1000;
        // k and omega props are used here
        const currentK = k;
        const currentOmega = omega;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const u = x / w;
                const v = y / h;

                let totalReal = 0;
                let totalImag = 0;

                for (const s of sources) {
                    const dx = u - s.x;
                    const dy = (v - s.y) * (height / width);
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    const phase = currentK * dist - s.phase - currentOmega * t;
                    totalReal += s.amplitude * Math.cos(phase);
                    totalImag += s.amplitude * Math.sin(phase);
                }

                const intensity = (totalReal * totalReal + totalImag * totalImag);
                // Normalize intensity
                const val = Math.min(255, intensity * 255);

                const idx = (y * w + x) * 4;

                // Matrix/Glossy Green theme: (0, intensity, intensity * 0.5)
                data[idx] = 0;
                data[idx + 1] = val;
                data[idx + 2] = val * 0.4;
                data[idx + 3] = val > 5 ? 255 : val * 5; // Fade out very low intensity
            }
        }

        ctx.clearRect(0, 0, width, height);

        // Use a temporary canvas for upscaling
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = w;
        tmpCanvas.height = h;
        tmpCanvas.getContext('2d').putImageData(imageData, 0, 0);

        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(tmpCanvas, 0, 0, width, height);

        requestRef.current = requestAnimationFrame(draw);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(requestRef.current);
    }, [sources, k, omega]);

    return (
        <canvas
            ref={innerRef}
            className="fixed inset-0 w-full h-full -z-10 bg-black opacity-80"
            style={{ filter: 'blur(2px) contrast(1.2) brightness(1.2)' }}
            width={dimensions.width}
            height={dimensions.height}
        />
    );
});

QuantumVisualizer.displayName = 'QuantumVisualizer';


export default QuantumVisualizer;
