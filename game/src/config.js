// The pantry, the menu and the pace of the night. Eight ingredients feed
// eight dishes, so a good cook plans one route that serves two tickets at
// once instead of running back and forth for every plate.

export const VIEW = { width: 1280, height: 720 };

export const INGREDIENTS = [
  { id: 'prawn', name: 'Prawn', key: '1', color: '#ff9d7a', dark: '#d95f43', chop: true },
  { id: 'beef', name: 'Beef', key: '2', color: '#c94f4f', dark: '#8c2f2f', chop: true },
  { id: 'noodles', name: 'Noodles', key: '3', color: '#f2c14e', dark: '#c99327', chop: false },
  { id: 'dumpling', name: 'Dumpling', key: '4', color: '#f0dcbc', dark: '#c9a86a', chop: false },
  { id: 'greens', name: 'Greens', key: '5', color: '#57b24a', dark: '#2f7d27', chop: true },
  { id: 'chili', name: 'Chili', key: '6', color: '#e23b2e', dark: '#a51f16', chop: true },
  { id: 'egg', name: 'Egg', key: '7', color: '#ffd94d', dark: '#e0a81c', chop: false },
  { id: 'broth', name: 'Broth', key: '8', color: '#f0a832', dark: '#b96f14', chop: false },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((item) => [item.id, item]));

export const RECIPES = [
  {
    id: 'telur-dadar',
    name: 'Telur Dadar',
    needs: ['egg', 'greens', 'chili'],
    cookSeconds: 4,
    price: 18,
    station: 'steam',
    blurb: 'Steamed omelette, first ticket of the night',
  },
  {
    id: 'mie-sapi',
    name: 'Mie Sapi',
    needs: ['noodles', 'beef', 'greens', 'egg'],
    cookSeconds: 6,
    price: 30,
    station: 'wok',
    blurb: 'Beef noodles tossed in the big wok',
  },
  {
    id: 'sapi-sambal',
    name: 'Sapi Sambal',
    needs: ['beef', 'chili', 'greens'],
    cookSeconds: 7,
    price: 34,
    station: 'wok',
    blurb: 'Beef under a bright chili sambal',
  },
  {
    id: 'mie-wajan',
    name: 'Mie Wajan',
    needs: ['noodles', 'egg', 'greens', 'prawn'],
    cookSeconds: 7,
    price: 36,
    station: 'wok',
    blurb: 'Tossed noodles, greens still crisp',
  },
  {
    id: 'pangsit-kuah',
    name: 'Pangsit Kuah',
    needs: ['dumpling', 'broth', 'greens', 'egg'],
    cookSeconds: 8,
    price: 40,
    station: 'simmer',
    blurb: 'Dumplings in a golden broth',
  },
  {
    id: 'udang-saus',
    name: 'Udang Saus',
    needs: ['prawn', 'chili', 'broth', 'dumpling'],
    cookSeconds: 8,
    price: 46,
    station: 'wok',
    blurb: 'Prawns glossed in a chili broth sauce',
  },
  {
    id: 'mie-udang',
    name: 'Mie Udang',
    needs: ['noodles', 'prawn', 'broth', 'greens', 'chili'],
    cookSeconds: 9,
    price: 52,
    station: 'simmer',
    blurb: 'Prawn noodles in a spiced broth',
  },
  {
    id: 'bakmi-komplit',
    name: 'Bakmi Komplit',
    needs: ['noodles', 'beef', 'prawn', 'egg', 'greens'],
    cookSeconds: 10,
    price: 55,
    station: 'wok',
    blurb: 'The full bowl: beef, prawn, egg, greens',
  },
];

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((recipe) => [recipe.id, recipe]));

export const TUNING = {
  shiftSeconds: 150,
  maxOrders: 5,
  firstOrderAt: 0.8,
  orderGapStart: 9,
  orderGapEnd: 4.2,
  patienceStart: 46,
  patienceEnd: 30,
  chopHits: 3,
  perfectFrom: 0.68,
  perfectTo: 0.92,
  burnAt: 1.18,
  simmerRate: 0.85,
  simmerBandBonus: 0.06,
  steamRate: 0.95,
  steamBandBonus: 0.03,
  knifeAt: 6,
  tipJarAt: 10,
  tipJarBonus: 3,
  vipChance: 0.18,
  vipTipShare: 0.6,
  hearts: 3,
  comboStep: 0.1,
  comboCap: 10,
  starTargets: [260, 480, 720],
};

export const CUSTOMERS = [
  'Mbak Sari', 'Pak Dedi', 'Rina', 'Bimo', 'Ayu', 'Joko', 'Dewi', 'Rudi',
  'Sinta', 'Agus', 'Tari', 'Bambang', 'Lia', 'Fajar', 'Nia', 'Eko',
];

export const CUSTOMER_LOOKS = [
  { skin: '#f2c49b', hair: '#2b1a12', shirt: '#e23b2e', hat: 'cap' },
  { skin: '#c98a5e', hair: '#17131c', shirt: '#2f7d27', hat: 'none' },
  { skin: '#ffd9b3', hair: '#7a4a2b', shirt: '#ffb703', hat: 'bun' },
  { skin: '#a96b3f', hair: '#2b1a12', shirt: '#3a6ea5', hat: 'cap' },
  { skin: '#f2c49b', hair: '#b8506e', shirt: '#7a4a8c', hat: 'bun' },
  { skin: '#8a5a33', hair: '#17131c', shirt: '#ff8c42', hat: 'none' },
];
