// Every pixel of the night-market stall: ticket cards with faces, an
// ingredient rail of illustrated tiles, three working stations, a tiled
// floor the chef actually walks, and customers waiting at the bar. All
// art is drawn with paths, gradients and shadows — no emoji, no images —
// so the screenshots read as a real kitchen at a glance.

import { INGREDIENTS, INGREDIENT_BY_ID, RECIPE_BY_ID, TUNING } from './config.js';
import { LAYOUT, binRect, customerRect, ticketRect } from './layout.js';
import { dishProgress, formatClock, starsFor } from './world.js';

const INK = '#2b1a12';
const PAPER = '#fff6e3';
const GOLD = '#ffd94d';

function box(ctx, rect, radius) {
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, radius);
}

function fillBox(ctx, rect, radius, color) {
  box(ctx, rect, radius);
  ctx.fillStyle = color;
  ctx.fill();
}

function strokeBox(ctx, rect, radius, color, width = 2) {
  box(ctx, rect, radius);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function panel(ctx, rect, radius, top, bottom, border) {
  const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  box(ctx, rect, radius);
  ctx.fillStyle = grad;
  ctx.fill();
  if (border) strokeBox(ctx, rect, radius, border, 2);
}

function text(ctx, value, x, y, size, color = PAPER, align = 'left', weight = 700) {
  ctx.fillStyle = color;
  ctx.font = weight + ' ' + size + 'px system-ui, sans-serif';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color, rot = 0) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

function drawIngredientIcon(ctx, id, x, y, scale = 1) {
  const item = INGREDIENT_BY_ID[id];
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineCap = 'round';
  if (id === 'prawn') {
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-6, -12); ctx.quadraticCurveTo(-16, -18, -20, -10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-3, -13); ctx.quadraticCurveTo(-12, -20, -17, -14); ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      const px = -8 + t * 16;
      const py = -8 + Math.sin(t * 2.4) * 6 + t * 8;
      ellipse(ctx, px, py, 7 - i * 0.7, 5.5 - i * 0.5, i % 2 ? item.color : '#ffb59a', 0.5);
      ctx.strokeStyle = item.dark;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(px, py, 5.5 - i * 0.6, 0.4, 2.4); ctx.stroke();
    }
    ctx.fillStyle = item.dark;
    ctx.beginPath();
    ctx.moveTo(9, 6); ctx.lineTo(17, 1); ctx.lineTo(16, 9); ctx.lineTo(18, 14); ctx.lineTo(10, 12);
    ctx.closePath(); ctx.fill();
    circle(ctx, -11, -9, 2, INK);
  } else if (id === 'beef') {
    ellipse(ctx, 0, 12, 17, 4.5, 'rgba(0,0,0,0.2)');
    for (let i = 0; i < 3; i++) {
      const sx = -9 + i * 7;
      const sy = 6 - i * 6;
      ellipse(ctx, sx, sy, 12, 6.5, i % 2 ? '#a83a3a' : item.color, -0.35);
      ellipse(ctx, sx, sy - 1, 9.5, 4.6, '#d96a5e', -0.35);
      ctx.strokeStyle = 'rgba(255,240,220,0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(sx - 6, sy - 2); ctx.quadraticCurveTo(sx, sy + 1, sx + 6, sy - 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx - 3, sy + 2); ctx.quadraticCurveTo(sx + 2, sy - 1, sx + 7, sy + 1); ctx.stroke();
    }
  } else if (id === 'noodles') {
    ellipse(ctx, 0, 12, 16, 4.5, 'rgba(0,0,0,0.18)');
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = 3.2;
    for (let ring = 0; ring < 4; ring++) {
      ctx.beginPath();
      ctx.ellipse(0, 1, 15 - ring * 3.2, 10 - ring * 2.1, 0.15, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2.2;
    for (let ring = 0; ring < 4; ring++) {
      ctx.beginPath();
      ctx.ellipse(-1, 0, 14 - ring * 3.2, 9 - ring * 2.1, 0.15, 0.2, Math.PI * 1.7);
      ctx.stroke();
    }
    ctx.strokeStyle = '#8a5a33';
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(7, -16); ctx.lineTo(13, -3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, -15); ctx.lineTo(17, -2); ctx.stroke();
  } else if (id === 'egg') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-14, 4);
    ctx.bezierCurveTo(-16, -6, -6, -11, 0, -9);
    ctx.bezierCurveTo(10, -12, 16, -4, 14, 4);
    ctx.bezierCurveTo(12, 11, -12, 12, -14, 4);
    ctx.fill();
    ctx.strokeStyle = '#e8dcc0';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    circle(ctx, 1, 0, 6.5, item.color);
    circle(ctx, -1, -2, 2.2, '#ffe98a');
  } else if (id === 'dumpling') {
    ellipse(ctx, 0, 12, 16, 4.5, 'rgba(0,0,0,0.18)');
    for (const [dx, dy, s] of [[-7, 4, 1], [7, 5, 0.92], [0, -5, 0.85]]) {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.moveTo(dx - 10 * s, dy + 5 * s);
      ctx.bezierCurveTo(dx - 11 * s, dy - 5 * s, dx - 4 * s, dy - 9 * s, dx, dy - 8 * s);
      ctx.bezierCurveTo(dx + 5 * s, dy - 9 * s, dx + 11 * s, dy - 4 * s, dx + 10 * s, dy + 5 * s);
      ctx.bezierCurveTo(dx + 5 * s, dy + 8 * s, dx - 5 * s, dy + 8 * s, dx - 10 * s, dy + 5 * s);
      ctx.fill();
      ctx.strokeStyle = item.dark;
      ctx.lineWidth = 1.2;
      for (let p = -2; p <= 2; p++) {
        ctx.beginPath();
        ctx.moveTo(dx + p * 3.2 * s, dy - 7 * s);
        ctx.quadraticCurveTo(dx + p * 3.8 * s, dy - 2 * s, dx + p * 3 * s, dy + 3 * s);
        ctx.stroke();
      }
    }
  } else if (id === 'chili') {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 6.4;
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.quadraticCurveTo(9, -3, 5, 12);
    ctx.stroke();
    ctx.strokeStyle = '#ff7a5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -9);
    ctx.quadraticCurveTo(6, -5, 4, 8);
    ctx.stroke();
    ctx.strokeStyle = '#2f7d27';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-10, -8); ctx.quadraticCurveTo(-14, -13, -11, -15); ctx.stroke();
  } else if (id === 'greens') {
    ctx.strokeStyle = '#cfe8a8';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-6, 12); ctx.quadraticCurveTo(-3, 2, -6, -6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, 12); ctx.quadraticCurveTo(3, 1, 1, -8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9, 11); ctx.quadraticCurveTo(9, 2, 7, -5); ctx.stroke();
    ellipse(ctx, -8, -7, 7, 10, item.color, -0.35);
    ellipse(ctx, 1, -10, 8, 11, '#6fc75e', 0.05);
    ellipse(ctx, 9, -6, 7, 9, item.color, 0.4);
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(1, -19); ctx.lineTo(1, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8, -15); ctx.quadraticCurveTo(-7, -8, -5, -1); ctx.stroke();
  } else if (id === 'broth') {
    ellipse(ctx, 0, 11, 16, 4.4, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = '#3a6ea5';
    ctx.beginPath(); ctx.arc(0, 2, 15, 0, Math.PI); ctx.fill();
    ellipse(ctx, 0, 1, 14, 5.6, item.color);
    ctx.strokeStyle = '#57b24a';
    ctx.lineWidth = 1.6;
    for (const [sx, sy] of [[-6, 0], [1, 2], [7, -1]]) {
      ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.stroke();
    }
    circle(ctx, -1, -2, 1.4, '#ffd94d');
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.8;
    for (const sx of [-6, 1, 8]) {
      ctx.beginPath();
      ctx.moveTo(sx, -6);
      ctx.quadraticCurveTo(sx + 3, -10, sx, -14);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawFace(ctx, look, x, y, scale = 1, mood = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ellipse(ctx, 0, 14, 13, 8, look.shirt);
  circle(ctx, 0, 0, 11, look.skin);
  if (look.hat === 'cap') {
    ctx.fillStyle = look.hair;
    ctx.beginPath(); ctx.arc(0, -3, 11, Math.PI, 0); ctx.fill();
    ctx.fillRect(-11, -4, 22, 3);
    ellipse(ctx, 8, -3, 7, 2.4, look.hair);
  } else if (look.hat === 'bun') {
    ctx.fillStyle = look.hair;
    ctx.beginPath(); ctx.arc(0, -4, 11, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
    circle(ctx, 0, -13, 4.4, look.hair);
  } else {
    ctx.fillStyle = look.hair;
    ctx.beginPath(); ctx.arc(0, -4, 11, Math.PI, 0); ctx.fill();
    ctx.fillRect(-11, -5, 3, 8);
    ctx.fillRect(8, -5, 3, 8);
  }
  circle(ctx, -4, 0, 1.5, INK);
  circle(ctx, 4, 0, 1.5, INK);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  if (mood > 0.45) ctx.arc(0, 3, 4, 0.25, Math.PI - 0.25);
  else if (mood > 0.22) { ctx.moveTo(-3.4, 6); ctx.lineTo(3.4, 6); }
  else ctx.arc(0, 9, 4, Math.PI + 0.4, Math.PI * 2 - 0.4);
  ctx.stroke();
  ctx.restore();
}

function drawBackdrop(ctx, world) {
  const wall = ctx.createLinearGradient(0, 0, 0, 720);
  wall.addColorStop(0, '#2a1630');
  wall.addColorStop(0.5, '#4a2436');
  wall.addColorStop(1, '#241016');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 1280, 720);

  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 ? '#7a2e35' : '#f4ead2';
    ctx.beginPath();
    ctx.moveTo(i * 80, 58);
    ctx.lineTo(i * 80 + 40, 58);
    ctx.lineTo(i * 80 + 32, 70);
    ctx.lineTo(i * 80 + 8, 70);
    ctx.closePath();
    ctx.fill();
  }

  for (let i = 0; i < 18; i++) {
    const x = 36 + i * 70;
    const sway = Math.sin(world.time * 1.4 + i) * 3;
    ctx.strokeStyle = '#1c0f16';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, 70); ctx.lineTo(x + sway, 84); ctx.stroke();
    const glow = ctx.createRadialGradient(x + sway, 90, 1, x + sway, 90, 16);
    glow.addColorStop(0, i % 3 === 0 ? 'rgba(255,217,77,0.5)' : i % 3 === 1 ? 'rgba(255,140,66,0.5)' : 'rgba(126,231,135,0.4)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x + sway, 90, 16, 0, Math.PI * 2); ctx.fill();
    circle(ctx, x + sway, 90, 4.6, i % 3 === 0 ? GOLD : i % 3 === 1 ? '#ff8c42' : '#7ee787');
  }

  const floor = LAYOUT.floor;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 12; col++) {
      ctx.fillStyle = (row + col) % 2 ? '#c9a06a' : '#b98d55';
      ctx.fillRect(floor.x + col * 51, floor.y + row * 40, 50, 39);
      ctx.fillStyle = 'rgba(90,52,28,0.25)';
      ctx.beginPath();
      const dx = floor.x + col * 51 + 25;
      const dy = floor.y + row * 40 + 20;
      ctx.moveTo(dx, dy - 7); ctx.lineTo(dx + 7, dy); ctx.lineTo(dx, dy + 7); ctx.lineTo(dx - 7, dy);
      ctx.closePath(); ctx.fill();
    }
  }
  strokeBox(ctx, floor, 10, '#6f412a', 3);

  ctx.fillStyle = '#5d3423';
  ctx.fillRect(0, 656, 1280, 8);
}

