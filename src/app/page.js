'use client';

import React, { useState, useEffect, useMemo } from 'react';
import QuantumVisualizer from '../components/QuantumVisualizer';
import ControlPanel from '../components/ControlPanel';
import { runCircuit } from '../lib/quantum/engine';

export default function Home() {
  const [numQubits, setNumQubits] = useState(3);
  const [gates, setGates] = useState([
    { type: 'H', target: 0 },
    { type: 'H', target: 1 },
    { type: 'H', target: 2 }
  ]);

  const [k, setK] = useState(40);
  const [omega, setOmega] = useState(5);
  const [stateVector, setStateVector] = useState(null);
  const visualizerRef = React.useRef(null);

  // Re-run quantum calculation whenever qubits or gates change
  useEffect(() => {
    try {
      const sv = runCircuit(numQubits, gates);
      setStateVector(sv);
    } catch (err) {
      console.error("Quantum simulation error:", err);
    }
  }, [numQubits, gates]);

  const handleDownload = () => {
    const canvas = visualizerRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `quantum_interference_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* The Visualizer acts as the background */}
      <QuantumVisualizer
        ref={visualizerRef}
        stateVector={stateVector}
        k={k}
        omega={omega}
      />

      {/* Hero Text / Subtle Title */}
      <div className="absolute left-10 bottom-10 pointer-events-none select-none">
        <h2 className="text-6xl font-black glossy-text tracking-tighter opacity-60 font-title">
          Quantum Interference
        </h2>
        <div className="mt-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-matrix-green opacity-40">
            Quantum Probability Amplitude Field simulation // v1.1.0
          </p>
          <p className="text-[10px] uppercase tracking-[0.1em] text-matrix-green opacity-30 mt-1">
            by Luis J Camargo, copyleft 2026
          </p>
        </div>
      </div>

      <ControlPanel
        numQubits={numQubits}
        setNumQubits={setNumQubits}
        gates={gates}
        setGates={setGates}
        k={k}
        setK={setK}
        omega={omega}
        setOmega={setOmega}
        onDownload={handleDownload}
      />
    </main>
  );
}
