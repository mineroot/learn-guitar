import { rhythmDurations, ticksPerWholeNote } from "../data/rhythm";

export function getBarTicks(timeTop, timeBottom) {
  return timeTop * (ticksPerWholeNote / timeBottom);
}

function canFillTicks(remainingTicks, allowedTicks, memo = new Set()) {
  if (remainingTicks === 0) return true;
  if (remainingTicks < 0 || memo.has(remainingTicks)) return false;

  for (const ticks of allowedTicks) {
    if (canFillTicks(remainingTicks - ticks, allowedTicks, memo)) return true;
  }

  memo.add(remainingTicks);
  return false;
}

export function generateRhythm({ allowedIds, bars, timeTop, timeBottom, restChance }) {
  const allowed = rhythmDurations
    .filter((duration) => allowedIds.includes(duration.id))
    .sort((a, b) => b.ticks - a.ticks);
  const safeAllowed = allowed.length ? allowed : rhythmDurations.filter((duration) => duration.id === "quarter");
  const allowedTicks = safeAllowed.map((duration) => duration.ticks);
  const barTicks = getBarTicks(timeTop, timeBottom);

  return Array.from({ length: bars }, (_, barIndex) => {
    const events = [];
    let remaining = barTicks;
    let startTick = 0;

    while (remaining > 0) {
      const candidates = safeAllowed.filter(
        (duration) =>
          duration.ticks <= remaining && canFillTicks(remaining - duration.ticks, allowedTicks),
      );
      const fallback = safeAllowed.find((duration) => duration.ticks <= remaining) ?? {
        id: "hold",
        label: "Hold",
        notation: "--",
        ticks: remaining,
      };
      const duration = candidates[Math.floor(Math.random() * candidates.length)] ?? fallback;
      const isRest = startTick > 0 && Math.random() * 100 < restChance;

      events.push({ ...duration, barIndex, startTick, isRest });
      startTick += duration.ticks;
      remaining -= duration.ticks;
    }

    return events;
  });
}

export function eventX(event, barTicks) {
  return 64 + ((event.startTick + event.ticks / 2) / barTicks) * 832;
}

export function getBeamGroups(bar) {
  const groups = [];
  let group = [];

  bar.forEach((event) => {
    const canBeam =
      !event.isRest && (event.id === "eighth" || event.id === "sixteenth" || event.id === "eighthTriplet");

    if (!canBeam) {
      if (group.length > 1) groups.push(group);
      group = [];
      return;
    }

    group.push(event);
  });

  if (group.length > 1) groups.push(group);
  return groups;
}
