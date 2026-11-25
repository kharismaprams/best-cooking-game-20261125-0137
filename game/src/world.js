// The kitchen itself: tickets, plates, the chopping board and the two woks.
// This module owns the rules and never draws; render.js only reads its state.

import { CUSTOMERS, CUSTOMER_LOOKS, INGREDIENT_BY_ID, RECIPES, RECIPE_BY_ID, TUNING } from './config.js';
import { makeRng, pick, range } from './random.js';

let nextId = 1;

function makePlate() {
  return { id: nextId++, items: [], state: 'building', cook: 0, quality: null, wok: -1, recipeId: null, born: 0 };
}

export function createWorld(seed = 1) {
  return {
    rng: makeRng(seed),
    seed,
    phase: 'title',
    time: 0,
    shiftLeft: TUNING.shiftSeconds,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    hearts: TUNING.hearts,
    served: 0,
    perfects: 0,
    burned: 0,
    expired: 0,
    orders: [],
    plates: [makePlate(), makePlate(), makePlate()],
    activePlate: 0,
    selectedOrder: -1,
    board: null,
    woks: [{ plate: -1 }, { plate: -1 }, { plate: -1 }],
    nextOrderIn: TUNING.firstOrderAt,
    chefAt: 'counter',
    chefX: 500,
    chefY: 430,
    route: [],
    sounds: [],
    message: '',
    messageUntil: 0,
    particles: [],
    popups: [],
    spice: 0,
    shake: 0,
    muted: false,
    tutorial: 0,
  };
}

export function dishProgress(world, plate) {
  const order = world.orders[world.selectedOrder];
  if (!order) return null;
  const recipe = RECIPE_BY_ID[order.recipeId];
  const have = new Set(plate.items.map((item) => item.id));
  return recipe.needs.map((id) => ({ id, done: have.has(id), chop: INGREDIENT_BY_ID[id].chop }));
}

export function plateMatchesOrder(plate, order) {
  if (!order || plate.state !== 'ready') return false;
  const recipe = RECIPE_BY_ID[order.recipeId];
  if (plate.items.length !== recipe.needs.length) return false;
  const have = new Set(plate.items.map((item) => item.id));
  return recipe.needs.every((id) => have.has(id));
}

export function plateIsComplete(plate, order) {
  if (!order) return false;
  const recipe = RECIPE_BY_ID[order.recipeId];
  if (plate.items.length !== recipe.needs.length) return false;
  const have = new Set(plate.items.map((item) => item.id));
  return recipe.needs.every((id) => have.has(id));
}

function say(world, text) {
  world.message = text;
  world.messageUntil = world.time + 2.4;
}

export function burst(world, x, y, color, count = 10, kind = 'spark') {
  for (let i = 0; i < count; i++) {
    world.particles.push({
      x, y,
      vx: range(world.rng, -70, 70),
      vy: range(world.rng, -130, -30),
      life: range(world.rng, 0.35, 0.8),
      born: world.time,
      color,
      size: range(world.rng, 2, 5),
      kind,
    });
  }
}

export function chopNeeded(world) {
  return world.served >= TUNING.knifeAt ? TUNING.chopHits - 1 : TUNING.chopHits;
}

export function popup(world, x, y, text, color = '#ffd94d') {
  world.popups.push({ x, y, text, color, born: world.time, life: 1.4 });
}

function rushFactor(world) {
  const done = 1 - world.shiftLeft / TUNING.shiftSeconds;
  return Math.min(1, Math.max(0, done));
}

export function spawnOrder(world) {
  if (world.orders.length >= TUNING.maxOrders) return null;
  const rush = rushFactor(world);
  const pool = RECIPES.filter((recipe) => rush > 0.25 || recipe.needs.length <= 4);
  const recipe = pick(world.rng, pool);
  const patience = TUNING.patienceStart + (TUNING.patienceEnd - TUNING.patienceStart) * rush;
  const order = {
    id: nextId++,
    recipeId: recipe.id,
    customer: pick(world.rng, CUSTOMERS),
    look: pick(world.rng, CUSTOMER_LOOKS),
    vip: rush > 0.3 && world.rng() < TUNING.vipChance,
    patience,
    patienceMax: patience,
    born: world.time,
  };
  world.orders.push(order);
  if (world.selectedOrder < 0) world.selectedOrder = 0;
  return order;
}

