import { describe, expect, it } from "vitest";
import { drumStyles } from "../data/drums";
import { drumStepsPerBar, getActiveVoices, getDrumPattern, getDrumStyle, getStepMs, hasVoiceOnStep } from "./drums";

describe("drum utilities", () => {
  it("keeps every drum pattern to one bar of sixteenths", () => {
    drumStyles.forEach((style) => {
      expect(style.patterns.length).toBeGreaterThan(1);
      style.patterns.forEach((pattern) => {
        expect(pattern.steps).toHaveLength(drumStepsPerBar);
      });
    });
  });

  it("includes a metal style", () => {
    expect(drumStyles.some((style) => style.id === "metal")).toBe(true);
  });

  it("falls back to the default style for unknown ids", () => {
    expect(getDrumStyle("missing").id).toBe("rock");
  });

  it("falls back to the first pattern for unknown pattern ids", () => {
    const style = getDrumStyle("metal");

    expect(getDrumPattern(style, "missing").id).toBe(style.patterns[0].id);
  });

  it("calculates sixteenth-note timing from tempo", () => {
    expect(getStepMs(120)).toBe(125);
  });

  it("returns known voices for wrapped steps", () => {
    const pattern = [["kick", "ghost"], ["snare"]];

    expect(getActiveVoices(pattern, 2)).toEqual(["kick"]);
    expect(hasVoiceOnStep(pattern, 1, "snare")).toBe(true);
  });
});
