export const GATE_TYPES = ['H', 'X', 'S', 'T', 'CNOT', 'CCNOT'];

export const generateRandomCircuit = (forceHadamard = false) => {
    const numQubits = Math.floor(Math.random() * 4) + 1; // 1 to 4
    let numGates = Math.floor(Math.random() * 4); // 0 to 3

    // Bias towards at least 1 gate
    if (numGates === 0 && Math.random() < 0.7) numGates = 1;

    const gates = [];
    // If forceHadamard is true, we always ensure H. 
    // Otherwise, 90% chance if we have gates.
    const shouldEnsureH = forceHadamard || (Math.random() < 0.9 && numGates > 0);
    let currentHCount = 0;

    for (let i = 0; i < numGates; i++) {
        let type = GATE_TYPES[Math.floor(Math.random() * GATE_TYPES.length)];

        if (shouldEnsureH && i === numGates - 1 && currentHCount === 0) {
            type = 'H';
        }

        // Downgrade multi-qubit gates if not enough qubits
        if (numQubits === 1 && (type === 'CNOT' || type === 'CCNOT')) type = 'H';
        if (numQubits === 2 && type === 'CCNOT') type = 'CNOT';

        if (type === 'H') currentHCount++;

        const t = Math.floor(Math.random() * numQubits);

        if (type === 'CNOT') {
            let c = Math.floor(Math.random() * numQubits);
            while (c === t) c = Math.floor(Math.random() * numQubits);
            gates.push({ type, control: c, target: t });
        } else if (type === 'CCNOT') {
            let c1 = Math.floor(Math.random() * numQubits);
            while (c1 === t) c1 = Math.floor(Math.random() * numQubits);
            let c2 = Math.floor(Math.random() * numQubits);
            while (c2 === t || c2 === c1) c2 = Math.floor(Math.random() * numQubits);
            gates.push({ type, control1: c1, control2: c2, target: t });
        } else {
            gates.push({ type, target: t });
        }
    }

    return { numQubits, gates };
};
