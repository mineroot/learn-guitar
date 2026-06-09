import { useEffect, useRef, useState } from "react";
import { PitchDetector } from "pitchy";
import { getAudioContext } from "../utils/audio";
import { clamp } from "../utils/math";
import { frequencyToNote, getSignalLevel } from "../utils/pitch";

const tunerFftSize = 32768;
const detectionIntervalMs = 110;
const inputGain = 8;
const minClarity = 0.5;
const minSignalLevel = 0.0015;
const minPitchHz = 55;
const maxPitchHz = 2200;

async function getMicrophoneStream() {
  return navigator.mediaDevices.getUserMedia({ audio: true });
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
        const highpass = context.createBiquadFilter();
        const lowpass = context.createBiquadFilter();
        const gain = context.createGain();

        analyser.fftSize = tunerFftSize;
        analyser.smoothingTimeConstant = 0;
        highpass.type = "highpass";
        highpass.frequency.value = minPitchHz;
        lowpass.type = "lowpass";
        lowpass.frequency.value = maxPitchHz;
        gain.gain.value = inputGain;

        const timeBuffer = new Float32Array(analyser.fftSize);
        const detector = PitchDetector.forFloat32Array(timeBuffer.length);
        detector.clarityThreshold = 0.7;
        detector.minVolumeAbsolute = 0.0005;
        detector.maxInputAmplitude = inputGain;

        source.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(gain);
        gain.connect(analyser);
        audioRef.current = { context, stream, analyser, timeBuffer };
        setStatus("Listening");

        const detect = (time = 0) => {
          if (time - lastDetectionRef.current >= detectionIntervalMs) {
            analyser.getFloatTimeDomainData(timeBuffer);

            const signalLevel = getSignalLevel(timeBuffer);
            const [frequency, detectedClarity] = detector.findPitch(timeBuffer, context.sampleRate);
            const chromaticFrequency =
              detectedClarity >= minClarity &&
              signalLevel >= minSignalLevel &&
              frequency >= minPitchHz &&
              frequency <= maxPitchHz
                ? frequency
                : null;

            if (chromaticFrequency) {
              recentPitchesRef.current = [...recentPitchesRef.current.slice(-4), chromaticFrequency];
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
    <section className="tool-grid tuner-grid" aria-label="Tuner">
      <div className="workspace tuner-workspace">
        <div className="tuner-note">
          <span>{detected ? `${detected.displayName}${detected.octave}` : "--"}</span>
          <small>
            {pitch
              ? `${pitch.toFixed(1)} Hz · ${Math.round(clarity * 100)}%`
              : isListening
                ? status
                : status}
          </small>
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
          {!detected ? "Play a note or chord" : Math.abs(needle) <= 5 ? "On pitch" : needle < 0 ? "Flat" : "Sharp"}
        </p>
        <button
          className="primary-action"
          onClick={() => setIsListening((listening) => !listening)}
          type="button"
        >
          {isListening ? "Stop listening" : "Start tuner"}
        </button>
      </div>
    </section>
  );
}

export default Tuner;
