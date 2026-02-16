'use client';

import React, { useState } from 'react';

const GATE_TYPES = ['H', 'X', 'S', 'T', 'CNOT', 'CCNOT'];

const ControlPanel = ({
    numQubits, setNumQubits,
    gates, setGates,
    k, setK,
    omega, setOmega,
    onDownload
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

    const removeGate = (index) => {
        setGates(gates.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed right-8 top-8 w-80 glass p-6 rounded-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">

            {/* Download Section - NOW AT TOP */}
            <button
                onClick={onDownload}
                className="w-full bg-matrix-green hover:bg-white text-black font-black py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,65,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] group font-title text-xs tracking-wide mb-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-y-1 transition-transform">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y1="3" />
                </svg>
                DOWNLOAD
            </button>

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
