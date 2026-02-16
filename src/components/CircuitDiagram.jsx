'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Squares2X2Icon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const CircuitDiagram = ({ numQubits, gates, trigger }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isManual, setIsManual] = useState(false);
    const timerRef = useRef(null);

    // Auto-show and auto-hide logic (only for automatic triggers)
    useEffect(() => {
        if (trigger > 0 && !isManual) {
            setIsVisible(true);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                setIsVisible(false);
            }, 4000); // Hide after 4 seconds
        }
    }, [trigger, isManual]);

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
                    lines[i] += `[${gate.type}]-`.padEnd(4, '-');
                }
            }
        });

        for (let i = 0; i < numQubits; i++) lines[i] += "[M]";
        return lines.join('\n');
    };

    const toggleManual = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        const newManual = !isManual;
        setIsManual(newManual);
        setIsVisible(newManual);
    };

    return (
        <div className="lg:fixed lg:left-8 lg:top-8 z-50 flex flex-col items-stretch lg:items-start gap-4 pointer-events-none w-full lg:w-auto p-4 lg:p-0">
            <div className={`glass p-5 rounded-2xl transition-all duration-500 pointer-events-auto border border-matrix-green/20 ${isVisible ? 'opacity-100' : 'lg:opacity-80'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Squares2X2Icon className="w-5 h-5 text-matrix-green" />
                        <span className="font-title text-[10px] tracking-[0.2em] text-matrix-green font-bold">CIRCUIT VIEWER</span>
                    </div>
                    <button
                        onClick={toggleManual}
                        className={`flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded transition-all border font-title tracking-widest ${isManual ? 'bg-matrix-green text-black border-matrix-green' : 'text-matrix-green border-matrix-green/30 hover:bg-matrix-green/20'}`}
                    >
                        {isManual ? <EyeSlashIcon className="w-3 h-3" /> : <EyeIcon className="w-3 h-3" />}
                        {isManual ? 'HIDE' : 'SHOW'}
                    </button>
                </div>

                {isVisible && (
                    <div className="bg-black/80 rounded-xl p-4 border border-matrix-green/10 overflow-x-auto custom-scrollbar shadow-inner">
                        <pre className="font-doto text-[18px] lg:text-[22px] leading-tight text-white whitespace-pre">
                            {generateASCII()}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CircuitDiagram;
