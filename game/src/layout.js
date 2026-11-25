// One map of the night-market stall. Render paints these boxes and input
// reads the same boxes, so what a player sees is always what a click
// touches: tickets up top, ingredients down the left rail, stations in
// the middle, customers at the bar on the right.

export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 58 },
  tickets: { x: 14, y: 64, w: 188, h: 104, gap: 8 },
  scorePanel: { x: 994, y: 64, w: 272, h: 104 },
  bins: { x: 14, y: 178, w: 82, h: 94, gap: 8, cols: 2 },
  checklist: { x: 14, y: 576, w: 172, h: 78 },
  stations: [
    { x: 198, y: 178, w: 196, h: 150 },
    { x: 402, y: 178, w: 196, h: 150 },
    { x: 606, y: 178, w: 196, h: 150 },
  ],
  chop: { x: 198, y: 178, w: 196, h: 150 },
  woks: [
    { x: 402, y: 178, w: 196, h: 150 },
    { x: 606, y: 178, w: 196, h: 150 },
    { x: 810, y: 178, w: 172, h: 150 },
  ],
  floor: { x: 198, y: 336, w: 604, h: 196 },
  pass: { x: 198, y: 540, w: 604, h: 114 },
  plates: [
    { x: 214, y: 562, w: 128, h: 84 },
    { x: 350, y: 562, w: 128, h: 84 },
    { x: 486, y: 562, w: 128, h: 84 },
  ],
  serve: { x: 626, y: 562, w: 108, h: 48 },
  trash: { x: 626, y: 616, w: 108, h: 30 },
  garnish: { x: 810, y: 178, w: 172, h: 150 },
  bar: { x: 994, y: 178, w: 272, h: 476 },
  hint: { x: 0, y: 664, w: 1280, h: 56 },
  startButton: { x: 490, y: 470, w: 300, h: 64 },
  againButton: { x: 490, y: 520, w: 300, h: 60 },
};

export function ticketRect(index) {
  const t = LAYOUT.tickets;
  return { x: t.x + index * (t.w + t.gap), y: t.y, w: t.w, h: t.h };
}

export function binRect(index) {
  const b = LAYOUT.bins;
  const col = index % b.cols;
  const row = Math.floor(index / b.cols);
  return { x: b.x + col * (b.w + b.gap), y: b.y + row * (b.h + b.gap), w: b.w, h: b.h };
}

export function customerRect(index) {
  const bar = LAYOUT.bar;
  return { x: bar.x + 10, y: bar.y + 44 + index * 84, w: bar.w - 20, h: 78 };
}

export function inside(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}
