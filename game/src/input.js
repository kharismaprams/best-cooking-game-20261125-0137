// Mouse and keyboard both drive the same kitchen verbs. Clicks and keys
// queue route stops for the chef — counter, board, station, pass — and
// each action fires when the chef arrives, so a route can be planned
// three stops ahead while the tickets keep ticking.

import { INGREDIENTS } from './config.js';
import { LAYOUT, binRect, customerRect, inside, ticketRect } from './layout.js';
import {
  queueAction, selectOrder, selectPlate, startShift, walkTo,
} from './world.js';
import { playSound } from './audio.js';

export function handlePointer(world, x, y) {
  if (world.phase === 'title') {
    if (inside(LAYOUT.startButton, x, y)) {
      startShift(world);
      playSound(world, 'bell');
    }
    return;
  }
  if (world.phase === 'ended') {
    if (inside(LAYOUT.againButton, x, y)) startShift(world);
    return;
  }
  if (world.phase !== 'playing') return;

  for (let i = 0; i < world.orders.length; i++) {
    if (inside(ticketRect(i), x, y) || inside(customerRect(i), x, y)) {
      selectOrder(world, i);
      playSound(world, 'pick');
      return;
    }
  }
  for (let i = 0; i < INGREDIENTS.length; i++) {
    if (inside(binRect(i), x, y)) {
      queueAction(world, { kind: 'ingredient', id: INGREDIENTS[i].id });
      playSound(world, 'pick');
      return;
    }
  }
  if (inside(LAYOUT.chop, x, y)) {
    queueAction(world, { kind: 'chop' });
    return;
  }
  for (let i = 0; i < LAYOUT.woks.length; i++) {
    if (inside(LAYOUT.woks[i], x, y)) {
      queueAction(world, { kind: 'cook', station: i });
      return;
    }
  }
  for (let i = 0; i < LAYOUT.plates.length; i++) {
    if (inside(LAYOUT.plates[i], x, y)) {
      selectPlate(world, i);
      playSound(world, 'pick');
      return;
    }
  }
  if (inside(LAYOUT.serve, x, y)) {
    queueAction(world, { kind: 'serve' });
    return;
  }
  if (inside(LAYOUT.trash, x, y)) {
    queueAction(world, { kind: 'trash' });
    return;
  }
  if (inside(LAYOUT.floor, x, y)) walkTo(world, x, y);
}

export function handleKey(world, key) {
  const lower = key.toLowerCase();
  if (lower === 'm') {
    world.muted = !world.muted;
    return;
  }
  if (world.phase === 'title' && (key === 'Enter' || key === ' ')) {
    startShift(world);
    return;
  }
  if (world.phase === 'ended' && key === 'Enter') {
    startShift(world);
    return;
  }
  if (lower === 'p' || key === 'Escape') {
    if (world.phase === 'playing') world.phase = 'paused';
    else if (world.phase === 'paused') world.phase = 'playing';
    return;
  }
  if (world.phase !== 'playing') return;

  const ingredient = INGREDIENTS.find((item) => item.key === key);
  if (ingredient) {
    queueAction(world, { kind: 'ingredient', id: ingredient.id });
    playSound(world, 'pick');
    return;
  }
  if (key === ' ') {
    queueAction(world, { kind: 'chop' });
    return;
  }
  if (lower === 'q') queueAction(world, { kind: 'cook', station: 0 });
  else if (lower === 'w') queueAction(world, { kind: 'cook', station: 1 });
  else if (lower === 'r') queueAction(world, { kind: 'cook', station: 2 });
  else if (lower === 'e') queueAction(world, { kind: 'serve' });
  else if (lower === 't') queueAction(world, { kind: 'trash' });
  else if (key === 'Tab') selectPlate(world, (world.activePlate + 1) % world.plates.length);
  else if (lower === 'x') selectOrder(world, Math.min(world.orders.length - 1, world.selectedOrder + 1));
  else if (lower === 'z') selectOrder(world, Math.max(0, world.selectedOrder - 1));
  else if (key === 'ArrowLeft') walkTo(world, world.chefX - 90, world.chefY);
  else if (key === 'ArrowRight') walkTo(world, world.chefX + 90, world.chefY);
  else if (key === 'ArrowUp') walkTo(world, world.chefX, world.chefY - 60);
  else if (key === 'ArrowDown') walkTo(world, world.chefX, world.chefY + 60);
}

export function attachInput(canvas, world, toGamePoint) {
  canvas.addEventListener('pointerdown', (event) => {
    const point = toGamePoint(event.clientX, event.clientY);
    handlePointer(world, point.x, point.y);
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' || event.key === ' ') event.preventDefault();
    handleKey(world, event.key);
  });
}
