// The pantry, the menu and the pace of the night. Every recipe is built from
// the same six ingredients, so a good cook plans one route that feeds two
// tickets at once instead of running back and forth for every dish.

export const VIEW = { width: 1280, height: 720 };

export const INGREDIENTS = [
  { id: 'rice', name: 'Rice', key: '1', color: '#f4ead2', dark: '#cbb98d', chop: false },
  { id: 'noodles', name: 'Noodles', key: '2', color: '#f2c14e', dark: '#c99327', chop: false },
  { id: 'egg', name: 'Egg', key: '3', color: '#ffd94d', dark: '#e0a81c', chop: false },
  { id: 'chicken', name: 'Chicken', key: '4', color: '#e88ca0', dark: '#b8506e', chop: true },
  { id: 'chili', name: 'Chili', key: '5', color: '#e23b2e', dark: '#a51f16', chop: true },
  { id: 'greens', name: 'Greens', key: '6', color: '#57b24a', dark: '#2f7d27', chop: true },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((item) => [item.id, item]));

export const RECIPES = [
  {
    id: 'telur-dadar',
    name: 'Telur Dadar',
    needs: ['egg', 'greens', 'chili'],
    cookSeconds: 4,
    price: 18,
    blurb: 'Quick omelette, first ticket of the night',
  },
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng',
    needs: ['rice', 'egg', 'chili', 'greens'],
    cookSeconds: 6,
    price: 30,
    blurb: 'Smoky fried rice from the big wok',
  },
  {
    id: 'ayam-sambal',
    name: 'Ayam Sambal',
    needs: ['chicken', 'chili', 'rice'],
    cookSeconds: 7,
    price: 34,
    blurb: 'Chicken under a bright chili sambal',
  },
  {
    id: 'mie-wajan',
    name: 'Mie Wajan',
    needs: ['noodles', 'egg', 'greens', 'chicken'],
    cookSeconds: 7,
    price: 36,
    blurb: 'Tossed noodles, greens still crisp',
  },
  {
    id: 'mie-ayam-lada',
    name: 'Mie Ayam Lada',
    needs: ['noodles', 'chicken', 'chili', 'egg'],
    cookSeconds: 8,
    price: 42,
    blurb: 'Peppery chicken noodles with egg ribbons',
  },
  {
    id: 'nasi-ayam-rempah',
    name: 'Nasi Ayam Rempah',
    needs: ['rice', 'chicken', 'greens', 'egg', 'chili'],
    cookSeconds: 10,
    price: 55,
    blurb: 'The full plate: rice, chicken, egg, greens, chili',
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
  hearts: 3,
  comboStep: 0.1,
  comboCap: 10,
  starTargets: [220, 420, 650],
};

export const CUSTOMERS = [
  'Mbak Sari', 'Pak Dedi', 'Rina', 'Bimo', 'Ayu', 'Joko', 'Dewi', 'Rudi',
  'Sinta', 'Agus', 'Tari', 'Bambang', 'Lia', 'Fajar', 'Nia', 'Eko',
];
