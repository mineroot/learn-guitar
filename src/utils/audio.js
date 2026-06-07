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

function makeDrumDataUrl(voiceId) {
  const sampleRate = 44100;
  const settings = {
    kick: { length: 0.26, volume: 0.95 },
    snare: { length: 0.16, volume: 0.72 },
    hat: { length: 0.08, volume: 0.38 },
    clap: { length: 0.18, volume: 0.62 },
    rim: { length: 0.08, volume: 0.46 },
  }[voiceId] ?? { length: 0.1, volume: 0.5 };
  const samples = Math.floor(sampleRate * settings.length);
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + samples * 2);
  const view = new DataView(buffer);
  let noiseSeed = 1;

  const noise = () => {
    noiseSeed = (noiseSeed * 16807) % 2147483647;
    return (noiseSeed / 2147483647) * 2 - 1;
  };
  const writeString = (offset, value) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset, value.charCodeAt(index));
      offset += 1;
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
    const progress = index / samples;
    const envelope = (1 - progress) ** (voiceId === "kick" ? 2.2 : 1.1);
    let sample = 0;

    if (voiceId === "kick") {
      const frequency = 48 + (1 - progress) ** 4 * 86;
      sample = Math.sin((2 * Math.PI * frequency * index) / sampleRate) * envelope;
    } else if (voiceId === "snare") {
      sample = noise() * envelope + Math.sin((2 * Math.PI * 190 * index) / sampleRate) * envelope * 0.32;
    } else if (voiceId === "hat") {
      sample = noise() * envelope * (index % 2 ? 1 : -0.6);
    } else if (voiceId === "clap") {
      const pulse = progress < 0.025 || (progress > 0.055 && progress < 0.085) || progress > 0.12 ? 1 : 0.25;
      sample = noise() * envelope * pulse;
    } else {
      sample = Math.sin((2 * Math.PI * 860 * index) / sampleRate) * envelope;
    }

    view.setInt16(headerSize + index * 2, Math.max(-1, Math.min(1, sample * settings.volume)) * 32767, true);
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

export function createDrumFallback() {
  const voices = ["kick", "snare", "hat", "clap", "rim"].reduce((items, voiceId) => {
    const audio = new Audio(makeDrumDataUrl(voiceId));
    audio.preload = "auto";
    audio.playsInline = true;
    return { ...items, [voiceId]: audio };
  }, {});

  return {
    unlock() {
      Object.values(voices).forEach((audio) => {
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
    play(voiceId) {
      const audio = voices[voiceId];
      if (!audio) return;

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

function getToneGain(tone, key) {
  return Math.max(-8, Math.min(8, Number(tone?.[key] ?? 0)));
}

function createToneOutput(context, tone) {
  const input = context.createGain();
  const bass = context.createBiquadFilter();
  const mid = context.createBiquadFilter();
  const treble = context.createBiquadFilter();
  const presence = context.createBiquadFilter();

  bass.type = "lowshelf";
  bass.frequency.value = 120;
  bass.gain.value = getToneGain(tone, "bass");

  mid.type = "peaking";
  mid.frequency.value = 900;
  mid.Q.value = 0.9;
  mid.gain.value = getToneGain(tone, "mid");

  treble.type = "highshelf";
  treble.frequency.value = 4200;
  treble.gain.value = getToneGain(tone, "treble");

  presence.type = "peaking";
  presence.frequency.value = 7200;
  presence.Q.value = 1.1;
  presence.gain.value = getToneGain(tone, "presence");

  input.connect(bass);
  bass.connect(mid);
  mid.connect(treble);
  treble.connect(presence);
  presence.connect(context.destination);

  return input;
}

function playToneNoiseHit(context, { length, volume, filterFrequency, filterType = "bandpass", tone }) {
  const samples = Math.floor(context.sampleRate * length);
  const buffer = context.createBuffer(1, samples, context.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < samples; index += 1) {
    const envelope = 1 - index / samples;
    channel[index] = (Math.random() * 2 - 1) * envelope;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  filter.type = filterType;
  filter.frequency.value = filterFrequency;
  gain.gain.setValueAtTime(volume, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + length);
  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(createToneOutput(context, tone));
  source.start(context.currentTime);
  source.stop(context.currentTime + length);
}

function playTonePulse(context, frequency, volume, length, tone) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "square";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + length);
  oscillator.connect(gain);
  gain.connect(createToneOutput(context, tone));
  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + length);
}

export function playDrumVoice(context, voiceId, tone = {}) {
  if (context.state !== "running") return;

  if (voiceId === "kick") {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(138, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(46, context.currentTime + 0.18);
    gain.gain.setValueAtTime(0.72, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.26);
    oscillator.connect(gain);
    gain.connect(createToneOutput(context, tone));
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.27);
    return;
  }

  if (voiceId === "snare") {
    playToneNoiseHit(context, { length: 0.15, volume: 0.32, filterFrequency: 1700, tone });
    playTonePulse(context, 190, 0.09, 0.11, tone);
    return;
  }

  if (voiceId === "hat") {
    playToneNoiseHit(context, { length: 0.065, volume: 0.12, filterFrequency: 7200, filterType: "highpass", tone });
    return;
  }

  if (voiceId === "clap") {
    [0, 0.022, 0.046].forEach((delay) => {
      window.setTimeout(() => {
        playToneNoiseHit(context, { length: 0.075, volume: 0.16, filterFrequency: 2400, tone });
      }, delay * 1000);
    });
    return;
  }

  if (voiceId === "rim") {
    playTonePulse(context, 860, 0.12, 0.04, tone);
  }
}
