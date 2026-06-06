import { useEffect, useRef, useState } from "react";
import { PitchDetector } from "pitchy";
import { guitarStrings } from "../data/music";
import { getAudioContext } from "../utils/audio";
import { clamp } from "../utils/math";
import { correctGuitarHarmonic, findClosestString, frequencyToNote } from "../utils/pitch";

const tunerFftSize = 8192;
const detectionIntervalMs = 80;
const minClarity = 0.55;

async function getMicrophoneStream() {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: { ideal: 1 },
      },
    });
  } catch (error) {
    return navigator.mediaDevices.getUserMedia({ audio: true });
  }
}

function Tuner() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Microphone off");
  const [pitch, setPitch] = useState(null);
  const [clarity, setClarity] = useState(0);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const lastDetectionRef = useRef(0);
  const recentPitchesRef = useRef([]);

  const detected = pitch ? frequencyToNote(pitch) : null;
  const closestString = pitch ? findClosestString(pitch) : null;
  const needle = detected ? clamp(detected.cents, -50, 50) : 0;

  useEffect(() => {
    if (!isListening) return undefined;

    let mounted = true;

    async function startTuner() {
      try {
        const stream = await getMicrophoneStream();
        if (!mounted) return;

        const context = getAudioContext();
        if (context.state === "suspended") await context.resume();
        const analyser = context.createAnalyser();
        const source = context.createMediaStreamSource(stream);

        analyser.fftSize = tunerFftSize;
        analyser.smoothingTimeConstant = 0;
        const buffer = new Float32Array(analyser.fftSize);
        const detector = PitchDetector.forFloat32Array(buffer.length);
        detector.clarityThreshold = 0.8;
        detector.minVolumeAbsolute = 0.002;
        source.connect(analyser);
        audioRef.current = { context, stream, analyser, buffer };
        setStatus("Listening");

        const detect = (time = 0) => {
          if (time - lastDetectionRef.current >= detectionIntervalMs) {
            analyser.getFloatTimeDomainData(buffer);
            const [frequency, detectedClarity] = detector.findPitch(buffer, context.sampleRate);
            const corrected = detectedClarity >= minClarity ? correctGuitarHarmonic(frequency) : null;

            if (corrected) {
              recentPitchesRef.current = [...recentPitchesRef.current.slice(-4), corrected];
              const sorted = [...recentPitchesRef.current].sort((a, b) => a - b);
              setPitch(sorted[Math.floor(sorted.length / 2)]);
            } else {
              recentPitchesRef.current = [];
              setPitch(null);
            }

            setClarity(detectedClarity);
            lastDetectionRef.current = time;
          }

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
      recentPitchesRef.current = [];
      setClarity(0);
    };
  }, [isListening]);

  return (
    <section className="tool-grid" aria-label="Tuner">
      <div className="workspace tuner-workspace">
        <div className="tuner-note">
          <span>{detected ? `${detected.name}${detected.octave}` : "--"}</span>
          <small>{pitch ? `${pitch.toFixed(1)} Hz · ${Math.round(clarity * 100)}%` : status}</small>
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
