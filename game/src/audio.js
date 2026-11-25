// Kitchen sounds made from oscillators and filtered noise, so the game
// ships no audio files and still sizzles, chops and rings the pass bell.

let context = null;
let master = null;

function ensureAudio() {
  if (context) return context;
  const Factory = window.AudioContext || window.webkitAudioContext;
  if (!Factory) return null;
  context = new Factory();
  master = context.createGain();
  master.gain.value = 0.35;
  master.connect(context.destination);
  return context;
}

function tone(freq, seconds, type = 'sine', gain = 0.5, slideTo = null) {
  const ctx = ensureAudio();
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const now = ctx.currentTime;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + seconds);
  amp.gain.setValueAtTime(gain, now);
  amp.gain.exponentialRampToValueAtTime(0.001, now + seconds);
  osc.connect(amp);
  amp.connect(master);
  osc.start(now);
  osc.stop(now + seconds);
}

function noise(seconds, gain = 0.25, freq = 3200) {
  const ctx = ensureAudio();
  if (!ctx || !master) return;
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = freq;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(gain, ctx.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seconds);
  source.connect(filter);
  filter.connect(amp);
  amp.connect(master);
  source.start();
}

export function playSound(world, name) {
  if (!world || world.muted) return;
  if (name === 'pick') tone(520, 0.08, 'triangle', 0.35, 720);
  else if (name === 'chop') noise(0.07, 0.4, 1800);
  else if (name === 'sizzle') noise(0.5, 0.3, 4200);
  else if (name === 'bell') { tone(1560, 0.25, 'sine', 0.4); tone(2090, 0.18, 'sine', 0.22); }
  else if (name === 'coin') { tone(880, 0.09, 'square', 0.18); tone(1320, 0.14, 'square', 0.14); }
  else if (name === 'bad') tone(180, 0.22, 'sawtooth', 0.22, 110);
  else if (name === 'perfect') { tone(660, 0.1, 'triangle', 0.3); tone(990, 0.16, 'triangle', 0.26); }
}
