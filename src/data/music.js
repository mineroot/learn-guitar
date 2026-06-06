export const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const guitarStrings = [
  { name: "E2", hz: 82.41 },
  { name: "A2", hz: 110 },
  { name: "D3", hz: 146.83 },
  { name: "G3", hz: 196 },
  { name: "B3", hz: 246.94 },
  { name: "E4", hz: 329.63 },
];

export const fretboardStrings = [...guitarStrings].reverse();
export const fretNumbers = Array.from({ length: 25 }, (_, index) => index);
export const fretMarkers = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

export const scalePatterns = {
  chromatic: { label: "All notes", intervals: Array.from({ length: 12 }, (_, index) => index) },
  major: { label: "Major", intervals: [0, 2, 4, 5, 7, 9, 11] },
  minor: { label: "Natural minor", intervals: [0, 2, 3, 5, 7, 8, 10] },
  majorPentatonic: { label: "Major pentatonic", intervals: [0, 2, 4, 7, 9] },
  minorPentatonic: { label: "Minor pentatonic", intervals: [0, 3, 5, 7, 10] },
  blues: { label: "Blues", intervals: [0, 3, 5, 6, 7, 10] },
};

export function noteIndex(noteName) {
  return noteStrings.indexOf(noteName.replace(/\d/g, ""));
}
