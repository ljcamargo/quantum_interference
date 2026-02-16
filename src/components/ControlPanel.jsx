'use client';

import React, { useState } from 'react';
import { ArrowDownTrayIcon, BeakerIcon } from '@heroicons/react/24/outline';

const GATE_TYPES = ['H', 'X', 'S', 'T', 'CNOT', 'CCNOT'];

const ControlPanel = ({
    numQubits, setNumQubits,
    gates, setGates,
    k, setK,
    omega, setOmega,
    onDownload,
    onOpenAbout
}) => {
    const [selectedGate, setSelectedGate] = useState('H');
    const [target, setTarget] = useState(0);
    const [control, setControl] = useState(0);
    const [control2, setControl2] = useState(0);

    const safeInt = (val, max) => {
        const n = parseInt(val);
        if (isNaN(n)) return 0;
        return Math.max(0, Math.min(max, n));
    };

    const addGate = () => {
        let newGate;
        const t = Math.min(target, numQubits - 1);
        const c = Math.min(control, numQubits - 1);
        const c2 = Math.min(control2, numQubits - 1);

        if (selectedGate === 'CNOT') {
            newGate = { type: 'CNOT', control: c, target: t };
        } else if (selectedGate === 'CCNOT') {
            newGate = { type: 'CCNOT', control1: c, control2: c2, target: t };
        } else {
            newGate = { type: selectedGate, target: t };
        }
        setGates([...gates, newGate]);
    };

    const handleRandom = () => {
        let newNumQubits = Math.floor(Math.random() * 4) + 1; // 1 to 4
        setNumQubits(newNumQubits);

        let numNewGates = Math.floor(Math.random() * 4); // 0 to 3

        // Slight bias: if 0 gates are chosen, 70% chance to force at least 1 
        // to avoid too many "blank" screens during random clicks
        if (numNewGates === 0 && Math.random() < 0.7) numNewGates = 1;

        const newGates = [];
        // Ensure at least one Hadamard 90% of the time if we have gates
        const shouldEnsureH = Math.random() < 0.9 && numNewGates > 0;
        let currentHCount = 0;

        for (let i = 0; i < numNewGates; i++) {
            let type = GATE_TYPES[Math.floor(Math.random() * GATE_TYPES.length)];

            // If we reach the last gate and still no Hadamard, force it
            if (shouldEnsureH && i === numNewGates - 1 && currentHCount === 0) {
                type = 'H';
            }

            // Downgrade multi-qubit gates if not enough qubits
            if (newNumQubits === 1 && (type === 'CNOT' || type === 'CCNOT')) type = 'H';
            if (newNumQubits === 2 && type === 'CCNOT') type = 'CNOT';

            if (type === 'H') currentHCount++;

            const t = Math.floor(Math.random() * newNumQubits);

            if (type === 'CNOT') {
                let c = Math.floor(Math.random() * newNumQubits);
                while (c === t) c = Math.floor(Math.random() * newNumQubits);
                newGates.push({ type, control: c, target: t });
            } else if (type === 'CCNOT') {
                let c1 = Math.floor(Math.random() * newNumQubits);
                while (c1 === t) c1 = Math.floor(Math.random() * newNumQubits);
                let c2 = Math.floor(Math.random() * newNumQubits);
                while (c2 === t || c2 === c1) c2 = Math.floor(Math.random() * newNumQubits);
                newGates.push({ type, control1: c1, control2: c2, target: t });
            } else {
                newGates.push({ type, target: t });
            }
        }
        setGates(newGates);
    };

    const removeGate = (index) => {
        setGates(gates.filter((_, i) => i !== index));
    };

    return (
        <div className="relative lg:fixed lg:right-8 lg:top-8 w-full lg:w-80 glass p-6 rounded-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto lg:overflow-y-auto mb-8 lg:mb-0">

            {/* Actions Section */}
            <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <button
                        onClick={onDownload}
                        className="flex-1 bg-matrix-green hover:bg-white text-black font-black py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,65,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] group font-title text-[10px] tracking-widest"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4 text-black group-hover:translate-y-0.5 transition-transform" />
                        DOWNLOAD
                    </button>
                    <button
                        onClick={handleRandom}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white font-black py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/20 font-title text-[10px] tracking-widest"
                    >
                        <BeakerIcon className="w-4 h-4 text-matrix-green" />
                        RANDOM
                    </button>
                </div>

                <button
                    onClick={onOpenAbout}
                    className="text-white text-[10px] text-matrix-dark hover:text-matrix-clear uppercase tracking-[0.2em] font-title transition-colors flex items-center justify-center gap-2 group"
                >
                    <span className="w-4 h-px bg-matrix-green/20 group-hover:bg-matrix-green/40 transition-colors"></span>
                    LEARN ABOUT THIS EXPERIMENT
                    <span className="w-4 h-px bg-matrix-green/20 group-hover:bg-matrix-green/40 transition-colors"></span>
                </button>
            </div>

            {/* Wave Dynamics Section (previously Classical) */}
            <div className="flex flex-col gap-4 p-4 border border-matrix-green/20 rounded-lg bg-black/20">
                <label className="text-[10px] uppercase tracking-widest text-matrix-green opacity-70 border-b border-matrix-green/10 pb-1 mb-1 font-title">Wave Dynamics</label>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[9px] opacity-60">
                        <span>WAVE NUMBER (k)</span>
                        <span>{k}</span>
                    </div>
                    <input
                        type="range" min="1" max="100" value={k}
                        onChange={(e) => setK(parseInt(e.target.value))}
                        className="accent-matrix-green bg-matrix-dark h-1 rounded-lg cursor-pointer"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[9px] opacity-60">
                        <span>FREQUENCY (ω)</span>
                        <span>{omega}</span>
                    </div>
                    <input
                        type="range" min="0" max="20" step="0.5" value={omega}
                        onChange={(e) => setOmega(parseFloat(e.target.value))}
                        className="accent-matrix-green bg-matrix-dark h-1 rounded-lg cursor-pointer"
                    />
                </div>
            </div>

            {/* Quantum Section */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-matrix-green opacity-70">Qubits: {numQubits}</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={numQubits}
                        onChange={(e) => setNumQubits(safeInt(e.target.value, 10))}
                        className="accent-matrix-green bg-matrix-dark h-1 rounded-lg cursor-pointer"
                    />
                </div>

                <div className="flex flex-col gap-4 p-4 border border-matrix-green/20 rounded-lg bg-black/20">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase opacity-50">Inject Gate</label>
                        <select
                            value={selectedGate}
                            onChange={(e) => setSelectedGate(e.target.value)}
                            className="bg-black/50 border border-matrix-green/30 text-matrix-green p-2 rounded outline-none text-xs"
                        >
                            {GATE_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase opacity-40">Target</label>
                            <input
                                type="number" min="0" max={numQubits - 1} value={target}
                                onChange={(e) => setTarget(safeInt(e.target.value, numQubits - 1))}
                                className="bg-black/50 border border-matrix-green/30 text-matrix-green p-1 rounded w-full text-xs font-suse"
                            />
                        </div>
                        {(selectedGate === 'CNOT' || selectedGate === 'CCNOT') && (
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] uppercase opacity-40">Control 1</label>
                                <input
                                    type="number" min="0" max={numQubits - 1} value={control}
                                    onChange={(e) => setControl(safeInt(e.target.value, numQubits - 1))}
                                    className="bg-black/50 border border-matrix-green/30 text-matrix-green p-1 rounded w-full text-xs font-suse"
                                />
                            </div>
                        )}
                        {selectedGate === 'CCNOT' && (
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] uppercase opacity-40">Control 2</label>
                                <input
                                    type="number" min="0" max={numQubits - 1} value={control2}
                                    onChange={(e) => setControl2(safeInt(e.target.value, numQubits - 1))}
                                    className="bg-black/50 border border-matrix-green/30 text-matrix-green p-1 rounded w-full text-xs font-suse"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={addGate}
                        className="bg-matrix-green/10 hover:bg-matrix-green/30 border border-matrix-green/40 text-matrix-green py-2 rounded transition-all active:scale-95 text-[10px] tracking-widest font-bold font-title"
                    >
                        ADD GATE
                    </button>
                </div>
            </div>

            {/* Sequence Section */}
            <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase opacity-70 border-b border-matrix-green/10 pb-1 font-title">Circuit Sequence</label>
                <div className="flex flex-col gap-2 overflow-y-auto max-h-48 pr-2">
                    {gates.length === 0 && <div className="text-[10px] opacity-30 italic font-suse">No gates applied...</div>}
                    {gates.map((g, i) => (
                        <div key={i} className="flex items-center justify-between bg-black/30 p-2 rounded border border-matrix-green/10 text-xs group">
                            <span className="font-suse">
                                <span className="text-matrix-green font-bold mr-2 text-[10px]">{g.type}</span>
                                <span className="opacity-50 text-[9px]">
                                    {g.type === 'CNOT' ? `c:${g.control} t:${g.target}` :
                                        g.type === 'CCNOT' ? `c1:${g.control1} c2:${g.control2} t:${g.target}` :
                                            `t:${g.target}`}
                                </span>
                            </span>
                            <button
                                onClick={() => removeGate(i)}
                                className="text-red-500/50 hover:text-red-500 transition-colors text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;
