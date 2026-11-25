// Mouse and keyboard both drive the same kitchen verbs: pick a ticket,
// gather, chop, fire the wok, pull the plate, ring the bell.

import { INGREDIENTS } from './config.js';
import { LAYOUT, binRect, inside, ticketRect } from './layout.js';
import {
  addIngredient, chopHit, pullPlate, selectOrder, selectPlate,
  servePlate, startCook, startShift, trashPlate,
} from './world.js';
import { playSound } from './audio.js';

function act(world, result, sound) {
  if (result && result !== 'idle') playSound(world, sound);
  return result;
}

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
    if (inside(ticketRect(i), x, y)) {
      selectOrder(world, i);
      playSound(world, 'pick');
      return;
    }
  }
  for (let i = 0; i < INGREDIENTS.length; i++) {
    if (inside(binRect(i), x, y)) {
      act(world, addIngredient(world, INGREDIENTS[i].id), 'pick');
      return;
    }
  }
  if (inside(LAYOUT.chop, x, y)) {
    act(world, chopHit(world), 'chop');
    return;
  }
  for (let i = 0; i < LAYOUT.woks.length; i++) {
    if (inside(LAYOUT.woks[i], x, y)) {
      if (world.woks[i].plate >= 0) act(world, pullPlate(world, i), 'perfect');
      else act(world, startCook(world, i), 'sizzle');
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
    const result = servePlate(world);
    playSound(world, result === 'served' ? 'coin' : 'bad');
    if (result === 'served') playSound(world, 'bell');
    return;
  }
  if (inside(LAYOUT.trash, x, y)) {
    act(world, trashPlate(world), 'bad');
  }
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
    act(world, addIngredient(world, ingredient.id), 'pick');
    return;
  }
  if (key === ' ') {
    act(world, chopHit(world), 'chop');
    return;
  }
  if (lower === 'q') act(world, world.woks[0].plate >= 0 ? pullPlate(world, 0) : startCook(world, 0), 'sizzle');
  else if (lower === 'w') act(world, world.woks[1].plate >= 0 ? pullPlate(world, 1) : startCook(world, 1), 'sizzle');
  else if (lower === 'e') {
    const result = servePlate(world);
    playSound(world, result === 'served' ? 'coin' : 'bad');
  } else if (lower === 't') act(world, trashPlate(world), 'bad');
  else if (key === 'Tab') selectPlate(world, (world.activePlate + 1) % world.plates.length);
  else if (key === 'ArrowRight') selectOrder(world, Math.min(world.orders.length - 1, world.selectedOrder + 1));
  else if (key === 'ArrowLeft') selectOrder(world, Math.max(0, world.selectedOrder - 1));
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
