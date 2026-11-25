// Screenshot staging: ?shot=rush, ?shot=start, ?shot=cook and ?shot=end
// freeze the kitchen in honest, reachable moments — a ticket mid-assembly,
// a wok inside its golden band, a plate ready at the pass — so the maker
// can photograph the real game the same way every time.

import { RECIPE_BY_ID } from './config.js';

function order(world, recipeId, customer, patienceShare) {
  const recipe = RECIPE_BY_ID[recipeId];
  const patienceMax = 40;
  return {
    id: world.orders.length + 1,
    recipeId: recipe.id,
    customer,
    patience: patienceMax * patienceShare,
    patienceMax,
    born: world.time,
  };
}

function stageRush(world) {
  world.phase = 'playing';
  world.time = 12.4;
  world.shiftLeft = 83;
  world.score = 342;
  world.coins = 342;
  world.combo = 6;
  world.bestCombo = 6;
  world.hearts = 3;
  world.served = 9;
  world.perfects = 4;
  world.orders = [
    order(world, 'nasi-goreng', 'Mbak Sari', 0.72),
    order(world, 'mie-wajan', 'Bimo', 0.55),
    order(world, 'ayam-sambal', 'Ayu', 0.34),
    order(world, 'telur-dadar', 'Pak Dedi', 0.88),
  ];
  world.selectedOrder = 0;
  world.activePlate = 0;
  world.plates[0].items = [
    { id: 'rice', chopped: false },
    { id: 'egg', chopped: false },
    { id: 'chili', chopped: true },
  ];
  world.plates[0].state = 'building';
  world.board = { id: 'greens', hits: 2, plate: 0 };
  world.plates[1].items = [
    { id: 'noodles', chopped: false },
    { id: 'egg', chopped: false },
    { id: 'greens', chopped: true },
    { id: 'chicken', chopped: true },
  ];
  world.plates[1].state = 'cooking';
  world.plates[1].recipeId = 'mie-wajan';
  world.plates[1].cook = RECIPE_BY_ID['mie-wajan'].cookSeconds * 0.8;
  world.plates[1].wok = 0;
  world.woks[0].plate = 1;
  world.plates[2].items = [
    { id: 'egg', chopped: false },
    { id: 'greens', chopped: true },
    { id: 'chili', chopped: true },
  ];
  world.plates[2].state = 'ready';
  world.plates[2].quality = 'perfect';
  world.chefAt = 'chop';
  world.chefX = 156;
  world.message = 'Greens on the board — one more tap';
  world.messageUntil = world.time + 99;
}

function stageCook(world) {
  stageRush(world);
  world.shiftLeft = 47;
  world.score = 518;
  world.combo = 8;
  world.plates[1].cook = RECIPE_BY_ID['mie-wajan'].cookSeconds * 0.9;
  world.board = { id: 'chicken', hits: 1, plate: 0 };
  world.plates[0].items = [
    { id: 'rice', chopped: false },
    { id: 'chili', chopped: true },
  ];
  world.orders[0] = order(world, 'ayam-sambal', 'Ayu', 0.41);
  world.message = 'Wok in the gold — pull it now';
  world.messageUntil = world.time + 99;
}

function stageEnd(world) {
  world.phase = 'ended';
  world.time = 150;
  world.shiftLeft = 0;
  world.score = 684;
  world.coins = 684;
  world.served = 17;
  world.perfects = 8;
  world.bestCombo = 9;
  world.expired = 1;
  world.burned = 1;
  world.hearts = 2;
  world.orders = [order(world, 'mie-wajan', 'Sinta', 0.5)];
  world.plates[0].items = [{ id: 'rice', chopped: false }];
}

export function applyShot(world, name) {
  if (name === 'rush') stageRush(world);
  else if (name === 'cook') stageCook(world);
  else if (name === 'end') stageEnd(world);
  else if (name === 'start') {
    stageRush(world);
    world.phase = 'title';
    world.message = '';
  }
  return name;
}