export function selectOrder(world, index) {
  if (index >= 0 && index < world.orders.length) {
    world.selectedOrder = index;
    world.chefAt = 'board';
  }
}

export function selectPlate(world, index) {
  if (index >= 0 && index < world.plates.length) world.activePlate = index;
}

export function addIngredient(world, ingredientId) {
  const plate = world.plates[world.activePlate];
  const ingredient = INGREDIENT_BY_ID[ingredientId];
  if (!plate || !ingredient || plate.state !== 'building') return 'busy';
  if (world.board) return 'board-busy';
  if (plate.items.some((item) => item.id === ingredientId)) {
    say(world, ingredient.name + ' is already on the plate');
    return 'duplicate';
  }
  if (ingredient.chop) {
    world.board = { id: ingredientId, hits: 0, plate: world.activePlate };
    world.chefAt = 'chop';
    say(world, 'Chop the ' + ingredient.name.toLowerCase() + ' — tap the board');
    return 'chopping';
  }
  plate.items.push({ id: ingredientId, chopped: false });
  world.chefAt = 'counter';
  burst(world, 278 + world.activePlate * 136, 597, ingredient.color, 5);
  return 'added';
}

export function chopHit(world) {
  if (!world.board) return 'idle';
  world.board.hits += 1;
  world.chefAt = 'chop';
  burst(world, 296, 262, INGREDIENT_BY_ID[world.board.id].color, 4);
  if (world.board.hits < chopNeeded(world)) return 'hit';
  const plate = world.plates[world.board.plate];
  plate.items.push({ id: world.board.id, chopped: true });
  say(world, INGREDIENT_BY_ID[world.board.id].name + ' chopped and plated');
  world.board = null;
  return 'done';
}

export function startCook(world, wokIndex) {
  const plate = world.plates[world.activePlate];
  const order = world.orders[world.selectedOrder];
  if (!plate || plate.state !== 'building') return 'busy';
  if (world.woks[wokIndex].plate >= 0) return 'wok-busy';
  if (!plateIsComplete(plate, order)) {
    say(world, 'That plate is not the selected dish yet');
    return 'incomplete';
  }
  const recipe = RECIPE_BY_ID[order.recipeId];
  const stationName = ['wok', 'simmer', 'steam'][wokIndex];
  if (recipe.station !== stationName) {
    say(world, recipe.station === 'simmer' ? 'That dish simmers — use the pot (W)' : recipe.station === 'steam' ? 'That dish steams — use the basket (R)' : 'That dish wants the wok (Q)');
    return 'wrong-station';
  }
  plate.state = 'cooking';
  plate.cook = 0;
  plate.recipeId = order.recipeId;
  plate.wok = wokIndex;
  world.woks[wokIndex].plate = world.activePlate;
  world.chefAt = ['wok1', 'wok2', 'steam'][wokIndex];
  say(world, wokIndex === 0 ? 'In the wok — pull it inside the golden band' : wokIndex === 1 ? 'Simmering — the pot forgives a wider band' : 'Steaming — lift the lid in the gold');
  return 'cooking';
}

export function pullPlate(world, wokIndex) {
  const plateIndex = world.woks[wokIndex].plate;
  if (plateIndex < 0) return 'empty';
  const plate = world.plates[plateIndex];
  const recipe = plate.recipeId ? RECIPE_BY_ID[plate.recipeId] : null;
  const done = recipe ? plate.cook / recipe.cookSeconds : plate.cook;
  const bonus = wokIndex === 1 ? TUNING.simmerBandBonus : wokIndex === 2 ? TUNING.steamBandBonus : 0;
  const bandFrom = TUNING.perfectFrom - bonus;
  const bandTo = TUNING.perfectTo + bonus / 2;
  plate.quality = done >= bandFrom && done <= bandTo ? 'perfect' : done < bandFrom ? 'under' : 'over';
  plate.state = 'ready';
  plate.wok = -1;
  world.woks[wokIndex].plate = -1;
  world.activePlate = plateIndex;
  world.chefAt = 'pass';
  if (plate.quality === 'perfect') world.spice = Math.min(100, world.spice + 18);
  burst(world, [500, 704, 896][wokIndex], 252, '#ffd94d', 12, plate.quality === 'perfect' ? 'heart' : 'spark');
  say(world, plate.quality === 'perfect' ? 'Perfect sear — serve it hot' : 'Plated — serve before it cools');
  return plate.quality;
}

