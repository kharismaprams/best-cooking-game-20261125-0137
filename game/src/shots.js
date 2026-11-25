// Screenshot staging: ?shot=rush, ?shot=start, ?shot=cook and ?shot=end
// freeze the stall in honest, reachable moments — tickets up, a plate
// mid-assembly, the pot simmering, a perfect plate at the pass, and
// customers watching their patience rings — so the maker can photograph
// the real game the same way every time.

import { CUSTOMER_LOOKS, RECIPE_BY_ID } from './config.js';

function order(world, recipeId, customer, patienceShare, vip = false) {
  const recipe = RECIPE_BY_ID[recipeId];
  const patienceMax = 40;
  return {
    id: world.orders.length + 1,
    recipeId: recipe.id,
    customer,
    look: CUSTOMER_LOOKS[world.orders.length % CUSTOMER_LOOKS.length],
    vip,
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
  world.spice = 64;
  world.orders = [
    order(world, 'mie-sapi', 'Mbak Sari', 0.72),
    order(world, 'mie-udang', 'Bimo', 0.55, true),
    order(world, 'sapi-sambal', 'Ayu', 0.2),
    order(world, 'pangsit-kuah', 'Pak Dedi', 0.88),
    order(world, 'udang-saus', 'Rina', 0.63),
  ];
  world.selectedOrder = 0;
  world.activePlate = 0;
  world.plates[0].items = [
    { id: 'noodles', chopped: false },
    { id: 'egg', chopped: false },
    { id: 'beef', chopped: true },
  ];
  world.plates[0].state = 'building';
  world.board = { id: 'greens', hits: 2, plate: 0 };
  world.plates[1].items = [
    { id: 'noodles', chopped: false },
    { id: 'prawn', chopped: true },
    { id: 'broth', chopped: false },
    { id: 'greens', chopped: true },
    { id: 'chili', chopped: true },
  ];
  world.plates[1].state = 'cooking';
  world.plates[1].recipeId = 'mie-udang';
  world.plates[1].cook = RECIPE_BY_ID['mie-udang'].cookSeconds * 0.8;
  world.plates[1].wok = 1;
  world.woks[1].plate = 1;
  world.plates[2].items = [
    { id: 'beef', chopped: true },
    { id: 'chili', chopped: true },
    { id: 'greens', chopped: true },
  ];
  world.plates[2].state = 'ready';
  world.plates[2].quality = 'perfect';
  world.plates[2].recipeId = 'sapi-sambal';
  world.chefAt = 'chop';
  world.chefX = 296;
  world.chefY = 430;
  world.route = [
    { x: 296, y: 368, action: { kind: 'chop' } },
    { x: 500, y: 368, action: { kind: 'cook', station: 0 } },
    { x: 500, y: 500, action: { kind: 'serve' } },
  ];
  world.popups = [{ x: 1130, y: 310, text: '+52', color: '#ffb703', born: world.time - 0.3, life: 1.4 }];
  world.message = 'Greens on the board — one more tap';
  world.messageUntil = world.time + 99;
}

function stageCook(world) {
  stageRush(world);
  world.shiftLeft = 47;
  world.score = 518;
  world.coins = 518;
  world.combo = 8;
  world.spice = 82;
  world.plates[1].items = [
    { id: 'noodles', chopped: false },
    { id: 'egg', chopped: false },
    { id: 'greens', chopped: true },
    { id: 'prawn', chopped: true },
  ];
  world.plates[1].recipeId = 'mie-wajan';
  world.plates[1].cook = RECIPE_BY_ID['mie-wajan'].cookSeconds * 0.9;
  world.plates[1].wok = 0;
  world.woks[0].plate = 1;
  world.woks[1].plate = -1;
  world.board = { id: 'prawn', hits: 1, plate: 0 };
  world.plates[0].items = [
    { id: 'dumpling', chopped: false },
    { id: 'chili', chopped: true },
  ];
  world.orders[0] = order(world, 'udang-saus', 'Ayu', 0.41);
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
  world.plates[0].items = [{ id: 'dumpling', chopped: false }];
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
