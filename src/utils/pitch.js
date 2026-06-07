import { guitarStrings, noteStrings } from "../data/music";

export function frequencyToNote(frequency) {
  const midi = Math.round(12 * Math.log2(frequency / 440) + 69);
  const name = noteStrings[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  const target = 440 * 2 ** ((midi - 69) / 12);
  const cents = Math.round(1200 * Math.log2(frequency / target));

  return { name, octave, cents, target };
}

export function findClosestString(frequency) {
  return guitarStrings.reduce((closest, string) => {
    const currentDistance = Math.abs(1200 * Math.log2(frequency / string.hz));
    const closestDistance = Math.abs(1200 * Math.log2(frequency / closest.hz));
    return currentDistance < closestDistance ? string : closest;
  }, guitarStrings[0]);
}

export function getSignalLevel(buffer) {
  let sum = 0;

  for (let index = 0; index < buffer.length; index += 1) {
    sum += buffer[index] * buffer[index];
  }

  return Math.sqrt(sum / buffer.length);
}

export function centsFromClosestString(frequency) {
  return guitarStrings.reduce((closest, string) => {
    const distance = Math.abs(1200 * Math.log2(frequency / string.hz));
    return Math.min(closest, distance);
  }, Number.POSITIVE_INFINITY);
}

export function correctGuitarHarmonic(frequency) {
  if (!frequency) return null;

  const candidates = [frequency, frequency / 2, frequency / 3].filter((candidate) => candidate >= 60);

  return candidates.reduce((best, candidate) => {
    const distance = centsFromClosestString(candidate);
    const bestDistance = centsFromClosestString(best);
    return distance + 12 < bestDistance ? candidate : best;
  }, frequency);
}

function dbToLinear(db) {
  if (!Number.isFinite(db)) return 0;
  return 10 ** (db / 20);
}

function interpolateSpectrum(spectrum, index) {
  const lower = Math.floor(index);
  const upper = Math.min(spectrum.length - 1, lower + 1);
  const ratio = index - lower;
  const lowerValue = dbToLinear(spectrum[lower]);
  const upperValue = dbToLinear(spectrum[upper]);

  return lowerValue + (upperValue - lowerValue) * ratio;
}

function scoreFrequency(spectrum, sampleRate, fftSize, frequency) {
  const binHz = sampleRate / fftSize;
  let score = 0;

  for (let harmonic = 1; harmonic <= 6; harmonic += 1) {
    const harmonicFrequency = frequency * harmonic;
    if (harmonicFrequency >= sampleRate / 2) break;

    const bin = harmonicFrequency / binHz;
    score += interpolateSpectrum(spectrum, bin) / harmonic;
  }

  return score;
}

export function detectStandardGuitarPitch(spectrum, sampleRate, fftSize) {
  let best = null;
  let secondBestScore = 0;

  guitarStrings.forEach((string) => {
    for (let cents = -80; cents <= 80; cents += 4) {
      const frequency = string.hz * 2 ** (cents / 1200);
      const score = scoreFrequency(spectrum, sampleRate, fftSize, frequency);

      if (!best || score > best.score) {
        secondBestScore = best?.score ?? 0;
        best = { frequency, score, string };
      } else if (score > secondBestScore) {
        secondBestScore = score;
      }
    }
  });

  if (!best || best.score < 0.015 || best.score < secondBestScore * 1.08) return null;
  return best.frequency;
}

export function detectPitch(buffer, sampleRate) {
  let rms = 0;
  let mean = 0;

  for (let i = 0; i < buffer.length; i += 1) mean += buffer[i];
  mean /= buffer.length;

  for (let i = 0; i < buffer.length; i += 1) {
    const centered = buffer[i] - mean;
    rms += centered * centered;
  }

  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.004) return null;

  const minFrequency = 60;
  const maxFrequency = 1000;
  const threshold = 0.14;
  const minTau = Math.floor(sampleRate / maxFrequency);
  const maxTau = Math.min(Math.floor(sampleRate / minFrequency), Math.floor(buffer.length / 2));
  const difference = new Float32Array(maxTau + 1);

  for (let tau = minTau; tau <= maxTau; tau += 1) {
    let sum = 0;

    for (let index = 0; index < maxTau; index += 1) {
      const delta = buffer[index] - mean - (buffer[index + tau] - mean);
      sum += delta * delta;
    }

    difference[tau] = sum;
  }

  let runningSum = 0;
  let bestTau = -1;

  for (let tau = minTau; tau <= maxTau; tau += 1) {
    runningSum += difference[tau];
    if (runningSum === 0) continue;

    const normalized = (difference[tau] * tau) / runningSum;

    if (normalized < threshold) {
      bestTau = tau;

      while (bestTau + 1 <= maxTau) {
        const nextNormalized = (difference[bestTau + 1] * (bestTau + 1)) / runningSum;
        if (difference[bestTau + 1] >= difference[bestTau] || nextNormalized > threshold) break;
        bestTau += 1;
      }

      break;
    }
  }

  if (bestTau === -1) {
    let bestDifference = Number.POSITIVE_INFINITY;

    for (let tau = minTau; tau <= maxTau; tau += 1) {
      if (difference[tau] < bestDifference) {
        bestDifference = difference[tau];
        bestTau = tau;
      }
    }
  }

  if (bestTau <= 0) return null;

  const previous = difference[bestTau - 1] ?? difference[bestTau];
  const current = difference[bestTau];
  const next = difference[bestTau + 1] ?? difference[bestTau];
  const denominator = previous + next - 2 * current;
  const betterTau = denominator === 0 ? bestTau : bestTau + (previous - next) / (2 * denominator);
  const frequency = sampleRate / betterTau;

  return frequency >= minFrequency && frequency <= maxFrequency ? frequency : null;
}

export function autoCorrelate(buffer, sampleRate) {
  return detectPitch(buffer, sampleRate);
}
