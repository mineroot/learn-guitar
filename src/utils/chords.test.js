import { describe, expect, it } from "vitest";
import { chordName, getChordShapes, getDiatonicChords } from "./chords";

describe("chord utilities", () => {
  it("formats chord names", () => {
    expect(chordName("C", "major")).toBe("C");
    expect(chordName("A", "minor")).toBe("Am");
    expect(chordName("B", "dim")).toBe("Bdim");
  });

  it("returns diatonic chords for a major key", () => {
    expect(getDiatonicChords("C", "major").map((chord) => chord.name)).toEqual([
      "C",
      "Dm",
      "Em",
      "F",
      "G",
      "Am",
      "Bdim",
    ]);
  });

  it("loads real diminished shapes from the chord database", () => {
    const [fSharpDim] = getChordShapes("F#", "dim");
    const [eMinor] = getChordShapes("E", "minor");

    expect(fSharpDim).toBeTruthy();
    expect(fSharpDim.name).toBe("F#dim");
    expect(fSharpDim.frets).not.toEqual(eMinor.frets);
  });

  it("returns diatonic chords for a natural minor key", () => {
    expect(getDiatonicChords("A", "minor").map((chord) => chord.name)).toEqual([
      "Am",
      "Bdim",
      "C",
      "Dm",
      "Em",
      "F",
      "G",
    ]);
  });
});
