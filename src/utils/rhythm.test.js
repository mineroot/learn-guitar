import { describe, expect, it } from "vitest";
import { eventX, generateRhythm, getBarTicks, getBeamGroups } from "./rhythm";

function barTotal(bar) {
  return bar.reduce((sum, event) => sum + event.ticks, 0);
}

describe("rhythm utilities", () => {
  it("calculates bar ticks from time signature", () => {
    expect(getBarTicks(4, 4)).toBe(48);
    expect(getBarTicks(6, 8)).toBe(36);
  });

  it("generates bars that exactly fill the requested time signature", () => {
    const pattern = generateRhythm({
      allowedIds: ["quarter"],
      bars: 3,
      timeTop: 4,
      timeBottom: 4,
      restChance: 0,
    });

    expect(pattern).toHaveLength(3);
    pattern.forEach((bar, barIndex) => {
      expect(barTotal(bar)).toBe(48);
      expect(bar.every((event) => event.id === "quarter")).toBe(true);
      expect(bar.every((event) => event.barIndex === barIndex)).toBe(true);
    });
  });

  it("falls back to hold events for impossible duration combinations", () => {
    const [bar] = generateRhythm({
      allowedIds: ["whole"],
      bars: 1,
      timeTop: 3,
      timeBottom: 4,
      restChance: 0,
    });

    expect(barTotal(bar)).toBe(36);
    expect(bar.at(-1).id).toBe("hold");
  });

  it("maps rhythm events to notation x positions", () => {
    expect(eventX({ startTick: 0, ticks: 12 }, 48)).toBeCloseTo(168);
    expect(eventX({ startTick: 36, ticks: 12 }, 48)).toBeCloseTo(792);
  });

  it("groups adjacent beamable notes", () => {
    const groups = getBeamGroups([
      { id: "eighth", isRest: false },
      { id: "sixteenth", isRest: false },
      { id: "quarter", isRest: false },
      { id: "eighth", isRest: false },
      { id: "eighth", isRest: true },
      { id: "eighth", isRest: false },
      { id: "eighth", isRest: false },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveLength(2);
    expect(groups[1]).toHaveLength(2);
  });
});
