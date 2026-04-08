window.getDefaultGameState = function () {
  return {
    player: {
      name: "Wanderer",
      level: 0,
      xp: 0,
      xpToNext: 1,
      titles: [],
      life: 1,
      maxLife: 10,
      stamina: 1,
      maxStamina: 10,
      mana: 0,
      maxMana: 0,
      speed: 9,
      toHit: 68,
      evasion: 5
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
      horn: { amount: 0, max: 10, hidden: true },
      leather: { amount: 0, max: 5, hidden: true },
      scrolls: { amount: 0, max: 10, hidden: true }
    },

    skills: {
      martial: {
        level: 1,
        xp: 0,
        xpToNext: 10
      }
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
      workSearches: 0,
      towerExploreSearches: 0,
      towerRumorBonusApplied: false
    },

    unlocks: {
      village: false,
      tower: false,
      character: false,
      inn: false,
      market: false,
      blacksmith: false,
      mason: false,
      herbalist: false
    },

    // New Trainer System
    teachers: {
      martial: {
        unlocked: true,
        passedTrial: false
      },
      magic: {
        unlocked: false,
        passedTrial: false
      }
    },
    chosenPath: null,

    // 🔥 NEW TASK SYSTEM
    tasks: {
      active: null
    },

    tower: {
      discovered: false,
      stage: "ruined"
    },

    encounter: {
      active: false,
      location: "wilds",
      playerMode: "punch",
      playerActionProgress: 0,
      enemyActionProgress: 0,
      enemy: null,
      trial: null
    },

    combat: {
      active: false,
      encounterType: null,
      encounterId: null,
      location: null,
      enemy: null,
      trainerTrial: null,
      allowVictoryOnEnemyDeath: true
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

window.mergeGameState = function (defaults, saved) {
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
    result[key] = mergeGameState(defaults[key], saved[key]);
  }

  for (const key of Object.keys(saved)) {
    if (!(key in result)) {
      result[key] = saved[key];
    }
  }

  return result;
};

let gameState = deepClone(getDefaultGameState());

window.getGame = function () {
  return gameState;
};

window.setGame = function (nextState) {
  gameState = nextState;
  return gameState;
};

window.resetGameState = function () {
  gameState = deepClone(getDefaultGameState());
  return gameState;
};

window.applyGameState = function (source) {
  gameState = mergeGameState(getDefaultGameState(), source);
  return gameState;
};