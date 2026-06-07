import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClickFallback, ensureAudioContext, playPulse, unlockAudio } from "../utils/audio";
import { isTypingOrAdjusting } from "../utils/dom";
import { clamp } from "../utils/math";

function Metronome() {
  const [bpm, setBpm] = useState(90);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [subdivision, setSubdivision] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const audioContextRef = useRef(null);
  const clickFallbackRef = useRef(null);
  const intervalRef = useRef(null);
  const beatRef = useRef(0);

  const intervalMs = useMemo(() => 60000 / bpm / subdivision, [bpm, subdivision]);

  const togglePlayback = useCallback(async () => {
    if (!isPlaying) {
      if (!clickFallbackRef.current) clickFallbackRef.current = createClickFallback();
      clickFallbackRef.current.unlock();
      clickFallbackRef.current.play(true);
      const context = ensureAudioContext(audioContextRef);
      unlockAudio(context);
    }

    setIsPlaying((playing) => !playing);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const playClick = () => {
      const context = audioContextRef.current;
      if (!context) return;
      const isDownbeat = beatRef.current % (beatsPerBar * subdivision) === 0;

      playPulse(context, isDownbeat ? 1320 : 880, isDownbeat ? 0.18 : 0.1, 0.055);
      clickFallbackRef.current?.play(isDownbeat);

      setCurrentBeat(Math.floor(beatRef.current / subdivision) % beatsPerBar);
      beatRef.current = (beatRef.current + 1) % (beatsPerBar * subdivision);
    };

    playClick();
    intervalRef.current = window.setInterval(playClick, intervalMs);
    return () => window.clearInterval(intervalRef.current);
  }, [beatsPerBar, intervalMs, isPlaying, subdivision]);

  useEffect(() => {
    beatRef.current = 0;
    setCurrentBeat(0);
  }, [beatsPerBar, subdivision]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code !== "Space" || event.repeat || isTypingOrAdjusting(event.target)) return;

      event.preventDefault();
      togglePlayback();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayback]);

  return (
    <section className="tool-grid" aria-label="Metronome">
      <div className="workspace">
        <div className="tempo-readout">
          <span>{bpm}</span>
          <small>BPM</small>
        </div>
        <div className="beat-row" aria-label="Beat indicator">
          {Array.from({ length: beatsPerBar }).map((_, index) => (
            <i className={isPlaying && currentBeat === index ? "lit" : ""} key={index} />
          ))}
        </div>
        <button
          className="primary-action"
          onClick={togglePlayback}
          type="button"
        >
          {isPlaying ? "Stop" : "Start"}
        </button>
      </div>

      <aside className="controls" aria-label="Metronome controls">
        <label>
          <span>Tempo</span>
          <input
            max="240"
            min="40"
            onChange={(event) => setBpm(Number(event.target.value))}
            type="range"
            value={bpm}
          />
        </label>
        <div className="stepper">
          <span>Beats</span>
          <button onClick={() => setBeatsPerBar((value) => clamp(value - 1, 2, 12))} type="button">
            -
          </button>
          <strong>{beatsPerBar}</strong>
          <button onClick={() => setBeatsPerBar((value) => clamp(value + 1, 2, 12))} type="button">
            +
          </button>
        </div>
        <div className="segmented" aria-label="Subdivision">
          {[1, 2, 4].map((value) => (
            <button
              className={subdivision === value ? "active" : ""}
              key={value}
              onClick={() => setSubdivision(value)}
              type="button"
            >
              {value === 1 ? "Quarter" : value === 2 ? "Eighth" : "Sixteenth"}
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}

export default Metronome;
