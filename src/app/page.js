'use client';

import React, { useState, useEffect, useMemo } from 'react';
import QuantumVisualizer from '../components/QuantumVisualizer';
import ControlPanel from '../components/ControlPanel';
import CircuitDiagram from '../components/CircuitDiagram';
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
  const [diagramTrigger, setDiagramTrigger] = useState(0);
  const visualizerRef = React.useRef(null);

  // Re-run quantum calculation and trigger diagram
  useEffect(() => {
    try {
      const sv = runCircuit(numQubits, gates);
      setStateVector(sv);
      setDiagramTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Quantum simulation error:", err);
    }
  }, [numQubits, gates]);

  // Trigger diagram on wave dynamics changes too
  useEffect(() => {
    setDiagramTrigger(prev => prev + 1);
  }, [k, omega]);

  // UIX Fix: Remove invalid gates when qubit count is lowered
  useEffect(() => {
    const validGates = gates.filter(gate => {
      if (gate.target >= numQubits) return false;
      if (gate.control !== undefined && gate.control >= numQubits) return false;
      if (gate.control1 !== undefined && gate.control1 >= numQubits) return false;
      if (gate.control2 !== undefined && gate.control2 >= numQubits) return false;
      return true;
    });
    if (validGates.length !== gates.length) {
      setGates(validGates);
    }
  }, [numQubits]);

  const handleDownload = () => {
    const canvas = visualizerRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `quantum_interference_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col lg:items-center lg:justify-center">
      {/* The Visualizer acts as the background */}
      <QuantumVisualizer
        ref={visualizerRef}
        stateVector={stateVector}
        k={k}
        omega={omega}
      />

      {/* Responsive Content Container */}
      <div className="relative z-10 w-full flex flex-col lg:block min-h-screen overflow-y-auto lg:overflow-hidden">

        {/* Circuit Viewer: Top on mobile, Top-Left on desktop */}
        <CircuitDiagram
          numQubits={numQubits}
          gates={gates}
          trigger={diagramTrigger}
        />

        {/* Control Panel: Mid on mobile, Top-Right on desktop */}
        <div className="lg:contents">
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
        </div>

        {/* Hero Title: Bottom on mobile, Bottom-Left on desktop */}
        <div className="mt-auto p-8 lg:p-0 lg:absolute lg:left-10 lg:bottom-10 pointer-events-none select-none">
          <h2 className="text-4xl lg:text-6xl font-black glossy-text tracking-tighter opacity-70 font-title">
            Quantum Interference
          </h2>
          <div className="mt-2">
            <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.3em] text-matrix-green opacity-40">
              Quantum Probability Amplitude Field simulation // v1.2.0
            </p>
            <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.1em] text-matrix-green opacity-30 mt-1">
              by Luis J Camargo, copyleft 2026
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
