import * as Complex from './complex';

export class StateVector {
    constructor(numQubits) {
        this.numQubits = numQubits;
        this.size = Math.pow(2, numQubits);
        this.amplitudes = new Array(this.size).fill(null).map(() => Complex.ZERO);
        // Initialize to |00...0>
        this.amplitudes[0] = Complex.ONE;
    }

    /**
     * Apply a single-qubit gate
     * @param {number} target - The index of the target qubit (0 to n-1)
     * @param {Array<Array<Complex>>} matrix - 2x2 matrix representing the gate
     */
    applyGate(target, matrix) {
        if (target >= this.numQubits) return; // Bounds check
        const nextAmplitudes = new Array(this.size).fill(null).map(() => Complex.ZERO);
        const step = 1 << target;

        for (let i = 0; i < this.size; i++) {
            // Check if the bit at 'target' is 0
            if (!(i & step)) {
                const idx0 = i;
                const idx1 = i | step;

                const a = this.amplitudes[idx0];
                const b = this.amplitudes[idx1];

                if (!a || !b) continue;

                // matrix[0][0]*a + matrix[0][1]*b
                nextAmplitudes[idx0] = Complex.add(
                    Complex.multiply(matrix[0][0], a),
                    Complex.multiply(matrix[0][1], b)
                );

                // matrix[1][0]*a + matrix[1][1]*b
                nextAmplitudes[idx1] = Complex.add(
                    Complex.multiply(matrix[1][0], a),
                    Complex.multiply(matrix[1][1], b)
                );
            }
        }
        this.amplitudes = nextAmplitudes;
    }

    applyH(target) {
        const s = 1 / Math.sqrt(2);
        const H = [
            [Complex.create(s, 0), Complex.create(s, 0)],
            [Complex.create(s, 0), Complex.create(-s, 0)],
        ];
        this.applyGate(target, H);
    }

    applyX(target) {
        const X = [
            [Complex.ZERO, Complex.ONE],
            [Complex.ONE, Complex.ZERO],
        ];
        this.applyGate(target, X);
    }

    applyS(target) {
        const S = [
            [Complex.ONE, Complex.ZERO],
            [Complex.ZERO, Complex.I],
        ];
        this.applyGate(target, S);
    }

    applyT(target) {
        const root2 = Math.sqrt(2) / 2;
        const T = [
            [Complex.ONE, Complex.ZERO],
            [Complex.ZERO, Complex.create(root2, root2)],
        ];
        this.applyGate(target, T);
    }

    applyCNOT(control, target) {
        if (control >= this.numQubits || target >= this.numQubits) return;
        const nextAmplitudes = [...this.amplitudes];
        const controlStep = 1 << control;
        const targetStep = 1 << target;

        for (let i = 0; i < this.size; i++) {
            // If control bit is 1
            if (i & controlStep) {
                // Swap amplitudes where target bit is 0 and 1
                if (!(i & targetStep)) {
                    const idx0 = i;
                    const idx1 = i | targetStep;
                    if (idx1 >= this.size) continue;
                    const temp = nextAmplitudes[idx0];
                    nextAmplitudes[idx0] = nextAmplitudes[idx1];
                    nextAmplitudes[idx1] = temp;
                }
            }
        }
        this.amplitudes = nextAmplitudes;
    }

    applyCCNOT(control1, control2, target) {
        if (control1 >= this.numQubits || control2 >= this.numQubits || target >= this.numQubits) return;
        const nextAmplitudes = [...this.amplitudes];
        const c1Step = 1 << control1;
        const c2Step = 1 << control2;
        const tStep = 1 << target;

        for (let i = 0; i < this.size; i++) {
            // If both controls are 1
            if ((i & c1Step) && (i & c2Step)) {
                if (!(i & tStep)) {
                    const idx0 = i;
                    const idx1 = i | tStep;
                    if (idx1 >= this.size) continue;
                    const temp = nextAmplitudes[idx0];
                    nextAmplitudes[idx0] = nextAmplitudes[idx1];
                    nextAmplitudes[idx1] = temp;
                }
            }
        }
        this.amplitudes = nextAmplitudes;
    }
}

export function runCircuit(numQubits, gates) {
    const sv = new StateVector(numQubits);
    for (const gate of gates) {
        switch (gate.type) {
            case 'H':
                sv.applyH(gate.target);
                break;
            case 'X':
                sv.applyX(gate.target);
                break;
            case 'S':
                sv.applyS(gate.target);
                break;
            case 'T':
                sv.applyT(gate.target);
                break;
            case 'CNOT':
                sv.applyCNOT(gate.control, gate.target);
                break;
            case 'CCNOT':
                sv.applyCCNOT(gate.control1, gate.control2, gate.target);
                break;
            default:
                console.warn('Unknown gate type:', gate.type);
        }
    }
    return sv;
}