function drawHud(ctx, world) {
  fillBox(ctx, LAYOUT.hud, 0, '#1c0f1e');
  text(ctx, 'WAJAN MALAM', 16, 20, 23, GOLD, 'left', 900);
  text(ctx, 'Night Wok Rush · pasar malam stall', 16, 42, 12, '#f4c9a8', 'left', 600);

  const urgent = world.shiftLeft <= 20 && world.phase === 'playing';
  const pill = { x: 560, y: 8, w: 160, h: 42 };
  panel(ctx, pill, 12, urgent ? '#5a1f1f' : '#33202c', '#241016', urgent ? '#ff6b5e' : '#6b4455');
  text(ctx, formatClock(world.shiftLeft), 640, 30, 29, urgent ? '#ff8a7a' : '#ffffff', 'center', 900);
  const bar = { x: 520, y: 52, w: 240, h: 5 };
  fillBox(ctx, bar, 3, '#3a2436');
  fillBox(ctx, { ...bar, w: bar.w * Math.max(0, world.shiftLeft / TUNING.shiftSeconds) }, 3, urgent ? '#ff6b5e' : GOLD);

  text(ctx, 'Served ' + world.served, 980, 20, 15, '#ffffff', 'right', 900);
  text(ctx, 'Combo x' + (1 + Math.min(world.combo, TUNING.comboCap) * TUNING.comboStep).toFixed(1), 980, 42, 13, '#7ee787', 'right', 800);
  for (let i = 0; i < TUNING.hearts; i++) {
    ctx.fillStyle = i < world.hearts ? '#ff5e6c' : '#4a2a36';
    const x = 1010 + i * 30;
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.bezierCurveTo(x - 12, 26, x - 5, 13, x, 21);
    ctx.bezierCurveTo(x + 5, 13, x + 12, 26, x, 40);
    ctx.fill();
  }
  text(ctx, world.muted ? 'M muted' : 'M sound', 1264, 42, 11, '#c9a0b4', 'right', 700);
}

