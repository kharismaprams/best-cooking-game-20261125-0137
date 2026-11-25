// One map of the kitchen counter. Render paints these boxes and input reads
// the same boxes, so what a player sees is always what a click touches.

export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 64 },
  tickets: { x: 24, y: 78, w: 238, h: 118, gap: 12 },
  bins: { x: 24, y: 222, w: 152, h: 112, gap: 12 },
  checklist: { x: 1008, y: 222, w: 248, h: 112 },
  chop: { x: 24, y: 356, w: 264, h: 196 },
  woks: [
    { x: 308, y: 356, w: 254, h: 196 },
    { x: 582, y: 356, w: 254, h: 196 },
  ],
  pass: { x: 856, y: 356, w: 400, h: 196 },
  plates: [
    { x: 872, y: 408, w: 118, h: 108 },
    { x: 998, y: 408, w: 118, h: 108 },
    { x: 1124, y: 408, w: 118, h: 108 },
  ],
  serve: { x: 884, y: 528, w: 240, h: 48 },
  trash: { x: 1136, y: 528, w: 92, h: 48 },
  hint: { x: 0, y: 656, w: 1280, h: 64 },
  startButton: { x: 490, y: 470, w: 300, h: 64 },
  againButton: { x: 490, y: 520, w: 300, h: 60 },
};

export function ticketRect(index) {
  const t = LAYOUT.tickets;
  return { x: t.x + index * (t.w + t.gap), y: t.y, w: t.w, h: t.h };
}

export function binRect(index) {
  const b = LAYOUT.bins;
  return { x: b.x + index * (b.w + b.gap), y: b.y, w: b.w, h: b.h };
}

export function inside(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}
