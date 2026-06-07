import guitarChords from "@tombatossals/chords-db/lib/guitar.json";

export const chordDatabase = guitarChords;

export const chordRoots = [
  { label: "C", dbKey: "C" },
  { label: "C#", dbKey: "Csharp" },
  { label: "D", dbKey: "D" },
  { label: "Eb", dbKey: "Eb" },
  { label: "E", dbKey: "E" },
  { label: "F", dbKey: "F" },
  { label: "F#", dbKey: "Fsharp" },
  { label: "G", dbKey: "G" },
  { label: "Ab", dbKey: "Ab" },
  { label: "A", dbKey: "A" },
  { label: "Bb", dbKey: "Bb" },
  { label: "B", dbKey: "B" },
];

export const chordTypes = [
  { id: "major", label: "Major", suffix: "" },
  { id: "minor", label: "Minor", suffix: "m" },
  { id: "dim", label: "Diminished", suffix: "dim" },
  { id: "7", label: "Dominant 7", suffix: "7" },
  { id: "maj7", label: "Major 7", suffix: "maj7" },
  { id: "m7", label: "Minor 7", suffix: "m7" },
  { id: "sus2", label: "Sus2", suffix: "sus2" },
  { id: "sus4", label: "Sus4", suffix: "sus4" },
  { id: "add9", label: "Add9", suffix: "add9" },
];