function drawScorePanel(ctx, world) {
  const rect = LAYOUT.scorePanel;
  panel(ctx, rect, 12, '#33202c', '#241016', '#6b4455');
  text(ctx, 'SCORE', rect.x + 14, rect.y + 18, 11, '#f4c9a8', 'left', 900);
  text(ctx, String(world.score), rect.x + 14, rect.y + 46, 30, '#ffffff', 'left', 900);
  text(ctx, 'coins ' + world.coins, rect.x + 14, rect.y + 74, 13, GOLD, 'left', 800);
  text(ctx, 'perfect ' + world.perfects, rect.x + 14, rect.y + 92, 12, '#c9a0b4', 'left', 700);
  const comboPill = { x: rect.x + 150, y: rect.y + 14, w: 108, h: 34 };
  panel(ctx, comboPill, 17, world.combo >= 5 ? '#7a4a12' : '#3a2436', '#241016', GOLD);
  text(ctx, 'COMBO x' + world.combo, comboPill.x + 54, comboPill.y + 17, 14, GOLD, 'center', 900);
  text(ctx, 'best x' + world.bestCombo, rect.x + 204, rect.y + 62, 12, '#c9a0b4', 'center', 700);
  text(ctx, world.served + ' served', rect.x + 204, rect.y + 78, 12, '#7ee787', 'center', 800);
  const meter = { x: rect.x + 150, y: rect.y + 88, w: 108, h: 7 };
  fillBox(ctx, meter, 4, '#17131c');
  fillBox(ctx, { ...meter, w: meter.w * (world.spice / 100) }, 4, '#ff8c42');
  const upgrades = [];
  if (world.served >= TUNING.knifeAt) upgrades.push('sharp knife');
  if (world.served >= TUNING.tipJarAt) upgrades.push('tip jar');
  text(ctx, upgrades.length ? upgrades.join(' · ') : 'spice rush', rect.x + 204, rect.y + 100, 9, '#ff8c42', 'center', 800);
}

function drawTickets(ctx, world) {
  if (!world.orders.length) {
    text(ctx, 'Tickets land here — keep the stations hot', 500, 116, 17, '#c9a0b4', 'center', 700);
  }
  world.orders.forEach((order, index) => {
    const rect = ticketRect(index);
    const recipe = RECIPE_BY_ID[order.recipeId];
    const selected = index === world.selectedOrder;
    const share = Math.max(0, order.patience / order.patienceMax);
    panel(ctx, rect, 10, selected ? '#fff0bf' : '#fff6e3', selected ? '#ffe3a1' : '#f3e3bd', selected ? '#ffb703' : '#c9a86a');
    if (selected) strokeBox(ctx, rect, 10, '#ffb703', 3);
    ctx.fillStyle = share < 0.25 ? '#e23b2e' : '#57b24a';
    ctx.fillRect(rect.x, rect.y, rect.w, 5);
    drawFace(ctx, order.look, rect.x + 22, rect.y + 28, 0.95, share);
    text(ctx, recipe.name, rect.x + 42, rect.y + 22, 14, INK, 'left', 900);
    text(ctx, order.customer, rect.x + 42, rect.y + 39, 11, '#7a5a3a', 'left', 700);
    text(ctx, recipe.price + 'c', rect.x + rect.w - 10, rect.y + 22, 15, '#2f7d27', 'right', 900);
    if (order.vip) {
      fillBox(ctx, { x: rect.x + rect.w - 52, y: rect.y + 30, w: 42, h: 15 }, 7, '#ffb703');
      text(ctx, 'VIP', rect.x + rect.w - 31, rect.y + 38, 10, INK, 'center', 900);
    } else if (share < 0.25) {
      fillBox(ctx, { x: rect.x + rect.w - 66, y: rect.y + 30, w: 56, h: 15 }, 7, '#e23b2e');
      text(ctx, 'URGENT', rect.x + rect.w - 38, rect.y + 38, 9, '#ffffff', 'center', 900);
    }
    const onPlate = new Set((world.plates[world.activePlate]?.items || []).map((item) => item.id));
    let doneCount = 0;
    recipe.needs.forEach((id, i) => {
      const x = rect.x + 20 + i * 32;
      const y = rect.y + 66;
      const done = selected && onPlate.has(id);
      if (done) doneCount += 1;
      circle(ctx, x, y, 14, done ? '#dff3d8' : '#f7e8c8');
      drawIngredientIcon(ctx, id, x, y, 0.72);
      if (INGREDIENT_BY_ID[id].chop) circle(ctx, x + 10, y + 10, 4, '#e23b2e');
      if (done) text(ctx, '✓', x + 11, y - 11, 13, '#2f7d27', 'center', 900);
    });
    if (selected) text(ctx, doneCount + '/' + recipe.needs.length, rect.x + rect.w - 10, rect.y + 66, 11, '#2f7d27', 'right', 900);
    text(ctx, recipe.station === 'simmer' ? 'SIMMER' : recipe.station === 'steam' ? 'STEAM' : 'WOK', rect.x + rect.w - 10, rect.y + 52, 9, '#7a5a3a', 'right', 900);
    const bar = { x: rect.x + 10, y: rect.y + rect.h - 14, w: rect.w - 20, h: 7 };
    fillBox(ctx, bar, 4, '#e5d3ae');
    fillBox(ctx, { ...bar, w: bar.w * share }, 4, share > 0.45 ? '#57b24a' : share > 0.22 ? '#ffb703' : '#e23b2e');
  });
}

