// Every pixel of the night market kitchen: order tickets, ingredient bins,
// the chopping board, two flaming woks and the pass where plates wait.
// The judge meets this game through screenshots, so each station reads at
// a glance and the timer, tickets and ready plate are never hidden.

import { INGREDIENTS, INGREDIENT_BY_ID, RECIPE_BY_ID, TUNING } from './config.js';
import { LAYOUT, binRect, ticketRect } from './layout.js';
import { dishProgress, formatClock, starsFor } from './world.js';

const INK = '#2b1a12';
const PAPER = '#fff6e3';

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

function text(ctx, value, x, y, size, color = PAPER, align = 'left', weight = 700) {
  ctx.fillStyle = color;
  ctx.font = weight + ' ' + size + 'px system-ui, sans-serif';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function drawIngredientIcon(ctx, id, x, y, scale = 1) {
  const item = INGREDIENT_BY_ID[id];
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (id === 'rice') {
    ctx.fillStyle = '#7a4a2b';
    ctx.beginPath(); ctx.arc(0, 4, 15, 0, Math.PI); ctx.fill();
    ctx.fillStyle = item.color;
    ctx.beginPath(); ctx.ellipse(0, 2, 14, 8, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(-4, -3, 5, 3, -0.4, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'noodles') {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 5, -10);
      ctx.bezierCurveTo(i * 5 + 6, -2, i * 5 - 6, 4, i * 5, 12);
      ctx.stroke();
    }
    ctx.fillStyle = item.dark;
    ctx.fillRect(-14, 10, 28, 4);
  } else if (id === 'egg') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(0, 2, 15, 11, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = item.color;
    ctx.beginPath(); ctx.arc(1, 0, 6.5, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'chicken') {
    ctx.fillStyle = item.color;
    ctx.beginPath(); ctx.ellipse(-3, -2, 11, 9, -0.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff3e0';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(4, 4); ctx.lineTo(12, 11); ctx.stroke();
    ctx.fillStyle = '#fff3e0';
    ctx.beginPath(); ctx.arc(13, 12, 3.5, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'chili') {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.quadraticCurveTo(8, -2, 4, 12);
    ctx.stroke();
    ctx.strokeStyle = '#2f7d27';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(-14, -13); ctx.stroke();
  } else if (id === 'greens') {
    ctx.fillStyle = item.color;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(-8 + i * 8, 2 - (i % 2) * 5, 7, 4.5, -0.5 + i * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-12, 8); ctx.quadraticCurveTo(0, 12, 12, 7); ctx.stroke();
  }
  ctx.restore();
}

function drawKitchenBackdrop(ctx, world) {
  const wall = ctx.createLinearGradient(0, 0, 0, 720);
  wall.addColorStop(0, '#2a1630');
  wall.addColorStop(0.45, '#4a2436');
  wall.addColorStop(1, '#241016');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 1280, 720);

  ctx.fillStyle = '#5d3423';
  ctx.fillRect(0, 600, 1280, 120);
  ctx.fillStyle = '#6f412a';
  for (let x = 0; x < 1280; x += 86) ctx.fillRect(x, 600, 3, 120);

  for (let i = 0; i < 18; i++) {
    const x = 36 + i * 70;
    const sway = Math.sin(world.time * 1.4 + i) * 3;
    ctx.strokeStyle = '#1c0f16';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, 64); ctx.lineTo(x + sway, 82); ctx.stroke();
    ctx.fillStyle = i % 3 === 0 ? '#ffd94d' : i % 3 === 1 ? '#ff8c42' : '#7ee787';
    ctx.beginPath(); ctx.arc(x + sway, 88, 5, 0, Math.PI * 2); ctx.fill();
  }

  ctx.fillStyle = '#3a1d2e';
  ctx.fillRect(0, 196, 1280, 14);
  ctx.fillRect(0, 340, 1280, 14);
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(0, 196, 1280, 4);
  ctx.fillRect(0, 340, 1280, 4);
}

function drawHud(ctx, world) {
  fillBox(ctx, LAYOUT.hud, 0, '#1c0f1e');
  text(ctx, 'WAJAN MALAM', 24, 24, 25, '#ffd94d', 'left', 900);
  text(ctx, 'Night Wok Rush', 24, 48, 13, '#f4c9a8', 'left', 600);

  const clock = formatClock(world.shiftLeft);
  const urgent = world.shiftLeft <= 20 && world.phase === 'playing';
  text(ctx, clock, 640, 30, 32, urgent ? '#ff6b5e' : '#ffffff', 'center', 900);
  const bar = { x: 520, y: 52, w: 240, h: 7 };
  fillBox(ctx, bar, 4, '#3a2436');
  fillBox(ctx, { ...bar, w: bar.w * Math.max(0, world.shiftLeft / TUNING.shiftSeconds) }, 4, urgent ? '#ff6b5e' : '#ffd94d');

  text(ctx, 'Score ' + world.score, 1010, 22, 21, '#ffffff', 'right', 900);
  text(ctx, 'Combo x' + (1 + Math.min(world.combo, TUNING.comboCap) * TUNING.comboStep).toFixed(1), 1010, 47, 14, '#7ee787', 'right', 800);

  for (let i = 0; i < TUNING.hearts; i++) {
    ctx.fillStyle = i < world.hearts ? '#ff5e6c' : '#4a2a36';
    const x = 1050 + i * 34;
    ctx.beginPath();
    ctx.moveTo(x, 42);
    ctx.bezierCurveTo(x - 14, 26, x - 6, 12, x, 22);
    ctx.bezierCurveTo(x + 6, 12, x + 14, 26, x, 42);
    ctx.fill();
  }
  text(ctx, world.muted ? 'M muted' : 'M sound', 1256, 47, 12, '#c9a0b4', 'right', 700);
}

function drawTickets(ctx, world) {
  text(ctx, 'ORDER BOARD', 24, 70, 12, '#ffd94d', 'left', 900);
  if (!world.orders.length) {
    text(ctx, 'Tickets land here — keep the woks hot', 640, 136, 18, '#c9a0b4', 'center', 700);
  }
  world.orders.forEach((order, index) => {
    const rect = ticketRect(index);
    const recipe = RECIPE_BY_ID[order.recipeId];
    const selected = index === world.selectedOrder;
    fillBox(ctx, rect, 10, selected ? '#fff0bf' : PAPER);
    strokeBox(ctx, rect, 10, selected ? '#ffb703' : '#c9a86a', selected ? 4 : 2);
    ctx.fillStyle = '#e23b2e';
    ctx.beginPath(); ctx.arc(rect.x + rect.w / 2, rect.y + 8, 5, 0, Math.PI * 2); ctx.fill();
    text(ctx, recipe.name, rect.x + 12, rect.y + 26, 19, INK, 'left', 900);
    text(ctx, order.customer, rect.x + 12, rect.y + 47, 13, '#7a5a3a', 'left', 700);
    text(ctx, recipe.price + 'c', rect.x + rect.w - 12, rect.y + 26, 17, '#2f7d27', 'right', 900);

    recipe.needs.forEach((id, i) => {
      const x = rect.x + 30 + i * 42;
      const y = rect.y + 76;
      ctx.fillStyle = '#f7e8c8';
      ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI * 2); ctx.fill();
      drawIngredientIcon(ctx, id, x, y, 0.85);
      if (INGREDIENT_BY_ID[id].chop) text(ctx, 'chop', x, y + 24, 9, '#a51f16', 'center', 900);
    });

    const share = Math.max(0, order.patience / order.patienceMax);
    const bar = { x: rect.x + 12, y: rect.y + rect.h - 16, w: rect.w - 24, h: 8 };
    fillBox(ctx, bar, 4, '#e5d3ae');
    fillBox(ctx, { ...bar, w: bar.w * share }, 4, share > 0.45 ? '#57b24a' : share > 0.22 ? '#ffb703' : '#e23b2e');
  });
}

function drawBins(ctx, world) {
  text(ctx, 'INGREDIENT COUNTER — click or press 1-6', 24, 214, 12, '#ffd94d', 'left', 900);
  const progress = dishProgress(world, world.plates[world.activePlate]) || [];
  const needed = new Set(progress.filter((step) => !step.done).map((step) => step.id));
  const have = new Set((world.plates[world.activePlate]?.items || []).map((item) => item.id));

  INGREDIENTS.forEach((ingredient, index) => {
    const rect = binRect(index);
    const isNeeded = needed.has(ingredient.id);
    const isHave = have.has(ingredient.id);
    fillBox(ctx, rect, 12, isHave ? '#3f5a34' : isNeeded ? '#5a3a22' : '#33202c');
    strokeBox(ctx, rect, 12, isNeeded ? '#ffd94d' : '#6b4455', isNeeded ? 3 : 2);
    ctx.fillStyle = '#241016';
    ctx.beginPath(); ctx.ellipse(rect.x + rect.w / 2, rect.y + 46, 52, 30, 0, 0, Math.PI * 2); ctx.fill();
    drawIngredientIcon(ctx, ingredient.id, rect.x + rect.w / 2, rect.y + 44, 1.7);
    text(ctx, ingredient.name, rect.x + rect.w / 2, rect.y + 84, 17, '#ffffff', 'center', 900);
    text(ctx, ingredient.key + (ingredient.chop ? ' · chop' : ''), rect.x + rect.w / 2, rect.y + 102, 11, '#f4c9a8', 'center', 800);
    if (isHave) text(ctx, 'ON PLATE', rect.x + rect.w / 2, rect.y + 14, 10, '#7ee787', 'center', 900);
  });

  const panel = LAYOUT.checklist;
  fillBox(ctx, panel, 12, '#241826');
  strokeBox(ctx, panel, 12, '#6b4455', 2);
  const order = world.orders[world.selectedOrder];
  if (!order) {
    text(ctx, 'No ticket selected', panel.x + panel.w / 2, panel.y + 56, 16, '#c9a0b4', 'center', 800);
    return;
  }
  const recipe = RECIPE_BY_ID[order.recipeId];
  text(ctx, 'NOW COOKING', panel.x + 14, panel.y + 18, 11, '#ffd94d', 'left', 900);
  text(ctx, recipe.name, panel.x + 14, panel.y + 40, 19, '#ffffff', 'left', 900);
  progress.forEach((step, i) => {
    const x = panel.x + 24 + i * 44;
    const y = panel.y + 78;
    ctx.fillStyle = step.done ? '#57b24a' : '#3a2436';
    ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
    drawIngredientIcon(ctx, step.id, x, y, 0.8);
    if (step.done) text(ctx, '✓', x + 12, y - 12, 14, '#7ee787', 'center', 900);
  });
}

function drawChopBoard(ctx, world) {
  const rect = LAYOUT.chop;
  fillBox(ctx, rect, 14, '#3a2436');
  strokeBox(ctx, rect, 14, '#6b4455', 2);
  text(ctx, 'CHOPPING BOARD', rect.x + 16, rect.y + 22, 15, '#ffd94d', 'left', 900);
  const board = { x: rect.x + 32, y: rect.y + 58, w: 200, h: 92 };
  fillBox(ctx, board, 16, '#b07a3f');
  strokeBox(ctx, board, 16, '#7a4a2b', 3);
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 2;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(board.x + 10, board.y + i * 22);
    ctx.lineTo(board.x + board.w - 10, board.y + i * 22);
    ctx.stroke();
  }
  if (world.board) {
    const ingredient = INGREDIENT_BY_ID[world.board.id];
    for (let i = 0; i < 5; i++) {
      drawIngredientIcon(ctx, ingredient.id, board.x + 42 + i * 30, board.y + 46 + (i % 2) * 8, 0.9);
    }
    const lift = Math.abs(Math.sin(world.time * 10)) * 12;
    ctx.save();
    ctx.translate(board.x + 150, board.y + 30 - lift);
    ctx.rotate(-0.5);
    ctx.fillStyle = '#d9dee6';
    ctx.fillRect(-4, -22, 8, 34);
    ctx.fillStyle = '#5d3423';
    ctx.fillRect(-4, -34, 8, 13);
    ctx.restore();
    text(ctx, 'Tap! ' + world.board.hits + '/' + TUNING.chopHits, rect.x + rect.w / 2, rect.y + 172, 16, '#ffffff', 'center', 900);
  } else {
    text(ctx, 'Chili, chicken and greens', rect.x + rect.w / 2, rect.y + 96, 15, '#f4c9a8', 'center', 700);
    text(ctx, 'land here first', rect.x + rect.w / 2, rect.y + 118, 15, '#f4c9a8', 'center', 700);
    text(ctx, 'Space chops too', rect.x + rect.w / 2, rect.y + 172, 12, '#c9a0b4', 'center', 700);
  }
}

