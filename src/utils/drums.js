import { defaultDrumStyleId, drumStyles, drumVoices } from "../data/drums";

export const drumStepsPerBar = 16;

export function getDrumStyle(styleId) {
  return drumStyles.find((style) => style.id === styleId) ?? drumStyles.find((style) => style.id === defaultDrumStyleId);
}

export function getDrumPattern(style, patternId) {
  return style.patterns.find((pattern) => pattern.id === patternId) ?? style.patterns[0];
}

export function getStepMs(bpm) {
  return 60000 / bpm / 4;
}

export function getActiveVoices(pattern, stepIndex) {
  if (!pattern.length) return [];
  const step = pattern[stepIndex % pattern.length] ?? [];
  const voiceIds = new Set(drumVoices.map((voice) => voice.id));
  return step.filter((voiceId) => voiceIds.has(voiceId));
}

export function hasVoiceOnStep(pattern, stepIndex, voiceId) {
  return getActiveVoices(pattern, stepIndex).includes(voiceId);
}