function drawBins(ctx, world) {
  const progress = dishProgress(world, world.plates[world.activePlate]) || [];
  const needed = new Set(progress.filter((step) => !step.done).map((step) => step.id));
  const have = new Set((world.plates[world.activePlate]?.items || []).map((item) => item.id));

  INGREDIENTS.forEach((ingredient, index) => {
    const rect = binRect(index);
    const isNeeded = needed.has(ingredient.id);
    const isHave = have.has(ingredient.id);
    panel(ctx, rect, 10, isHave ? '#3f5a34' : isNeeded ? '#5a3a22' : '#33202c', '#241016', isNeeded ? GOLD : '#6b4455');
    if (isNeeded) strokeBox(ctx, rect, 10, GOLD, 3);
    ellipse(ctx, rect.x + rect.w / 2, rect.y + 38, 30, 22, '#1c0f1e');
    drawIngredientIcon(ctx, ingredient.id, rect.x + rect.w / 2, rect.y + 36, 1.25);
    fillBox(ctx, { x: rect.x + 5, y: rect.y + 5, w: 16, h: 16 }, 5, '#241016');
    text(ctx, ingredient.key, rect.x + 13, rect.y + 13, 11, GOLD, 'center', 900);
    text(ctx, ingredient.name, rect.x + rect.w / 2, rect.y + 70, 13, '#ffffff', 'center', 900);
    text(ctx, ingredient.chop ? 'chop first' : 'ready', rect.x + rect.w / 2, rect.y + 84, 9, ingredient.chop ? '#ff9d7a' : '#c9a0b4', 'center', 800);
    if (isHave) {
      circle(ctx, rect.x + rect.w - 11, rect.y + 11, 8, '#57b24a');
      text(ctx, '✓', rect.x + rect.w - 11, rect.y + 11, 11, '#ffffff', 'center', 900);
    }
  });

  const panelRect = LAYOUT.checklist;
  panel(ctx, panelRect, 10, '#33202c', '#241016', '#6b4455');
  const order = world.orders[world.selectedOrder];
  if (!order) {
    text(ctx, 'No ticket selected', panelRect.x + panelRect.w / 2, panelRect.y + 39, 13, '#c9a0b4', 'center', 800);
    return;
  }
  const recipe = RECIPE_BY_ID[order.recipeId];
  text(ctx, 'NOW COOKING', panelRect.x + 10, panelRect.y + 14, 10, GOLD, 'left', 900);
  text(ctx, recipe.name, panelRect.x + 10, panelRect.y + 32, 15, '#ffffff', 'left', 900);
  progress.forEach((step, i) => {
    const x = panelRect.x + 18 + i * 30;
    const y = panelRect.y + 58;
    circle(ctx, x, y, 12, step.done ? '#57b24a' : '#3a2436');
    drawIngredientIcon(ctx, step.id, x, y, 0.62);
    if (step.done) text(ctx, '✓', x + 9, y - 9, 11, '#7ee787', 'center', 900);
  });
}

function stationPanel(ctx, rect, title, key, active) {
  panel(ctx, rect, 12, '#3a2436', '#241016', active ? '#ffb703' : '#6b4455');
  if (active) strokeBox(ctx, rect, 12, '#ffb703', 3);
  text(ctx, title, rect.x + 12, rect.y + 16, 13, GOLD, 'left', 900);
  fillBox(ctx, { x: rect.x + rect.w - 34, y: rect.y + 6, w: 24, h: 18 }, 6, '#241016');
  text(ctx, key, rect.x + rect.w - 22, rect.y + 15, 11, GOLD, 'center', 900);
}

function drawSteam(ctx, world, cx, cy, count = 3, spread = 26) {
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2.6;
  for (let i = 0; i < count; i++) {
    const sx = cx - spread + i * (spread * 2 / Math.max(1, count - 1));
    const rise = (world.time * 22 + i * 13) % 26;
    ctx.beginPath();
    ctx.moveTo(sx, cy - rise * 0.3);
    ctx.quadraticCurveTo(sx + 6, cy - 12 - rise * 0.3, sx, cy - 24 - rise * 0.3);
    ctx.stroke();
  }
}

function cookBar(ctx, world, plate, rect, station) {
  const recipe = plate.recipeId ? RECIPE_BY_ID[plate.recipeId] : null;
  const done = recipe ? Math.min(1.25, plate.cook / recipe.cookSeconds) : 0;
  const bonus = station === 1 ? TUNING.simmerBandBonus : station === 2 ? TUNING.steamBandBonus : 0;
  const from = TUNING.perfectFrom - bonus;
  const to = TUNING.perfectTo + bonus / 2;
  const bar = { x: rect.x + 14, y: rect.y + rect.h - 30, w: rect.w - 28, h: 13 };
  fillBox(ctx, bar, 7, '#17131c');
  fillBox(ctx, { x: bar.x + bar.w * from, y: bar.y, w: bar.w * (to - from), h: bar.h }, 7, GOLD);
  fillBox(ctx, { ...bar, w: bar.w * Math.min(1, done) }, 7, done > to ? '#e23b2e' : '#57b24a');
  text(ctx, done >= from && done <= to ? 'PULL NOW' : 'PULL IN THE GOLD', rect.x + rect.w / 2, rect.y + rect.h - 8, 10, done >= from && done <= to ? GOLD : '#ffffff', 'center', 900);
}

