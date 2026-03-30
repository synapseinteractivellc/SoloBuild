const game = {
  player: {
    name: "Wanderer",
    level: 0,
    xp: 0,
    xpToNext: 10,
    life: 1,
    maxLife: 10,
    stamina: 1,
    maxStamina: 10,
    titles: [],
    stats: {
      strength: 1,
      endurance: 1,
      perception: 1,
      will: 1,
    },
    skills: {
      woodcutting: { level: 0, xp: 0, maxLevel: 10 },
      labor: { level: 0, xp: 0, maxLevel: 10 },
      exploration: { level: 0, xp: 0, maxLevel: 10 },
      herbology: { level: 0, xp: 0, maxLevel: 10 },
      masonry: { level: 0, xp: 0, maxLevel: 10 },
    },
  },

  resources: {
    gold: { amount: 0, max: 10 },
    wood: { amount: 0, max: 5 },
    herbs: { amount: 0, max: 5 },
    stone: { amount: 0, max: 5 },
    leather: { amount: 0, max: 5 },
    horns: { amount: 0, max: 5 },
    scrolls: { amount: 0, max: 99 },
  },

  world: {
    currentTab: "character",
    currentWildZone: "outskirts",
    towerDiscovered: false,
    towerUnlocked: false,
  },

  unlocks: {
    gatherWood: true,
    chopWood: false,
    gatherHerbs: false,
    gatherStone: false,
    restWilds: true,
    muckStables: true,
    sellWood: true,
    sellHerbs: false,
    sellStone: false,
    rumors: true,
    lookForWork: true,
    hireLaborer: false,
    investigateTower: false,
  },

  upgrades: {
    coinPurse1: false,
    coinPurse2: false,
    stoneAxe: false,
  },

  jobs: {
    alchemistMet: false,
    masonMet: false,
    tannerMet: false,
  },

  workers: {
    laborers: 0,
  },

  timers: {
    playTime: 0,
    workSearches: 0,
    rumorSearches: 0,
  },

  log: [],
};