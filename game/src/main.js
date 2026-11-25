// Boot and heartbeat: fit the 1280 by 720 kitchen into any desktop window,
// step the world on a steady clock, and keep the status line honest for
// screen readers while the canvas does the talking.

import { VIEW } from './config.js';
import { attachInput } from './input.js';
import { drawWorld } from './render.js';
import { applyShot } from './shots.js';
import { createWorld, updateWorld } from './world.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || 7);
const world = createWorld(Number.isFinite(seed) ? seed : 7);
const shot = params.get('shot');
if (shot) applyShot(world, shot);

let viewScale = 1;
let viewX = 0;
let viewY = 0;

function resize() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  viewScale = Math.min(canvas.width / VIEW.width, canvas.height / VIEW.height);
  viewX = (canvas.width - VIEW.width * viewScale) / 2;
  viewY = (canvas.height - VIEW.height * viewScale) / 2;
}

function toGamePoint(clientX, clientY) {
  const ratio = window.devicePixelRatio || 1;
  return {
    x: (clientX * ratio - viewX) / viewScale,
    y: (clientY * ratio - viewY) / viewScale,
  };
}

attachInput(canvas, world, toGamePoint);
window.addEventListener('resize', resize);
resize();

let last = performance.now();
let statusAt = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!shot) updateWorld(world, dt);
  else world.time += 0;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#160f14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(viewScale, 0, 0, viewScale, viewX, viewY);
  drawWorld(ctx, world);

  if (now - statusAt > 800) {
    statusAt = now;
    status.textContent = world.phase === 'playing'
      ? 'Score ' + world.score + ', ' + world.orders.length + ' tickets waiting, ' + world.hearts + ' hearts left'
      : 'Wajan Malam, Night Wok Rush';
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
