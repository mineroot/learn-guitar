import { describe, expect, it } from "vitest";
import {
  centsFromClosestString,
  correctGuitarHarmonic,
  detectPitch,
  detectStandardGuitarPitch,
  findClosestString,
  frequencyToNote,
  getSignalLevel,
} from "./pitch";

function sineBuffer(frequency, sampleRate = 44100, length = 32768) {
  const buffer = new Float32Array(length);

  for (let index = 0; index < length; index += 1) {
    buffer[index] = 0.5 * Math.sin((2 * Math.PI * frequency * index) / sampleRate);
  }

  return buffer;
}

function guitarSpectrum(frequency, sampleRate = 44100, fftSize = 32768) {
  const spectrum = new Float32Array(fftSize / 2).fill(-100);
  const binHz = sampleRate / fftSize;

  for (let harmonic = 1; harmonic <= 6; harmonic += 1) {
    const bin = Math.round((frequency * harmonic) / binHz);
    if (bin >= spectrum.length) break;

    spectrum[bin] = -6 - harmonic;
    if (bin > 0) spectrum[bin - 1] = -14 - harmonic;
    if (bin < spectrum.length - 1) spectrum[bin + 1] = -14 - harmonic;
  }

  return spectrum;
}

describe("pitch utilities", () => {
  it("maps frequency to the nearest chromatic note", () => {
    expect(frequencyToNote(440)).toMatchObject({ name: "A", octave: 4, cents: 0 });
    expect(frequencyToNote(82.41).name).toBe("E");
  });

  it("finds the closest standard guitar string", () => {
    expect(findClosestString(83).name).toBe("E2");
    expect(findClosestString(248).name).toBe("B3");
    expect(centsFromClosestString(110)).toBeCloseTo(0, 3);
  });

  it("folds strong octave harmonics back toward guitar strings", () => {
    expect(correctGuitarHarmonic(164.82)).toBeCloseTo(82.41, 1);
    expect(correctGuitarHarmonic(220)).toBeCloseTo(110, 1);
  });

  it("measures signal level", () => {
    expect(getSignalLevel(new Float32Array([0, 0.5, -0.5, 0]))).toBeCloseTo(0.3535, 3);
  });

  it("detects synthetic guitar string pitches from time-domain audio", () => {
    expect(detectPitch(sineBuffer(82.41), 44100)).toBeCloseTo(82.41, 0);
    expect(detectPitch(sineBuffer(329.63), 44100)).toBeCloseTo(329.63, 0);
  });

  it("detects standard guitar pitch from harmonic spectrum", () => {
    expect(detectStandardGuitarPitch(guitarSpectrum(110), 44100, 32768)).toBeCloseTo(110, 0);
    expect(detectStandardGuitarPitch(guitarSpectrum(246.94), 44100, 32768)).toBeCloseTo(246.94, 0);
  });
});
