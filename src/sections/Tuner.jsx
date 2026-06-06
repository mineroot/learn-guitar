import { useEffect, useRef, useState } from "react";
import { guitarStrings } from "../data/music";
import { getAudioContext } from "../utils/audio";
import { clamp } from "../utils/math";
import { autoCorrelate, findClosestString, frequencyToNote } from "../utils/pitch";

function Tuner() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Microphone off");
  const [pitch, setPitch] = useState(null);
  const audioRef = useRef(null);
  const animationRef = useRef(null);

  const detected = pitch ? frequencyToNote(pitch) : null;
  const closestString = pitch ? findClosestString(pitch) : null;
  const needle = detected ? clamp(detected.cents, -50, 50) : 0;

  useEffect(() => {
    if (!isListening) return undefined;

    let mounted = true;

    async function startTuner() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        if (!mounted) return;

        const context = getAudioContext();
        const analyser = context.createAnalyser();
        const source = context.createMediaStreamSource(stream);
        const buffer = new Float32Array(analyser.fftSize);

        analyser.fftSize = 2048;
        source.connect(analyser);
        audioRef.current = { context, stream, analyser, buffer };
        setStatus("Listening");

        const detect = () => {
          analyser.getFloatTimeDomainData(buffer);
          const frequency = autoCorrelate(buffer, context.sampleRate);
          setPitch(frequency && frequency > 55 && frequency < 1000 ? frequency : null);
          animationRef.current = requestAnimationFrame(detect);
        };

        detect();
      } catch (error) {
        setStatus("Microphone permission needed");
        setIsListening(false);
      }
    }

    startTuner();

    return () => {
      mounted = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioRef.current) {
        audioRef.current.stream.getTracks().forEach((track) => track.stop());
        audioRef.current.context.close();
        audioRef.current = null;
      }
    };
  }, [isListening]);

  return (
    <section className="tool-grid" aria-label="Tuner">
      <div className="workspace tuner-workspace">
        <div className="tuner-note">
          <span>{detected ? `${detected.name}${detected.octave}` : "--"}</span>
          <small>{pitch ? `${pitch.toFixed(1)} Hz` : status}</small>
        </div>
        <div className="meter" aria-label="Tuning meter">
          <span>-50</span>
          <div className="meter-track">
            <i style={{ transform: `translateX(${needle * 2.4}px) rotate(${needle / 3}deg)` }} />
            <b />
          </div>
          <span>+50</span>
        </div>
        <p className={Math.abs(needle) <= 5 && detected ? "tuning-state good" : "tuning-state"}>
          {!detected ? "Play a single string" : Math.abs(needle) <= 5 ? "In tune" : needle < 0 ? "Tune up" : "Tune down"}
        </p>
        <button
          className="primary-action"
          onClick={() => setIsListening((listening) => !listening)}
          type="button"
        >
          {isListening ? "Stop listening" : "Start tuner"}
        </button>
      </div>

      <aside className="controls string-list" aria-label="Standard tuning reference">
        {guitarStrings.map((string) => (
          <div className={closestString?.name === string.name ? "string active" : "string"} key={string.name}>
            <span>{string.name}</span>
            <strong>{string.hz.toFixed(2)} Hz</strong>
          </div>
        ))}
      </aside>
    </section>
  );
}

export default Tuner;
