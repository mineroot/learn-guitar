import { eventX, getBeamGroups } from "../../utils/rhythm";
import { NoteShape, RestShape } from "./NotationShapes";

function RhythmNotationBar({ bar, barIndex, barTicks, isPlaying, positionTick, timeTop, timeBottom }) {
  const beamGroups = getBeamGroups(bar);

  return (
    <div className="rhythm-bar">
      <span className="bar-number">{barIndex + 1}</span>
      <svg className="notation-bar" viewBox="0 0 960 112" role="img" aria-label={`Rhythm bar ${barIndex + 1}`}>
        {Array.from({ length: timeTop + 1 }).map((_, index) => {
          const x = 42 + (index / timeTop) * 876;
          const isBarLine = index === 0 || index === timeTop;

          return (
            <line
              className={isBarLine ? "bar-line" : "beat-line"}
              key={index}
              x1={x}
              x2={x}
              y1="26"
              y2="90"
            />
          );
        })}
        {[34, 46, 58, 70, 82].map((y) => (
          <line className="staff-line" key={y} x1="42" x2="918" y1={y} y2={y} />
        ))}
        {barIndex === 0 && (
          <text className="time-signature" x="19" y="54">
            <tspan x="19" dy="0">{timeTop}</tspan>
            <tspan x="19" dy="22">{timeBottom}</tspan>
          </text>
        )}
        {beamGroups.map((group) => {
          const firstX = eventX(group[0], barTicks) + 9;
          const lastX = eventX(group[group.length - 1], barTicks) + 9;
          const needsSecondBeam = group.some((event) => event.id === "sixteenth");

          return (
            <g className="beam-group" key={`${group[0].startTick}-${group[group.length - 1].startTick}`}>
              <line x1={firstX} x2={lastX} y1="25" y2="25" />
              {needsSecondBeam && <line x1={firstX} x2={lastX} y1="33" y2="33" />}
            </g>
          );
        })}
        {bar.map((event) => {
          const absoluteTick = event.barIndex * barTicks + event.startTick;
          const active = isPlaying && positionTick >= absoluteTick && positionTick < absoluteTick + event.ticks;
          const x = eventX(event, barTicks);
          const beamed = beamGroups.some((group) => group.includes(event));

          return event.isRest ? (
            <RestShape active={active} event={event} key={`${event.barIndex}-${event.startTick}`} x={x} />
          ) : (
            <NoteShape active={active} beamed={beamed} event={event} key={`${event.barIndex}-${event.startTick}`} x={x} />
          );
        })}
      </svg>
    </div>
  );
}

export default RhythmNotationBar;