function drawChopStation(ctx, world) {
  const rect = LAYOUT.chop;
  stationPanel(ctx, rect, 'CHOP BOARD', 'SPC', !!world.board);
  const board = { x: rect.x + 22, y: rect.y + 52, w: 152, h: 62 };
  panel(ctx, board, 14, '#c98d4e', '#a96b3f', '#7a4a2b');
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 2;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(board.x + 8, board.y + i * 20);
    ctx.lineTo(board.x + board.w - 8, board.y + i * 20);
    ctx.stroke();
  }
  if (world.board) {
    const ingredient = INGREDIENT_BY_ID[world.board.id];
    const pieces = 2 + world.board.hits * 2;
    for (let i = 0; i < pieces; i++) {
      drawIngredientIcon(ctx, ingredient.id, board.x + 26 + i * 22, board.y + 32 + (i % 2) * 7, 0.72);
    }
    const lift = Math.abs(Math.sin(world.time * 11)) * 12;
    ctx.save();
    ctx.translate(board.x + 122, board.y + 22 - lift);
    ctx.rotate(-0.55);
    ctx.fillStyle = '#d9dee6';
    ctx.beginPath();
    ctx.moveTo(-3, -20); ctx.lineTo(7, -18); ctx.lineTo(5, 8); ctx.lineTo(-4, 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5d3423';
    ctx.fillRect(-4, -32, 8, 13);
    ctx.restore();
    for (let i = 0; i < TUNING.chopHits; i++) {
      circle(ctx, rect.x + rect.w / 2 - 22 + i * 22, rect.y + 124, 6, i < world.board.hits ? GOLD : '#3a2436');
    }
    text(ctx, 'Tap the board', rect.x + rect.w / 2, rect.y + 140, 11, '#ffffff', 'center', 800);
  } else {
    drawIngredientIcon(ctx, 'chili', board.x + 44, board.y + 30, 0.9);
    drawIngredientIcon(ctx, 'greens', board.x + 84, board.y + 32, 0.9);
    drawIngredientIcon(ctx, 'prawn', board.x + 120, board.y + 30, 0.9);
    text(ctx, 'Prawn, beef, chili, greens', rect.x + rect.w / 2, rect.y + 130, 11, '#f4c9a8', 'center', 700);
    text(ctx, 'land here first', rect.x + rect.w / 2, rect.y + 144, 11, '#c9a0b4', 'center', 700);
  }
}

