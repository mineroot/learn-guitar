import { chordDatabase, chordRoots, chordTypes } from "../data/chords";

const majorQualities = ["major", "minor", "minor", "major", "major", "minor", "dim"];
const minorQualities = ["minor", "dim", "major", "minor", "minor", "major", "major"];
const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
const minorIntervals = [0, 2, 3, 5, 7, 8, 10];

export function chordName(root, type) {
  if (type === "dim") return `${root}dim`;
  const chordType = chordTypes.find((item) => item.id === type);
  return `${root}${chordType?.suffix ?? ""}`;
}

export function rootToDbKey(root) {
  return chordRoots.find((item) => item.label === root)?.dbKey ?? root;
}

function normalizePosition(root, type, position, index) {
  return {
    id: `${root}-${type}-${index}`,
    name: chordName(root, type),
    root,
    type,
    baseFret: position.baseFret,
    barres: position.barres ?? [],
    frets: position.frets.map((fret) => (fret < 0 ? null : fret)),
    fingers: position.fingers ?? [],
  };
}

export function getChordShapes(root, type) {
  const dbKey = rootToDbKey(root);
  const chord = chordDatabase.chords[dbKey]?.find((item) => item.suffix === type);

  return chord?.positions.map((position, index) => normalizePosition(root, type, position, index)) ?? [];
}

export function getDiatonicChords(keyRoot, mode) {
  const rootIndex = chordRoots.findIndex((item) => item.label === keyRoot);
  const intervals = mode === "minor" ? minorIntervals : majorIntervals;
  const qualities = mode === "minor" ? minorQualities : majorQualities;

  return intervals.map((interval, index) => {
    const root = chordRoots[(rootIndex + interval) % chordRoots.length].label;
    const type = qualities[index];

    return {
      degree: ["I", "II", "III", "IV", "V", "VI", "VII"][index],
      name: chordName(root, type),
      root,
      type,
    };
  });
}
