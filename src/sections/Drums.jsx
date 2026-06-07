import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultDrumPatternId, defaultDrumStyleId, defaultDrumTone, drumStyles, drumVoices } from "../data/drums";
import { createDrumFallback, ensureAudioContext, playDrumVoice, unlockAudio } from "../utils/audio";
import { isTypingOrAdjusting } from "../utils/dom";
import { getActiveVoices, getDrumPattern, getDrumStyle, getStepMs, hasVoiceOnStep } from "../utils/drums";
import { clamp } from "../utils/math";

function Drums() {
  const [styleId, setStyleId] = useState(defaultDrumStyleId);
  const [patternId, setPatternId] = useState(defaultDrumPatternId);
  const [bpm, setBpm] = useState(96);
  const [tone, setTone] = useState(defaultDrumTone);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const audioContextRef = useRef(null);
  const drumFallbackRef = useRef(null);
  const intervalRef = useRef(null);
  const stepRef = useRef(0);

  const style = getDrumStyle(styleId);
  const pattern = getDrumPattern(style, patternId);
  const stepMs = useMemo(() => getStepMs(bpm), [bpm]);
  const beatNumber = Math.floor(currentStep / 4) + 1;

  const chooseStyle = (nextStyleId) => {
    const nextStyle = getDrumStyle(nextStyleId);

    setStyleId(nextStyle.id);
    setPatternId(nextStyle.patterns[0].id);
  };

  const updateTone = (key, value) => {
    setTone((current) => ({ ...current, [key]: Number(value) }));
  };

  const togglePlayback = useCallback(async () => {
    if (!isPlaying) {
      if (!drumFallbackRef.current) drumFallbackRef.current = createDrumFallback();
      drumFallbackRef.current.unlock();
      const context = ensureAudioContext(audioContextRef);
      unlockAudio(context);
    }

    setIsPlaying((playing) => !playing);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const playStep = () => {
      const step = stepRef.current;
      const context = audioContextRef.current;
      const useWebAudio = context?.state === "running";
      const voices = getActiveVoices(pattern.steps, step);

      voices.forEach((voiceId) => {
        if (useWebAudio) {
          playDrumVoice(context, voiceId, tone);
        } else {
          drumFallbackRef.current?.play(voiceId);
        }
      });

      setCurrentStep(step);
      stepRef.current = (step + 1) % pattern.steps.length;
    };

    playStep();
    intervalRef.current = window.setInterval(playStep, stepMs);
    return () => window.clearInterval(intervalRef.current);
  }, [isPlaying, pattern.steps, stepMs, tone]);

  useEffect(() => {
    stepRef.current = 0;
    setCurrentStep(0);
  }, [patternId, styleId]);

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
    <section className="drums-section" aria-label="Drums">
      <div className="drums-stage">
        <div className="drums-header">
          <div>
            <p className="eyebrow">Drum groove</p>
            <h2>{style.label}</h2>
            <span>{pattern.label} - {style.feel}</span>
          </div>
          <button className="primary-action" onClick={togglePlayback} type="button">
            {isPlaying ? "Stop" : "Start"}
          </button>
        </div>

        <div className="drum-readout" aria-live="polite">
          <span>{bpm}</span>
          <small>BPM - Beat {beatNumber}</small>
        </div>

        <div className="drum-machine" aria-label={`${style.label} ${pattern.label} drum pattern`}>
          <div className="drum-machine-labels">
            {drumVoices.map((voice) => (
              <span key={voice.id}>{voice.label}</span>
            ))}
          </div>
          <div className="drum-steps">
            {drumVoices.map((voice) => (
              <div className="drum-step-row" key={voice.id}>
                {pattern.steps.map((_, stepIndex) => {
                  const active = hasVoiceOnStep(pattern.steps, stepIndex, voice.id);
                  const playing = isPlaying && currentStep === stepIndex;

                  return (
                    <i
                      className={`${active ? "active" : ""} ${playing ? "playing" : ""}`}
                      key={stepIndex}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="drums-controls" aria-label="Drum controls">
        <label>
          <span>Tempo</span>
          <input
            max="220"
            min="50"
            onChange={(event) => setBpm(Number(event.target.value))}
            type="range"
            value={bpm}
          />
          <strong>{bpm} BPM</strong>
        </label>

        <div className="stepper">
          <span>Tempo</span>
          <button onClick={() => setBpm((value) => clamp(value - 1, 50, 220))} type="button">
            -
          </button>
          <strong>{bpm}</strong>
          <button onClick={() => setBpm((value) => clamp(value + 1, 50, 220))} type="button">
            +
          </button>
        </div>

        <div className="style-picks" aria-label="Drum styles">
          {drumStyles.map((item) => (
            <button
              className={styleId === item.id ? "active" : ""}
              key={item.id}
              onClick={() => chooseStyle(item.id)}
              type="button"
            >
              <strong>{item.label}</strong>
              <span>{item.feel}</span>
            </button>
          ))}
        </div>

        <div className="pattern-picks" aria-label="Drum patterns">
          {style.patterns.map((item) => (
            <button
              className={pattern.id === item.id ? "active" : ""}
              key={item.id}
              onClick={() => setPatternId(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="tone-controls" aria-label="Drum tone">
          {[
            ["bass", "Bass"],
            ["mid", "Mid"],
            ["treble", "Treble"],
            ["presence", "Presence"],
          ].map(([key, label]) => (
            <label key={key}>
              <span>{label}</span>
              <input
                max="8"
                min="-8"
                onChange={(event) => updateTone(key, event.target.value)}
                type="range"
                value={tone[key]}
              />
              <strong>{tone[key] > 0 ? `+${tone[key]}` : tone[key]} dB</strong>
            </label>
          ))}
        </div>
      </aside>
    </section>
  );
}

export default Drums;