export function servePlate(world) {
  const plate = world.plates[world.activePlate];
  if (!plate || plate.state !== 'ready') return 'not-ready';
  const index = world.orders.findIndex((order) => plateMatchesOrder(plate, order));
  if (index < 0) {
    say(world, 'No ticket wants that plate — check the board');
    return 'no-match';
  }
  const order = world.orders[index];
  const recipe = RECIPE_BY_ID[order.recipeId];
  const tip = Math.round((order.patience / order.patienceMax) * 12) + (world.served >= TUNING.tipJarAt ? TUNING.tipJarBonus : 0);
  const vipBonus = order.vip ? Math.round(recipe.price * TUNING.vipTipShare) : 0;
  const perfectBonus = plate.quality === 'perfect' ? 10 : 0;
  const multiplier = 1 + Math.min(world.combo, TUNING.comboCap) * TUNING.comboStep;
  const gained = Math.round((recipe.price + tip + vipBonus + perfectBonus) * multiplier);
  world.score += gained;
  world.coins += gained;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  world.served += 1;
  if (plate.quality === 'perfect') world.perfects += 1;
  world.orders.splice(index, 1);
  world.plates[world.activePlate] = makePlate();
  world.selectedOrder = world.orders.length ? Math.min(world.selectedOrder, world.orders.length - 1) : -1;
  world.chefAt = 'pass';
  world.spice = Math.min(100, world.spice + 10);
  burst(world, 1130, 250 + index * 84, '#7ee787', 16, 'heart');
  popup(world, 1130, 230 + index * 84, '+' + gained, order.vip ? '#ffb703' : '#7ee787');
  say(world, 'Served ' + recipe.name + ' to ' + order.customer + '  +' + gained);
  return 'served';
}

export function trashPlate(world) {
  const plate = world.plates[world.activePlate];
  if (!plate || plate.state === 'cooking') return 'busy';
  if (world.board && world.board.plate === world.activePlate) world.board = null;
  world.plates[world.activePlate] = makePlate();
  world.combo = 0;
  say(world, 'Plate cleared — fresh start');
  return 'trashed';
}

// The chef walks a queued route: each stop is a floor point plus the
// action to perform on arrival, so a player can plan a whole route —
// counter, board, wok, pass — and watch it run.
const STATION_POINTS = {
  counter: [230, 430],
  chop: [296, 368],
  wok1: [500, 368],
  wok2: [704, 368],
  steam: [896, 368],
  pass: [500, 500],
  board: [500, 430],
};

export function queueAction(world, action) {
  if (world.phase !== 'playing') return 'idle';
  const point = action.kind === 'ingredient' ? STATION_POINTS.counter
    : action.kind === 'chop' ? STATION_POINTS.chop
      : action.kind === 'cook' ? STATION_POINTS[['wok1', 'wok2', 'steam'][action.station]]
        : STATION_POINTS.pass;
  world.route.push({ x: point[0], y: point[1], action });
  if (world.route.length > 8) world.route.shift();
  return 'queued';
}

export function walkTo(world, x, y) {
  if (world.phase !== 'playing') return;
  world.route = [{ x: Math.max(210, Math.min(790, x)), y: Math.max(348, Math.min(520, y)), action: null }];
}

function execAction(world, action) {
  if (!action) return;
  if (action.kind === 'ingredient') {
    addIngredient(world, action.id);
    world.sounds.push('pick');
  } else if (action.kind === 'chop') {
    chopHit(world);
    world.sounds.push('chop');
  } else if (action.kind === 'cook') {
    if (world.woks[action.station].plate >= 0) {
      pullPlate(world, action.station);
      world.sounds.push('perfect');
    } else {
      startCook(world, action.station);
      world.sounds.push('sizzle');
    }
  } else if (action.kind === 'serve') {
    const result = servePlate(world);
    world.sounds.push(result === 'served' ? 'coin' : 'bad');
    if (result === 'served') world.sounds.push('bell');
  } else if (action.kind === 'trash') {
    trashPlate(world);
    world.sounds.push('bad');
  }
}

