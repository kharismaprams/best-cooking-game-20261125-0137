// Seeded randomness: the same seed always deals the same rush, so a shift can
// be replayed, practised and photographed the same way twice.

export function makeRng(seed) {
  let state = (seed >>> 0) || 1;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}

export function range(rng, low, high) {
  return low + rng() * (high - low);
}

export function shuffle(rng, items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const held = copy[i];
    copy[i] = copy[j];
    copy[j] = held;
  }
  return copy;
}
