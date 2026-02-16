'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

const CircuitDiagram = ({ numQubits, gates, trigger }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const timerRef = useRef(null);

    // Auto-show and auto-hide logic
    useEffect(() => {
        if (trigger > 0) {
            setIsVisible(true);
            if (!isLocked) {
                if (timerRef.current) clearTimeout(timerRef.current);
                timerRef.current = setTimeout(() => {
                    setIsVisible(false);
                }, 4000); // Hide after 4 seconds
            }
        }
    }, [trigger, isLocked]);

    const generateASCII = () => {
        if (numQubits <= 0) return '';

        // Slicing algorithm: place gates in layers
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
                    // Gate types like H, X, S, T
                    lines[i] += `[${gate.type}]-`.padEnd(4, '-');
                }
            }
        });

        for (let i = 0; i < numQubits; i++) lines[i] += "[M]";
        return lines.join('\n');
    };

    return (
        <div className="fixed left-8 top-8 z-50 flex flex-col items-start gap-3 pointer-events-none">
            <div className={`glass p-4 rounded-2xl transition-all duration-500 pointer-events-auto border border-matrix-green/10 ${isVisible || isLocked ? 'w-[400px]' : 'w-40 opacity-80'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Squares2X2Icon className="w-4 h-4 text-matrix-green translate-y-[-1px]" />
                        <span className="font-title text-[9px] tracking-[0.2em] text-matrix-green opacity-90">MAP VIEW</span>
                    </div>
                    <button
                        onClick={() => {
                            setIsLocked(!isLocked);
                            if (!isLocked) setIsVisible(true);
                        }}
                        className={`text-[8px] font-black px-2 py-1 rounded transition-all border font-title tracking-tighter ${isLocked ? 'bg-matrix-green text-black border-matrix-green' : 'text-matrix-green border-matrix-green/30 hover:bg-matrix-green/10'}`}
                    >
                        {isLocked ? 'LOCKED' : 'SHOW'}
                    </button>
                </div>

                {(isVisible || isLocked) && (
                    <div className="overflow-x-auto custom-scrollbar">
                        <pre className="font-doto text-[11px] leading-tight text-matrix-green/90 whitespace-pre">
                            {generateASCII()}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CircuitDiagram;