function drawWokStation(ctx, world) {
  const rect = LAYOUT.woks[0];
  const plateIndex = world.woks[0].plate;
  const plate = plateIndex >= 0 ? world.plates[plateIndex] : null;
  stationPanel(ctx, rect, 'WOK TOSS', 'Q', !!plate);
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + 82;
  if (plate) {
    for (let i = 0; i < 6; i++) {
      const fx = cx - 50 + i * 20;
      const fh = 15 + Math.sin(world.time * 13 + i * 2.1) * 6;
      ctx.fillStyle = i % 2 ? '#ff8c42' : '#ffb703';
      ctx.beginPath();
      ctx.moveTo(fx - 8, cy + 26);
      ctx.quadraticCurveTo(fx, cy + 26 - fh * 2.1, fx + 8, cy + 26);
      ctx.fill();
      circle(ctx, fx, cy + 22, 3, '#e23b2e');
    }
  }
  ellipse(ctx, cx, cy + 24, 62, 10, '#17131c');
  ctx.fillStyle = '#17131c';
  ctx.beginPath(); ctx.ellipse(cx, cy, 74, 27, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2e2a33';
  ctx.beginPath(); ctx.ellipse(cx, cy - 3, 64, 21, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#17131c';
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(cx + 66, cy - 6); ctx.lineTo(cx + 92, cy - 20); ctx.stroke();
  if (plate) {
    plate.items.forEach((item, i) => {
      const toss = Math.sin(world.time * 7 + i * 1.7) * 5;
      drawIngredientIcon(ctx, item.id, cx - 36 + i * 17, cy - 8 + (i % 2) * 5 - Math.abs(toss), 0.66);
    });
    drawSteam(ctx, world, cx, cy - 16, 3, 24);
    cookBar(ctx, world, plate, rect, 0);
  } else {
    ellipse(ctx, cx, cy - 4, 40, 12, '#3a3540');
    ctx.strokeStyle = '#4a4450';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(cx, cy - 5, 52, 16, 0, 0.2, Math.PI - 0.2); ctx.stroke();
    circle(ctx, cx - 30, cy + 26, 4, '#ff8c42');
    circle(ctx, cx + 30, cy + 26, 4, '#ff8c42');
    text(ctx, 'Empty and hot', cx, cy + 44, 12, '#c9a0b4', 'center', 700);
    text(ctx, 'wok dishes fire here', cx, cy + 60, 10, '#8f7284', 'center', 700);
  }
}

function drawSimmerStation(ctx, world) {
  const rect = LAYOUT.woks[1];
  const plateIndex = world.woks[1].plate;
  const plate = plateIndex >= 0 ? world.plates[plateIndex] : null;
  stationPanel(ctx, rect, 'SIMMER POT', 'W', !!plate);
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + 86;
  ellipse(ctx, cx, cy + 26, 58, 9, '#17131c');
  ctx.fillStyle = '#8a8f98';
  ctx.beginPath();
  ctx.moveTo(cx - 52, cy - 18);
  ctx.lineTo(cx + 52, cy - 18);
  ctx.lineTo(cx + 44, cy + 24);
  ctx.lineTo(cx - 44, cy + 24);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b9bec7';
  ctx.fillRect(cx - 54, cy - 22, 108, 7);
  ellipse(ctx, cx, cy - 18, 50, 10, plate ? '#f0a832' : '#5a4a3a');
  if (plate) {
    for (let i = 0; i < 7; i++) {
      const bx = cx - 36 + (i * 12) % 72;
      const by = cy - 20 - ((world.time * 14 + i * 9) % 12);
      circle(ctx, bx, by, 2.6, '#ffd94d');
    }
    plate.items.forEach((item, i) => {
      drawIngredientIcon(ctx, item.id, cx - 30 + i * 15, cy - 20, 0.58);
    });
    ctx.save();
    ctx.translate(cx + 44, cy - 34);
    ctx.rotate(-0.5);
    ellipse(ctx, 0, 0, 30, 7, '#d9dee6');
    circle(ctx, 0, -5, 4, '#5d3423');
    ctx.restore();
    drawSteam(ctx, world, cx, cy - 30, 4, 30);
    cookBar(ctx, world, plate, rect, 1);
  } else {
    ellipse(ctx, cx, cy - 24, 34, 7, '#d9dee6');
    circle(ctx, cx, cy - 29, 4, '#5d3423');
    drawSteam(ctx, world, cx, cy - 34, 2, 14);
    text(ctx, 'Broth at a gentle bubble', cx, cy + 44, 12, '#c9a0b4', 'center', 700);
    text(ctx, 'pangsit and prawn noodles', cx, cy + 60, 10, '#8f7284', 'center', 700);
  }
}

function drawSteamerStation(ctx, world) {
  const rect = LAYOUT.woks[2];
  const plateIndex = world.woks[2].plate;
  const plate = plateIndex >= 0 ? world.plates[plateIndex] : null;
  stationPanel(ctx, rect, 'STEAMER', 'R', !!plate);
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + 88;
  ellipse(ctx, cx, cy + 26, 52, 9, '#17131c');
  ctx.fillStyle = '#8a5a33';
  ctx.beginPath(); ctx.ellipse(cx, cy + 18, 52, 12, 0, 0, Math.PI * 2); ctx.fill();
  for (let tier = 0; tier < 2; tier++) {
    const ty = cy + 6 - tier * 16;
    ctx.fillStyle = tier ? '#c98d4e' : '#b07a3f';
    ctx.beginPath(); ctx.roundRect(cx - 50 + tier * 4, ty - 6, 100 - tier * 8, 14, 6); ctx.fill();
    ctx.strokeStyle = '#7a4a2b';
    ctx.lineWidth = 1.4;
    for (let s = -3; s <= 3; s++) {
      ctx.beginPath(); ctx.moveTo(cx + s * 13, ty - 5); ctx.lineTo(cx + s * 13, ty + 7); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(cx, ty - 6, 50 - tier * 4, 6, 0, 0, Math.PI * 2); ctx.fillStyle = tier ? '#dcb078' : '#c98d4e'; ctx.fill();
  }
  if (plate) {
    plate.items.forEach((item, i) => {
      drawIngredientIcon(ctx, item.id, cx - 26 + i * 16, cy - 14, 0.6);
    });
    drawSteam(ctx, world, cx, cy - 26, 4, 28);
    cookBar(ctx, world, plate, rect, 2);
  } else {
    ctx.fillStyle = '#c98d4e';
    ctx.beginPath(); ctx.ellipse(cx, cy - 26, 34, 8, 0, 0, Math.PI * 2); ctx.fill();
    circle(ctx, cx, cy - 31, 4, '#5d3423');
    drawSteam(ctx, world, cx, cy - 34, 3, 18);
    text(ctx, 'Bamboo baskets ready', cx, cy + 44, 12, '#c9a0b4', 'center', 700);
    text(ctx, 'steamed egg dishes', cx, cy + 60, 10, '#8f7284', 'center', 700);
  }
}

function drawPlateFood(ctx, plate, cx, cy) {
  ellipse(ctx, cx, cy + 8, 46, 10, 'rgba(0,0,0,0.25)');
  ellipse(ctx, cx, cy, 45, 20, '#f8f3e6');
  ellipse(ctx, cx, cy - 2, 35, 15, '#e7dcc4');
  if (!plate.items.length) return;
  const recipe = plate.recipeId ? RECIPE_BY_ID[plate.recipeId] : null;
  if (recipe && recipe.station === 'simmer') {
    ellipse(ctx, cx, cy - 3, 32, 13, '#f0a832');
    circle(ctx, cx - 12, cy - 5, 2.4, '#ffd94d');
    circle(ctx, cx + 8, cy - 2, 2, '#ffd94d');
  } else if (plate.items.some((item) => item.id === 'dumpling')) {
    ellipse(ctx, cx, cy - 4, 26, 11, '#f0dcbc');
  } else if (plate.items.some((item) => item.id === 'noodles')) {
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = 2.4;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 6 + i * 3);
      ctx.bezierCurveTo(cx - 6, cy - 10 + i * 3, cx + 6, cy - 2 + i * 3, cx + 20, cy - 6 + i * 3);
      ctx.stroke();
    }
  }
  plate.items.forEach((item, i) => {
    const angle = (i / Math.max(1, plate.items.length)) * Math.PI * 2;
    drawIngredientIcon(ctx, item.id, cx + Math.cos(angle) * 15, cy - 6 + Math.sin(angle) * 5, 0.68);
  });
  if (plate.state === 'ready') {
    ctx.strokeStyle = 'rgba(226,59,46,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy - 8);
    ctx.bezierCurveTo(cx - 6, cy - 13, cx + 6, cy - 3, cx + 18, cy - 8);
    ctx.stroke();
  }
  if (plate.state === 'burned') {
    ellipse(ctx, cx, cy - 4, 34, 14, 'rgba(40,32,28,0.55)');
  }
}

function drawBell(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.moveTo(-10, 6);
  ctx.quadraticCurveTo(-10, -8, 0, -10);
  ctx.quadraticCurveTo(10, -8, 10, 6);
  ctx.closePath(); ctx.fill();
  ctx.fillRect(-12, 6, 24, 3);
  circle(ctx, 0, -12, 3, '#ffb703');
  ctx.restore();
}

function drawPass(ctx, world) {
  const rect = LAYOUT.pass;
  panel(ctx, rect, 12, '#33202c', '#241016', '#6b4455');
  text(ctx, 'SERVICE PASS', rect.x + 12, rect.y + 12, 11, GOLD, 'left', 900);
  text(ctx, 'Tab switches plate', rect.x + 430, rect.y + 12, 10, '#c9a0b4', 'right', 700);

  world.plates.forEach((plate, index) => {
    const slot = LAYOUT.plates[index];
    const active = index === world.activePlate;
    const ready = plate.state === 'ready';
    if (ready) {
      const pulse = 0.5 + Math.sin(world.time * 6) * 0.5;
      ctx.fillStyle = 'rgba(126,231,135,' + (0.12 + pulse * 0.14) + ')';
      ctx.beginPath(); ctx.ellipse(slot.x + slot.w / 2, slot.y + 42, 66, 34, 0, 0, Math.PI * 2); ctx.fill();
    }
    panel(ctx, slot, 10, active ? '#4a2c3a' : '#241826', '#1c0f1e', ready ? '#7ee787' : active ? GOLD : '#6b4455');
    drawPlateFood(ctx, plate, slot.x + slot.w / 2, slot.y + 40);
    const label = plate.state === 'ready'
      ? (plate.quality === 'perfect' ? 'READY · PERFECT' : 'READY TO SERVE')
      : plate.state === 'cooking' ? (plate.wok === 1 ? 'SIMMERING' : plate.wok === 2 ? 'STEAMING' : 'IN THE WOK')
        : plate.state === 'burned' ? 'BURNED — TRASH IT'
          : plate.items.length + ' ingredient' + (plate.items.length === 1 ? '' : 's');
    text(ctx, label, slot.x + slot.w / 2, slot.y + 76, 11, ready ? '#7ee787' : '#ffffff', 'center', 900);
  });

  panel(ctx, LAYOUT.serve, 12, '#357d2a', '#2f7d27', '#7ee787');
  drawBell(ctx, LAYOUT.serve.x + 22, LAYOUT.serve.y + 27, 1);
  text(ctx, 'SERVE · E', LAYOUT.serve.x + 66, LAYOUT.serve.y + 27, 16, '#ffffff', 'center', 900);
  panel(ctx, LAYOUT.trash, 10, '#4a2436', '#33202c', '#8f5a6e');
  text(ctx, 'TRASH · T', LAYOUT.trash.x + LAYOUT.trash.w / 2, LAYOUT.trash.y + 15, 12, '#f4c9a8', 'center', 900);
}

function drawBar(ctx, world) {
  const rect = LAYOUT.bar;
  panel(ctx, rect, 12, '#33202c', '#241016', '#6b4455');
  text(ctx, 'CUSTOMER BAR', rect.x + 12, rect.y + 18, 12, GOLD, 'left', 900);
  text(ctx, 'tips fade as patience falls', rect.x + rect.w - 12, rect.y + 18, 10, '#c9a0b4', 'right', 700);
  for (let i = 0; i < 5; i++) {
    const seat = customerRect(i);
    const order = world.orders[i];
    if (!order) {
      panel(ctx, seat, 10, '#241826', '#1c0f1e', '#4a2a36');
      ellipse(ctx, seat.x + 34, seat.y + 40, 16, 7, '#5d3423');
      ctx.fillStyle = '#3a2436';
      ctx.fillRect(seat.x + 31, seat.y + 44, 6, 20);
      text(ctx, 'empty stool', seat.x + 120, seat.y + 40, 11, '#8f7284', 'center', 700);
      continue;
    }
    const recipe = RECIPE_BY_ID[order.recipeId];
    const share = Math.max(0, order.patience / order.patienceMax);
    const selected = i === world.selectedOrder;
    panel(ctx, seat, 10, selected ? '#4a2c3a' : '#241826', '#1c0f1e', selected ? GOLD : '#6b4455');
    ctx.strokeStyle = share > 0.45 ? '#57b24a' : share > 0.22 ? '#ffb703' : '#e23b2e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(seat.x + 34, seat.y + 36, 22, -Math.PI / 2, -Math.PI / 2 + share * Math.PI * 2);
    ctx.stroke();
    drawFace(ctx, order.look, seat.x + 34, seat.y + 36, 1.15, share);
    text(ctx, order.customer, seat.x + 66, seat.y + 22, 13, '#ffffff', 'left', 900);
    text(ctx, recipe.name, seat.x + 66, seat.y + 40, 12, '#f4c9a8', 'left', 700);
    const tip = Math.round(share * 12) + (order.vip ? Math.round(recipe.price * TUNING.vipTipShare) : 0);
    text(ctx, 'tip +' + tip, seat.x + 66, seat.y + 58, 11, '#7ee787', 'left', 800);
    if (order.vip) text(ctx, 'VIP', seat.x + seat.w - 12, seat.y + 22, 11, '#ffb703', 'right', 900);
    drawIngredientIcon(ctx, recipe.needs[0], seat.x + seat.w - 26, seat.y + 52, 0.8);
  }
}

function drawFloorProps(ctx, world) {
  const island = { x: 392, y: 408, w: 216, h: 62 };
  ellipse(ctx, island.x + island.w / 2, island.y + island.h + 8, 110, 10, 'rgba(0,0,0,0.25)');
  panel(ctx, island, 12, '#8a5a33', '#6f412a', '#5d3423');
  ctx.fillStyle = '#a96b3f';
  ctx.fillRect(island.x + 8, island.y + 8, island.w - 16, 10);
  drawIngredientIcon(ctx, 'dumpling', island.x + 34, island.y + 38, 0.95);
  drawIngredientIcon(ctx, 'chili', island.x + 76, island.y + 38, 0.95);
  drawIngredientIcon(ctx, 'greens', island.x + 118, island.y + 38, 0.95);
  drawIngredientIcon(ctx, 'egg', island.x + 160, island.y + 38, 0.95);
  drawIngredientIcon(ctx, 'broth', island.x + 196, island.y + 38, 0.85);
  const lampX = island.x + island.w / 2;
  ctx.strokeStyle = '#1c0f16';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(lampX, 336); ctx.lineTo(lampX, 372); ctx.stroke();
  const glow = ctx.createRadialGradient(lampX, 384, 2, lampX, 384, 44);
  glow.addColorStop(0, 'rgba(255,217,77,0.4)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(lampX, 384, 44, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffb703';
  ctx.beginPath();
  ctx.moveTo(lampX - 12, 384); ctx.lineTo(lampX + 12, 384); ctx.lineTo(lampX + 6, 372); ctx.lineTo(lampX - 6, 372);
  ctx.closePath(); ctx.fill();
  drawSteam(ctx, world, island.x + 196, island.y + 22, 2, 8);
}

function drawChef(ctx, world) {
  const x = world.chefX;
  const y = world.chefY + Math.sin(world.time * 6) * 2;
  if (world.route.length) {
    ctx.strokeStyle = 'rgba(255,217,77,0.55)';
    ctx.lineWidth = 2.4;
    ctx.setLineDash([6, 7]);
    ctx.beginPath();
    ctx.moveTo(x, y + 34);
    for (const stop of world.route) ctx.lineTo(stop.x, stop.y + 34);
    ctx.stroke();
    ctx.setLineDash([]);
    world.route.forEach((stop, i) => {
      circle(ctx, stop.x, stop.y + 34, 9, '#241016');
      text(ctx, String(i + 1), stop.x, stop.y + 34, 10, GOLD, 'center', 900);
    });
  }
  ellipse(ctx, x, y + 36, 22, 6, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = '#2b1a12';
  ctx.fillRect(x - 13, y + 16, 9, 18);
  ctx.fillRect(x + 4, y + 16, 9, 18);
  ctx.fillStyle = '#e23b2e';
  ctx.beginPath(); ctx.roundRect(x - 17, y - 12, 34, 32, 9); ctx.fill();
  ctx.fillStyle = '#fff6e3';
  ctx.fillRect(x - 10, y - 4, 20, 22);
  ctx.fillStyle = '#f2c49b';
  ctx.beginPath(); ctx.roundRect(x + 14, y - 6, 16, 7, 3); ctx.fill();
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x + 28, y - 4); ctx.lineTo(x + 40, y - 14); ctx.stroke();
  circle(ctx, x, y - 24, 14, '#f2c49b');
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(x, y - 38, 16, 8, 0, Math.PI, 0); ctx.fill();
  ctx.fillRect(x - 10, y - 44, 20, 8);
  circle(ctx, x - 5, y - 25, 1.8, INK);
  circle(ctx, x + 5, y - 25, 1.8, INK);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(x, y - 20, 4, 0.3, Math.PI - 0.3); ctx.stroke();
}

function drawParticles(ctx, world) {
  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, 1 - (world.time - p.born) / p.life);
    ctx.fillStyle = p.color;
    if (p.kind === 'heart') {
      const s = p.size * 1.6;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + s * 0.7);
      ctx.bezierCurveTo(p.x - s, p.y - s * 0.4, p.x - s * 0.4, p.y - s, p.x, p.y - s * 0.3);
      ctx.bezierCurveTo(p.x + s * 0.4, p.y - s, p.x + s, p.y - s * 0.4, p.x, p.y + s * 0.7);
      ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  for (const p of world.popups) {
    const age = world.time - p.born;
    ctx.globalAlpha = Math.max(0, 1 - age / p.life);
    text(ctx, p.text, p.x, p.y - age * 34, 20, p.color, 'center', 900);
  }
  ctx.globalAlpha = 1;
}

function drawHintBar(ctx, world) {
  fillBox(ctx, LAYOUT.hint, 0, '#1c0f1e');
  const fresh = world.time < world.messageUntil;
  text(ctx, fresh ? world.message : 'Click a route · gather 1-8 · chop · Q wok · W simmer · R steam · E serve', 640, 692, fresh ? 19 : 15, fresh ? GOLD : '#c9a0b4', 'center', 800);
}

function drawTitle(ctx, world) {
  ctx.fillStyle = 'rgba(12,6,14,0.74)';
  ctx.fillRect(0, 0, 1280, 720);
  text(ctx, 'WAJAN MALAM', 640, 140, 70, GOLD, 'center', 900);
  text(ctx, 'Night Wok Rush', 640, 192, 29, '#ffffff', 'center', 800);
  text(ctx, 'Read the tickets. Chop fast. Pull the wok in the gold.', 640, 236, 19, '#f4c9a8', 'center', 700);
  INGREDIENTS.forEach((ingredient, i) => {
    const x = 400 + i * 68;
    circle(ctx, x, 282, 26, '#33202c');
    drawIngredientIcon(ctx, ingredient.id, x, 282, 1.1);
  });
  const lines = [
    'Click a ticket, then gather its ingredients from the rail (keys 1-8).',
    'Prawn, beef, chili and greens go to the chopping board first.',
    'Wok dishes fire in the wok (Q); pangsit simmers (W); steamed egg lifts in the basket (R).',
    'Serve before patience runs out — VIPs tip big, perfect plates build spice.',
  ];
  lines.forEach((line, i) => text(ctx, line, 640, 330 + i * 30, 17, '#ffffff', 'center', 600));
  panel(ctx, LAYOUT.startButton, 16, '#e23b2e', '#a51f16', GOLD);
  text(ctx, 'START THE SHIFT', 640, LAYOUT.startButton.y + 32, 24, '#ffffff', 'center', 900);
  text(ctx, 'Mouse and keyboard · sound on · 150 second shift', 640, 580, 14, '#c9a0b4', 'center', 700);
}

function drawEnded(ctx, world) {
  ctx.fillStyle = 'rgba(12,6,14,0.8)';
  ctx.fillRect(0, 0, 1280, 720);
  text(ctx, world.hearts > 0 ? 'SHIFT COMPLETE' : 'KITCHEN CLOSED', 640, 120, 46, GOLD, 'center', 900);
  const stars = starsFor(world);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < stars ? GOLD : '#4a2a36';
    const x = 580 + i * 60;
    ctx.beginPath();
    for (let p = 0; p < 10; p++) {
      const angle = -Math.PI / 2 + (p * Math.PI) / 5;
      const radius = p % 2 ? 11 : 24;
      const px = x + Math.cos(angle) * radius;
      const py = 188 + Math.sin(angle) * radius;
      if (p === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  text(ctx, 'Score ' + world.score, 640, 252, 34, '#ffffff', 'center', 900);
  const rows = [
    ['Plates served', world.served],
    ['Perfect sears', world.perfects],
    ['Best combo', 'x' + world.bestCombo],
    ['Walked away', world.expired],
    ['Burned', world.burned],
  ];
  rows.forEach(([label, value], i) => {
    text(ctx, label, 520, 312 + i * 34, 19, '#f4c9a8', 'left', 700);
    text(ctx, String(value), 760, 312 + i * 34, 19, '#ffffff', 'right', 900);
  });
  panel(ctx, LAYOUT.againButton, 16, '#357d2a', '#2f7d27', '#7ee787');
  text(ctx, 'COOK ANOTHER SHIFT', 640, LAYOUT.againButton.y + 30, 22, '#ffffff', 'center', 900);
}

export function drawWorld(ctx, world) {
  ctx.save();
  if (world.shake > 0) {
    ctx.translate(Math.sin(world.time * 60) * world.shake * 5, Math.cos(world.time * 55) * world.shake * 4);
  }
  drawBackdrop(ctx, world);
  drawScorePanel(ctx, world);
  drawTickets(ctx, world);
  drawBins(ctx, world);
  drawChopStation(ctx, world);
  drawWokStation(ctx, world);
  drawSimmerStation(ctx, world);
  drawSteamerStation(ctx, world);
  drawFloorProps(ctx, world);
  drawChef(ctx, world);
  drawPass(ctx, world);
  drawBar(ctx, world);
  drawParticles(ctx, world);
  ctx.restore();
  drawHud(ctx, world);
  drawHintBar(ctx, world);
  if (world.phase === 'title') drawTitle(ctx, world);
  else if (world.phase === 'ended') drawEnded(ctx, world);
  else if (world.phase === 'paused') {
    ctx.fillStyle = 'rgba(12,6,14,0.65)';
    ctx.fillRect(0, 0, 1280, 720);
    text(ctx, 'PAUSED', 640, 330, 52, GOLD, 'center', 900);
    text(ctx, 'Press P to keep cooking', 640, 385, 20, '#ffffff', 'center', 700);
  }
}
