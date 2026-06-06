export const ticksPerWholeNote = 48;

export const rhythmDurations = [
  { id: "whole", label: "Whole", notation: "1/1", ticks: 48 },
  { id: "half", label: "Half", notation: "1/2", ticks: 24 },
  { id: "quarter", label: "Quarter", notation: "1/4", ticks: 12 },
  { id: "eighth", label: "Eighth", notation: "1/8", ticks: 6 },
  { id: "sixteenth", label: "Sixteenth", notation: "1/16", ticks: 3 },
  { id: "quarterTriplet", label: "Quarter triplet", notation: "1/6", ticks: 8 },
  { id: "eighthTriplet", label: "Eighth triplet", notation: "1/12", ticks: 4 },
];

export const defaultRhythmDurations = ["quarter", "eighth", "sixteenth", "eighthTriplet"];