function moveChef(world, dt) {
  const target = world.route[0];
  if (!target) {
    const spot = STATION_POINTS[world.chefAt] || STATION_POINTS.board;
    const dx = spot[0] - world.chefX;
    const dy = spot[1] - world.chefY;
    const dist = Math.hypot(dx, dy);
    if (dist > 4) {
      const step = Math.min(dist, 200 * dt);
      world.chefX += (dx / dist) * step;
      world.chefY += (dy / dist) * step;
    }
    return;
  }
  const dx = target.x - world.chefX;
  const dy = target.y - world.chefY;
  const dist = Math.hypot(dx, dy);
  const speed = world.route.length > 1 ? 380 : 280;
  if (dist <= Math.max(6, speed * dt)) {
    world.chefX = target.x;
    world.chefY = target.y;
    world.route.shift();
    execAction(world, target.action);
  } else {
    world.chefX += (dx / dist) * speed * dt;
    world.chefY += (dy / dist) * speed * dt;
  }
}

export function startShift(world) {
  const fresh = createWorld(world.seed);
  fresh.phase = 'playing';
  fresh.muted = world.muted;
  Object.assign(world, fresh);
  spawnOrder(world);
  spawnOrder(world);
  say(world, 'First tickets up — pick one and gather');
}

export function updateWorld(world, dt) {
  world.time += dt;
  world.particles = world.particles.filter((p) => world.time - p.born < p.life);
  for (const p of world.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 260 * dt;
  }
  world.popups = world.popups.filter((p) => world.time - p.born < p.life);
  world.shake = Math.max(0, world.shake - dt * 3);
  world.spice = Math.max(0, world.spice - dt * 2.2);
  moveChef(world, dt);
  if (world.phase !== 'playing') return;

  world.shiftLeft -= dt;
  if (world.shiftLeft <= 0) {
    world.shiftLeft = 0;
    world.phase = 'ended';
    return;
  }

  world.nextOrderIn -= dt;
  if (world.nextOrderIn <= 0) {
    spawnOrder(world);
    const rush = rushFactor(world);
    world.nextOrderIn = TUNING.orderGapStart + (TUNING.orderGapEnd - TUNING.orderGapStart) * rush;
  }

  for (let i = world.orders.length - 1; i >= 0; i--) {
    world.orders[i].patience -= dt;
    if (world.orders[i].patience <= 0) {
      const lost = world.orders[i];
      world.orders.splice(i, 1);
      world.expired += 1;
      world.hearts -= 1;
      world.combo = 0;
      world.shake = 1;
      popup(world, 1130, 230 + i * 84, 'left hungry', '#ff6b5e');
      say(world, lost.customer + ' left hungry');
      if (world.selectedOrder >= world.orders.length) world.selectedOrder = world.orders.length - 1;
      if (world.hearts <= 0) {
        world.phase = 'ended';
        return;
      }
    }
  }

  for (const plate of world.plates) {
    if (plate.state !== 'cooking') continue;
    plate.cook += dt * (plate.wok === 1 ? TUNING.simmerRate : plate.wok === 2 ? TUNING.steamRate : 1);
    const recipe = plate.recipeId ? RECIPE_BY_ID[plate.recipeId] : null;
    const done = recipe ? plate.cook / recipe.cookSeconds : 0;
    if (done >= TUNING.burnAt) {
      plate.state = 'burned';
      plate.quality = 'burned';
      world.woks[plate.wok].plate = -1;
      plate.wok = -1;
      world.burned += 1;
      world.combo = 0;
      world.shake = 1;
      burst(world, 500, 252, '#555555', 14);
      say(world, 'Burned — trash it and refire');
    }
  }
}

export function starsFor(world) {
  return TUNING.starTargets.filter((target) => world.score >= target).length;
}

export function formatClock(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return String(minutes).padStart(2, '0') + ':' + String(rest).padStart(2, '0');
}
