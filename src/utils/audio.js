export function getAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  return new AudioContext();
}

function makeClickDataUrl(frequency, volume = 0.6, length = 0.055) {
  const sampleRate = 44100;
  const samples = Math.floor(sampleRate * length);
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + samples * 2);
  const view = new DataView(buffer);

  const writeString = (offset, value) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples * 2, true);

  for (let index = 0; index < samples; index += 1) {
    const envelope = 1 - index / samples;
    const sample = Math.sin((2 * Math.PI * frequency * index) / sampleRate) * volume * envelope;
    view.setInt16(headerSize + index * 2, Math.max(-1, Math.min(1, sample)) * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);

  return `data:audio/wav;base64,${btoa(binary)}`;
}

function createFallbackClick(frequency) {
  const audio = new Audio(makeClickDataUrl(frequency));
  audio.preload = "auto";
  audio.playsInline = true;
  return audio;
}

export function createClickFallback() {
  const low = createFallbackClick(880);
  const high = createFallbackClick(1320);

  return {
    unlock() {
      [low, high].forEach((audio) => {
        audio.muted = true;
        audio.currentTime = 0;
        audio.play()
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.muted = false;
          })
          .catch(() => {
            audio.muted = false;
          });
      });
    },
    play(isHigh = false) {
      const audio = isHigh ? high : low;
      audio.muted = false;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    },
  };
}

export function ensureAudioContext(audioContextRef) {
  if (!audioContextRef.current) audioContextRef.current = getAudioContext();

  if (audioContextRef.current.state === "suspended") {
    audioContextRef.current.resume().catch(() => {});
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
