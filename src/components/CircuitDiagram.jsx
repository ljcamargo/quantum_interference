'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Squares2X2Icon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const CircuitDiagram = ({ numQubits, gates, trigger }) => {
    const [isVisible, setIsVisible] = useState(false);
    const timerRef = useRef(null);
    const lastTriggerProcessed = useRef(trigger);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    // Auto-trigger logic (For Random / Control Panel changes)
    useEffect(() => {
        if (trigger > lastTriggerProcessed.current) {
            lastTriggerProcessed.current = trigger;

            clearTimer();
            setIsVisible(true);
            timerRef.current = setTimeout(() => {
                setIsVisible(false);
                timerRef.current = null;
            }, 4000);
        }
    }, [trigger]);

    const handleManualShow = (e) => {
        e.stopPropagation();
        clearTimer();
        setIsVisible(true);
    };

    const handleManualHide = (e) => {
        e.stopPropagation();
        clearTimer();
        setIsVisible(false);
    };

    const generateASCII = () => {
        if (numQubits <= 0) return '';
        const layers = [];
        const isOccupied = (layer, qubits) => qubits.some(q => layer[q] !== undefined);

        gates.forEach(gate => {
            const qubits = [];
            if (gate.type === 'CNOT') {
                const start = Math.min(gate.control, gate.target);
                const end = Math.max(gate.control, gate.target);
                for (let i = start; i <= end; i++) qubits.push(i);
            } else if (gate.type === 'CCNOT') {
                const start = Math.min(gate.control1, gate.control2, gate.target);
                const end = Math.max(gate.control1, gate.control2, gate.target);
                for (let i = start; i <= end; i++) qubits.push(i);
            } else {
                qubits.push(gate.target);
            }

            let placed = false;
            for (const layer of layers) {
                if (!isOccupied(layer, qubits)) {
                    qubits.forEach(q => layer[q] = gate);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                const newLayer = new Array(numQubits).fill(undefined);
                qubits.forEach(q => newLayer[q] = gate);
                layers.push(newLayer);
            }
        });

        const labelPad = numQubits > 9 ? 2 : 1;
        let lines = Array.from({ length: numQubits }, (_, i) => `q${i.toString().padEnd(labelPad)}: -`);

        layers.forEach(layer => {
            for (let i = 0; i < numQubits; i++) {
                const gate = layer[i];
                if (!gate) {
                    lines[i] += "----";
                } else if (gate.type === 'CNOT' || gate.type === 'CCNOT') {
                    if (gate.target === i) {
                        lines[i] += "[C]-";
                    } else if (gate.control === i || gate.control1 === i || gate.control2 === i) {
                        lines[i] += "-o--";
                    } else {
                        lines[i] += "-|--";
                    }
                } else {
                    lines[i] += `[${gate.type}]-`.padEnd(4, '-');
                }
            }
        });

        for (let i = 0; i < numQubits; i++) lines[i] += "[M]";
        return lines.join('\n');
    };

    return (
        <div className="lg:fixed lg:left-8 lg:top-8 z-50 flex flex-col items-stretch lg:items-start gap-4 pointer-events-none w-full lg:w-auto p-4 lg:p-0">
            <div className={`glass p-5 rounded-2xl transition-all duration-700 pointer-events-auto border border-matrix-green/20 ${isVisible ? 'opacity-100 shadow-[0_0_40px_rgba(0,255,65,0.15)] translate-y-0' : 'opacity-80 lg:translate-x-[-10px]'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Squares2X2Icon className="w-5 h-5 text-matrix-green" />
                        <span className="font-title text-[9px] tracking-[0.2em] text-matrix-green font-bold">CIRCUIT VIEWER</span>
                    </div>

                    {isVisible ? (
                        <button
                            onClick={handleManualHide}
                            className="flex items-center gap-1 text-[8px] font-black ml-4 px-3 py-1.5 rounded transition-all border font-title tracking-widest text-red-400 border-red-500/30 hover:bg-red-500/20 active:scale-90"
                        >
                            <EyeSlashIcon className="w-3 h-3" /> HIDE
                        </button>
                    ) : (
                        <button
                            onClick={handleManualShow}
                            className="flex items-center gap-1 text-[8px] font-black ml-4 px-3 py-1.5 rounded transition-all border font-title tracking-widest text-matrix-green border-matrix-green/30 hover:bg-matrix-green/20 active:scale-95 animate-pulse"
                        >
                            <EyeIcon className="w-3 h-3" /> SHOW
                        </button>
                    )}
                </div>

                {/* Animated Container using CSS Grid for smooth height transitions */}
                <div className={`grid transition-all duration-500 ease-in-out ${isVisible ? 'grid-rows-[1fr] opacity-100 mt-2 block' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                    <div className="overflow-hidden">
                        <div className="bg-black/90 rounded-xl p-4 border border-matrix-green/20 overflow-x-auto custom-scrollbar shadow-2xl scale-in-95 transform transition-transform duration-500">
                            <pre className="font-doto text-[18px] lg:text-[22px] leading-tight text-white whitespace-pre drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                                {generateASCII()}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CircuitDiagram;
