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

export function autoCorrelate(buffer, sampleRate) {
  let rms = 0;
  for (let i = 0; i < buffer.length; i += 1) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.01) return null;

  let start = 0;
  let end = buffer.length - 1;
  const threshold = 0.2;

  for (let i = 0; i < buffer.length / 2; i += 1) {
    if (Math.abs(buffer[i]) < threshold) {
      start = i;
      break;
    }
  }

  for (let i = 1; i < buffer.length / 2; i += 1) {
    if (Math.abs(buffer[buffer.length - i]) < threshold) {
      end = buffer.length - i;
      break;
    }
  }

  const slice = buffer.slice(start, end);
  const correlations = new Array(slice.length).fill(0);

  for (let lag = 0; lag < slice.length; lag += 1) {
    for (let i = 0; i < slice.length - lag; i += 1) {
      correlations[lag] += slice[i] * slice[i + lag];
    }
  }

  let lag = 0;
  while (correlations[lag] > correlations[lag + 1]) lag += 1;

  let maxLag = lag;
  let maxCorrelation = -1;
  for (; lag < correlations.length; lag += 1) {
    if (correlations[lag] > maxCorrelation) {
      maxCorrelation = correlations[lag];
      maxLag = lag;
    }
  }

  if (maxLag === 0) return null;
  return sampleRate / maxLag;
}
