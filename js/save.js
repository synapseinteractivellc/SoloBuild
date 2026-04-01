// save.js

window.SAVE_KEY = "pathsOfPowerSave";

window.getDefaultGameState = function () {
  return {
    player: {
      name: "Wanderer",
      level: 0,
      xp: 0,
      xpToNext: 10,
      titles: [],
      life: 1,
      maxLife: 10,
      stamina: 1,
      maxStamina: 10,
      mana: 0,
      maxMana: 0
    },
    vitals: {
      life: {
        label: "Life",
        currentKey: "life",
        maxKey: "maxLife",
        fillClass: "bar-fill-life",
        hidden: false
      },
      stamina: {
        label: "Stamina",
        currentKey: "stamina",
        maxKey: "maxStamina",
        fillClass: "bar-fill-stamina",
        hidden: false
      },
      mana: {
        label: "Mana",
        currentKey: "mana",
        maxKey: "maxMana",
        fillClass: "bar-fill-mana",
        hidden: true
      }
    },
    resources: {
      gold: { amount: 0, max: 10, hidden: false },
      wood: { amount: 0, max: 5, hidden: true },
      stone: { amount: 0, max: 5, hidden: true },
      herbs: { amount: 0, max: 5, hidden: true },
      scrolls: { amount: 0, max: 10, hidden: true }
    },
    upgrades: {
      coinPursePurchases: 0,
      coinPurseMax: 2,
      woodBundlePurchases: 0,
      woodBundleMax: 2,
      stoneCartPurchases: 0,
      stoneCartMax: 2,
      herbPouchPurchases: 0,
      herbPouchMax: 2,
      stoneAxe: false,
      pickaxe: false,
      herbShears: false
    },
    timers: {
      rumorSearches: 0,
      workSearches: 0
    },
    unlocks: {
      village: false,
      character: false,
      inn: false,
      market: false,
      blacksmith: false,
      mason: false,
      herbalist: false
    },
    activeTab: "wilds",
    log: [
      "You awaken battered and exhausted in a world that is not your own."
    ]
  };
};

window.deepClone = function (value) {
  return JSON.parse(JSON.stringify(value));
};

window.mergeDeep = function (defaults, saved) {
  if (saved === null || saved === undefined) {
    return deepClone(defaults);
  }

  if (Array.isArray(defaults)) {
    return Array.isArray(saved) ? saved.slice() : defaults.slice();
  }

  if (typeof defaults !== "object" || defaults === null) {
    return saved !== undefined ? saved : defaults;
  }

  const result = {};

  for (const key of Object.keys(defaults)) {
    result[key] = mergeDeep(defaults[key], saved[key]);
  }

  for (const key of Object.keys(saved)) {
    if (!(key in result)) {
      result[key] = saved[key];
    }
  }

  return result;
};

window.applyLoadedGame = function (target, source) {
  const merged = mergeDeep(getDefaultGameState(), source);

  for (const key of Object.keys(target)) {
    delete target[key];
  }

  Object.assign(target, merged);

  return target;
};

window.saveGame = function (gameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    return true;
  } catch (error) {
    console.error("Failed to save game.", error);
    return false;
  }
};

window.loadGame = function () {
  try {
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) {
      return getDefaultGameState();
    }

    const parsed = JSON.parse(raw);
    return mergeDeep(getDefaultGameState(), parsed);
  } catch (error) {
    console.error("Failed to load save. Using defaults instead.", error);
    return getDefaultGameState();
  }
};

window.resetSave = function () {
  try {
    localStorage.removeItem(SAVE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to reset save.", error);
    return false;
  }
};