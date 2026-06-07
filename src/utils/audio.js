export function getAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  return new AudioContext();
}

export async function ensureAudioContext(audioContextRef) {
  if (!audioContextRef.current) audioContextRef.current = getAudioContext();

  if (audioContextRef.current.state === "suspended") {
    await audioContextRef.current.resume();
  }

  return audioContextRef.current;
}

export function unlockAudio(context) {
  const buffer = context.createBuffer(1, 1, context.sampleRate);
  const source = context.createBufferSource();

  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}

export function playPulse(context, frequency, volume = 0.12, length = 0.05) {
  if (context.state !== "running") return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "square";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + length);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + length);
}