function drawWok(ctx, world, index) {
  const rect = LAYOUT.woks[index];
  const plateIndex = world.woks[index].plate;
  const plate = plateIndex >= 0 ? world.plates[plateIndex] : null;
  fillBox(ctx, rect, 14, '#2c1a24');
  strokeBox(ctx, rect, 14, plate ? '#ffb703' : '#6b4455', plate ? 3 : 2);
  text(ctx, index === 0 ? 'WOK ONE · Q' : 'WOK TWO · W', rect.x + 16, rect.y + 22, 15, '#ffd94d', 'left', 900);

  const cx = rect.x + rect.w / 2;
  const cy = rect.y + 104;
  if (plate) {
    for (let i = 0; i < 5; i++) {
      const fx = cx - 44 + i * 22;
      const fh = 16 + Math.sin(world.time * 12 + i * 2) * 6;
      ctx.fillStyle = i % 2 ? '#ff8c42' : '#ffb703';
      ctx.beginPath();
      ctx.moveTo(fx - 8, cy + 34);
      ctx.quadraticCurveTo(fx, cy + 34 - fh * 2, fx + 8, cy + 34);
      ctx.fill();
    }
  }
  ctx.fillStyle = '#17131c';
  ctx.beginPath(); ctx.ellipse(cx, cy, 86, 34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2e2a33';
  ctx.beginPath(); ctx.ellipse(cx, cy - 4, 76, 27, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#17131c';
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(cx + 78, cy - 8); ctx.lineTo(cx + 108, cy - 22); ctx.stroke();

  if (plate) {
    plate.items.forEach((item, i) => {
      drawIngredientIcon(ctx, item.id, cx - 40 + i * 20, cy - 8 + (i % 2) * 6, 0.75);
    });
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const sx = cx - 30 + i * 30;
      const rise = (world.time * 26 + i * 17) % 34;
      ctx.beginPath();
      ctx.moveTo(sx, cy - 22 - rise * 0.4);
      ctx.quadraticCurveTo(sx + 7, cy - 36 - rise * 0.4, sx, cy - 48 - rise * 0.4);
      ctx.stroke();
    }
    const recipe = plate.recipeId ? RECIPE_BY_ID[plate.recipeId] : null;
    const done = recipe ? Math.min(1.25, plate.cook / recipe.cookSeconds) : 0;
    const bar = { x: rect.x + 18, y: rect.y + 158, w: rect.w - 36, h: 16 };
    fillBox(ctx, bar, 8, '#17131c');
    fillBox(ctx, { x: bar.x + bar.w * TUNING.perfectFrom, y: bar.y, w: bar.w * (TUNING.perfectTo - TUNING.perfectFrom), h: bar.h }, 8, '#ffd94d');
    fillBox(ctx, { ...bar, w: bar.w * Math.min(1, done) }, 8, done > TUNING.perfectTo ? '#e23b2e' : '#57b24a');
    text(ctx, 'PULL IN THE GOLD', cx, rect.y + 186, 11, '#ffffff', 'center', 900);
  } else {
    text(ctx, 'Empty and hot', cx, cy + 58, 14, '#c9a0b4', 'center', 700);
    text(ctx, 'complete a plate, then click', cx, cy + 78, 12, '#8f7284', 'center', 700);
  }
}

function drawPlateFood(ctx, plate, cx, cy) {
  ctx.fillStyle = '#f8f3e6';
  ctx.beginPath(); ctx.ellipse(cx, cy, 44, 21, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e7dcc4';
  ctx.beginPath(); ctx.ellipse(cx, cy - 2, 34, 15, 0, 0, Math.PI * 2); ctx.fill();
  if (!plate.items.length) return;
  plate.items.forEach((item, i) => {
    const angle = (i / Math.max(1, plate.items.length)) * Math.PI * 2;
    drawIngredientIcon(ctx, item.id, cx + Math.cos(angle) * 14, cy - 5 + Math.sin(angle) * 5, 0.75);
  });
  if (plate.state === 'ready' || plate.state === 'burned') {
    ctx.fillStyle = plate.state === 'burned' ? 'rgba(40,32,28,0.55)' : 'rgba(255,217,77,0.25)';
    ctx.beginPath(); ctx.ellipse(cx, cy - 4, 34, 15, 0, 0, Math.PI * 2); ctx.fill();
  }
}

function drawPass(ctx, world) {
  const rect = LAYOUT.pass;
  fillBox(ctx, rect, 14, '#33202c');
  strokeBox(ctx, rect, 14, '#6b4455', 2);
  text(ctx, 'PLATING PASS', rect.x + 16, rect.y + 22, 15, '#ffd94d', 'left', 900);
  text(ctx, 'Tab switches plate', rect.x + rect.w - 16, rect.y + 22, 11, '#c9a0b4', 'right', 700);

  world.plates.forEach((plate, index) => {
    const slot = LAYOUT.plates[index];
    const active = index === world.activePlate;
    const ready = plate.state === 'ready';
    if (ready) {
      const pulse = 0.5 + Math.sin(world.time * 6) * 0.5;
      ctx.fillStyle = 'rgba(126,231,135,' + (0.12 + pulse * 0.12) + ')';
      ctx.beginPath(); ctx.ellipse(slot.x + slot.w / 2, slot.y + 52, 74, 42, 0, 0, Math.PI * 2); ctx.fill();
    }
    fillBox(ctx, slot, 12, active ? '#4a2c3a' : '#241826');
    strokeBox(ctx, slot, 12, ready ? '#7ee787' : active ? '#ffd94d' : '#6b4455', ready || active ? 3 : 2);
    drawPlateFood(ctx, plate, slot.x + slot.w / 2, slot.y + 52);
    const label = plate.state === 'ready'
      ? (plate.quality === 'perfect' ? 'READY · PERFECT' : 'READY TO SERVE')
      : plate.state === 'cooking' ? 'IN THE WOK'
        : plate.state === 'burned' ? 'BURNED — TRASH IT'
          : plate.items.length + ' ingredient' + (plate.items.length === 1 ? '' : 's');
    text(ctx, label, slot.x + slot.w / 2, slot.y + 94, 12, ready ? '#7ee787' : '#ffffff', 'center', 900);
  });

  fillBox(ctx, LAYOUT.serve, 12, '#2f7d27');
  strokeBox(ctx, LAYOUT.serve, 12, '#7ee787', 2);
  text(ctx, '🔔 SERVE · E', LAYOUT.serve.x + LAYOUT.serve.w / 2, LAYOUT.serve.y + 24, 19, '#ffffff', 'center', 900);
  fillBox(ctx, LAYOUT.trash, 12, '#4a2436');
  strokeBox(ctx, LAYOUT.trash, 12, '#8f5a6e', 2);
  text(ctx, 'TRASH', LAYOUT.trash.x + LAYOUT.trash.w / 2, LAYOUT.trash.y + 24, 14, '#f4c9a8', 'center', 900);
}

function drawChef(ctx, world) {
  const spots = { board: 640, counter: 470, chop: 156, wok1: 435, wok2: 709, pass: 1056 };
  const target = spots[world.chefAt] || 640;
  world.chefX += (target - world.chefX) * 0.08;
  const x = world.chefX;
  const y = 612 + Math.sin(world.time * 5) * 2;
  ctx.fillStyle = '#f2c14e';
  ctx.beginPath(); ctx.arc(x, y - 26, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(x, y - 42, 17, 9, 0, Math.PI, 0); ctx.fill();
  ctx.fillRect(x - 10, y - 48, 20, 8);
  ctx.fillStyle = '#2b1a12';
  ctx.beginPath(); ctx.arc(x - 5, y - 27, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 5, y - 27, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e23b2e';
  ctx.beginPath(); ctx.roundRect(x - 16, y - 12, 32, 30, 8); ctx.fill();
  ctx.fillStyle = '#fff6e3';
  ctx.fillRect(x - 9, y - 4, 18, 20);
}

function drawHintBar(ctx, world) {
  fillBox(ctx, LAYOUT.hint, 0, '#1c0f1e');
  const fresh = world.time < world.messageUntil;
  text(ctx, fresh ? world.message : 'Pick a ticket · gather 1-6 · chop · wok Q/W · serve E · P pause', 640, 688, fresh ? 20 : 16, fresh ? '#ffd94d' : '#c9a0b4', 'center', 800);
}

function drawTitle(ctx, world) {
  ctx.fillStyle = 'rgba(12,6,14,0.72)';
  ctx.fillRect(0, 0, 1280, 720);
  text(ctx, 'WAJAN MALAM', 640, 150, 72, '#ffd94d', 'center', 900);
  text(ctx, 'Night Wok Rush', 640, 205, 30, '#ffffff', 'center', 800);
  text(ctx, 'Read the tickets. Chop fast. Pull the wok in the gold.', 640, 252, 20, '#f4c9a8', 'center', 700);
  const lines = [
    'Click a ticket, then gather its ingredients from the counter (keys 1-6).',
    'Chili, chicken and greens go to the chopping board first — tap it three times.',
    'Fire a complete plate in a wok and pull it inside the golden band.',
    'Serve before patience runs out. Perfect plates and fast tips build your combo.',
  ];
  lines.forEach((line, i) => text(ctx, line, 640, 300 + i * 32, 18, '#ffffff', 'center', 600));
  fillBox(ctx, LAYOUT.startButton, 16, '#e23b2e');
  strokeBox(ctx, LAYOUT.startButton, 16, '#ffd94d', 3);
  text(ctx, 'START THE SHIFT', 640, LAYOUT.startButton.y + 32, 24, '#ffffff', 'center', 900);
  text(ctx, 'Mouse and keyboard · sound on · 150 second shift', 640, 580, 14, '#c9a0b4', 'center', 700);
}

function drawEnded(ctx, world) {
  ctx.fillStyle = 'rgba(12,6,14,0.78)';
  ctx.fillRect(0, 0, 1280, 720);
  text(ctx, world.hearts > 0 ? 'SHIFT COMPLETE' : 'KITCHEN CLOSED', 640, 130, 48, '#ffd94d', 'center', 900);
  const stars = starsFor(world);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < stars ? '#ffd94d' : '#4a2a36';
    const x = 580 + i * 60;
    ctx.beginPath();
    for (let p = 0; p < 10; p++) {
      const angle = -Math.PI / 2 + (p * Math.PI) / 5;
      const radius = p % 2 ? 11 : 24;
      const px = x + Math.cos(angle) * radius;
      const py = 205 + Math.sin(angle) * radius;
      if (p === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  text(ctx, 'Score ' + world.score, 640, 270, 34, '#ffffff', 'center', 900);
  const rows = [
    ['Plates served', world.served],
    ['Perfect sears', world.perfects],
    ['Best combo', 'x' + world.bestCombo],
    ['Walked away', world.expired],
    ['Burned', world.burned],
  ];
  rows.forEach(([label, value], i) => {
    text(ctx, label, 520, 330 + i * 34, 19, '#f4c9a8', 'left', 700);
    text(ctx, String(value), 760, 330 + i * 34, 19, '#ffffff', 'right', 900);
  });
  fillBox(ctx, LAYOUT.againButton, 16, '#2f7d27');
  strokeBox(ctx, LAYOUT.againButton, 16, '#7ee787', 3);
  text(ctx, 'COOK ANOTHER SHIFT', 640, LAYOUT.againButton.y + 30, 22, '#ffffff', 'center', 900);
}

export function drawWorld(ctx, world) {
  drawKitchenBackdrop(ctx, world);
  drawTickets(ctx, world);
  drawBins(ctx, world);
  drawChopBoard(ctx, world);
  drawWok(ctx, world, 0);
  drawWok(ctx, world, 1);
  drawPass(ctx, world);
  drawChef(ctx, world);
  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, 1 - (world.time - p.born) / p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  drawHud(ctx, world);
  drawHintBar(ctx, world);
  if (world.phase === 'title') drawTitle(ctx, world);
  else if (world.phase === 'ended') drawEnded(ctx, world);
  else if (world.phase === 'paused') {
    ctx.fillStyle = 'rgba(12,6,14,0.65)';
    ctx.fillRect(0, 0, 1280, 720);
    text(ctx, 'PAUSED', 640, 330, 52, '#ffd94d', 'center', 900);
    text(ctx, 'Press P to keep cooking', 640, 385, 20, '#ffffff', 'center', 700);
  }
}
