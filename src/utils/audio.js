export function getAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  return new AudioContext();
}

export function playPulse(context, frequency, volume = 0.12, length = 0.05) {
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
