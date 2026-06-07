import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultRhythmDurations, rhythmDurations } from "../data/rhythm";
import { ensureAudioContext, playPulse, unlockAudio } from "../utils/audio";
import { clamp } from "../utils/math";
import { generateRhythm, getBarTicks } from "../utils/rhythm";
import RhythmNotationBar from "./rhythm/RhythmNotationBar";

function RhythmGenerator() {
  const [bpm, setBpm] = useState(90);
  const [timeTop, setTimeTop] = useState(4);
  const [timeBottom, setTimeBottom] = useState(4);
  const [bars, setBars] = useState(2);
  const [allowedIds, setAllowedIds] = useState(defaultRhythmDurations);
  const [restChance, setRestChance] = useState(20);
  const [repeat, setRepeat] = useState(true);
  const [metronome, setMetronome] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionTick, setPositionTick] = useState(0);
  const [pattern, setPattern] = useState(() =>
    generateRhythm({
      allowedIds: defaultRhythmDurations,
      bars: 2,
      timeTop: 4,
      timeBottom: 4,
      restChance: 20,
    }),
  );
  const audioContextRef = useRef(null);
  const tickIntervalRef = useRef(null);
  const positionRef = useRef(0);

  const barTicks = getBarTicks(timeTop, timeBottom);
  const totalTicks = barTicks * bars;
  const flatEvents = useMemo(() => pattern.flat(), [pattern]);
  const tickMs = useMemo(() => (60 / bpm / 12) * 1000, [bpm]);

  const togglePlayback = async () => {
    if (!isPlaying) {
      const context = await ensureAudioContext(audioContextRef);
      unlockAudio(context);
    }

    setIsPlaying((playing) => !playing);
  };

  const regenerate = useCallback(() => {
    const safeAllowedIds = allowedIds.length ? allowedIds : ["quarter"];
    setPattern(generateRhythm({ allowedIds: safeAllowedIds, bars, timeTop, timeBottom, restChance }));
    positionRef.current = 0;
    setPositionTick(0);
  }, [allowedIds, bars, restChance, timeBottom, timeTop]);

  useEffect(() => {
    regenerate();
    setIsPlaying(false);
  }, [regenerate]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const context = audioContextRef.current;
    if (!context) return undefined;

    tickIntervalRef.current = window.setInterval(() => {
      const tick = positionRef.current;
      const event = flatEvents.find((item) => item.barIndex * barTicks + item.startTick === tick);
      const isBeat = tick % 12 === 0;
      const isBarStart = tick % barTicks === 0;

      if (event && !event.isRest) playPulse(context, isBarStart ? 1180 : 760, isBarStart ? 0.18 : 0.13, 0.045);
      if (metronome && isBeat) playPulse(context, isBarStart ? 1500 : 980, isBarStart ? 0.08 : 0.045, 0.035);

      const nextTick = tick + 1;
      if (nextTick >= totalTicks) {
        if (repeat) {
          positionRef.current = 0;
          setPositionTick(0);
        } else {
          setIsPlaying(false);
          positionRef.current = 0;
          setPositionTick(0);
        }
        return;
      }

      positionRef.current = nextTick;
      setPositionTick(nextTick);
    }, tickMs);

    return () => window.clearInterval(tickIntervalRef.current);
  }, [barTicks, flatEvents, isPlaying, metronome, repeat, tickMs, totalTicks]);

  const toggleDuration = (id) => {
    setAllowedIds((current) => {
      if (current.includes(id)) {
        return current.length === 1 ? current : current.filter((item) => item !== id);
      }

      return [...current, id];
    });
  };

  return (
    <section className="rhythm-section" aria-label="Rhythm generator">
      <div className="rhythm-stage">
        <div className="rhythm-header">
          <div>
            <p className="eyebrow">Generated rhythm</p>
            <h2>
              {timeTop}/{timeBottom}
            </h2>
          </div>
          <button
            className="primary-action"
            onClick={togglePlayback}
            type="button"
          >
            {isPlaying ? "Stop" : "Play"}
          </button>
        </div>

        <div className="rhythm-bars">
          {pattern.map((bar, barIndex) => (
            <RhythmNotationBar
              bar={bar}
              barIndex={barIndex}
              barTicks={barTicks}
              isPlaying={isPlaying}
              key={barIndex}
              positionTick={positionTick}
              timeBottom={timeBottom}
              timeTop={timeTop}
            />
          ))}
        </div>
      </div>

      <aside className="rhythm-controls" aria-label="Rhythm controls">
        <label>
          <span>Tempo</span>
          <input
            max="220"
            min="40"
            onChange={(event) => setBpm(Number(event.target.value))}
            type="range"
            value={bpm}
          />
          <strong>{bpm} BPM</strong>
        </label>

        <div className="control-row">
          <label>
            <span>Time</span>
            <select onChange={(event) => setTimeTop(Number(event.target.value))} value={timeTop}>
              {[2, 3, 4, 5, 6, 7].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Beat</span>
            <select onChange={(event) => setTimeBottom(Number(event.target.value))} value={timeBottom}>
              {[4, 8, 16].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="stepper">
          <span>Bars</span>
          <button onClick={() => setBars((value) => clamp(value - 1, 1, 8))} type="button">
            -
          </button>
          <strong>{bars}</strong>
          <button onClick={() => setBars((value) => clamp(value + 1, 1, 8))} type="button">
            +
          </button>
        </div>

        <label>
          <span>Rests</span>
          <input
            max="60"
            min="0"
            onChange={(event) => setRestChance(Number(event.target.value))}
            type="range"
            value={restChance}
          />
          <strong>{restChance}%</strong>
        </label>

        <div className="duration-picks" aria-label="Allowed note types">
          {rhythmDurations.map((duration) => (
            <button
              className={allowedIds.includes(duration.id) ? "active" : ""}
              key={duration.id}
              onClick={() => toggleDuration(duration.id)}
              type="button"
            >
              <strong>{duration.notation}</strong>
              <span>{duration.label}</span>
            </button>
          ))}
        </div>

        <label className="toggle-line">
          <input
            checked={repeat}
            onChange={(event) => setRepeat(event.target.checked)}
            type="checkbox"
          />
          <span>Repeat pattern</span>
        </label>
        <label className="toggle-line">
          <input
            checked={metronome}
            onChange={(event) => setMetronome(event.target.checked)}
            type="checkbox"
          />
          <span>Metronome overlay</span>
        </label>

        <button className="ghost-action" onClick={regenerate} type="button">
          Generate new rhythm
        </button>
      </aside>
    </section>
  );
}

export default RhythmGenerator;
