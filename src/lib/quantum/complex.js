/**
 * Complex number utility functions for quantum state amplitudes.
 * Amplitude = real + i * imag
 */

export const create = (re = 0, im = 0) => ({ re, im });

export const add = (a, b) => ({
    re: a.re + b.re,
    im: a.im + b.im,
});

export const multiply = (a, b) => ({
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
});

export const conjugate = (a) => ({
    re: a.re,
    im: -a.im,
});

export const magnitudeSq = (a) => a.re * a.re + a.im * a.im;

export const magnitude = (a) => Math.sqrt(magnitudeSq(a));

export const phase = (a) => Math.atan2(a.im, a.re);

export const fromPhase = (phi) => ({
    re: Math.cos(phi),
    im: Math.sin(phi),
});

export const scale = (a, s) => ({
    re: a.re * s,
    im: a.im * s,
});

export const ZERO = create(0, 0);
export const ONE = create(1, 0);
export const I = create(0, 1);
