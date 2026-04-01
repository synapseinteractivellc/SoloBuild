window.game = {
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
    // Gold storage
    coinPursePurchases: 0,
    coinPurseMax: 2,

    // Wood storage
    woodBundlePurchases: 0,
    woodBundleMax: 2,

    // Stone storage
    stoneCartPurchases: 0,
    stoneCartMax: 2,

    // Herb storage
    herbPouchPurchases: 0,
    herbPouchMax: 2,

    // Wood gather improvements
    stoneAxe: false,
    // Stone gather improvements
    pickaxe: false,
    // Herb gather improvements
    herbShears: false
  },
  timers: {
    rumorSearches: 0,
    orkSearches: 0
  },
  unlocks: {
    // tabs
    village: false,
    character: false,
    // Village Locations
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

window.uiRefs = {};
window.resourceCards = {};
window.vitalCards = {};

window.clamp = function (value, min, max) {
  return Math.min(Math.max(value, min), max);
};

window.addLog = function (message) {
  game.log.unshift(message);
  if (game.log.length > 12) game.log.length = 12;
};

window.resourceAtCap = function (id) {
  return game.resources[id].amount >= game.resources[id].max;
};

window.addResource = function (id, amount) {
  const r = game.resources[id];
  const next = clamp(r.amount + amount, 0, r.max);
  const gained = next - r.amount;
  r.amount = next;

  if (r.hidden && r.amount > 0) r.hidden = false;

  return gained;
};

window.spendResource = function (id, amount) {
  const r = game.resources[id];
  if (r.amount < amount) return false;
  r.amount -= amount;
  return true;
};

window.spendStamina = function (amount) {
  if (game.player.stamina < amount) return false;
  game.player.stamina = clamp(
    game.player.stamina - amount,
    0,
    game.player.maxStamina
  );
  return true;
};

window.restoreStamina = function (amount) {
  game.player.stamina = clamp(
    game.player.stamina + amount,
    0,
    game.player.maxStamina
  );
};

window.restoreLife = function (amount) {
  game.player.life = clamp(
    game.player.life + amount,
    0,
    game.player.maxLife
  );
};

window.restoreMana = function (amount) {
  game.player.mana = clamp(
    game.player.mana + amount,
    0,
    game.player.maxMana
  );

  if (game.player.maxMana > 0) {
    game.vitals.mana.hidden = false;
  }
};

window.setMaxMana = function (amount, keepCurrent = false) {
  game.player.maxMana = Math.max(0, amount);

  if (!keepCurrent) {
    game.player.mana = clamp(game.player.mana, 0, game.player.maxMana);
  }

  game.vitals.mana.hidden = game.player.maxMana <= 0;
};

window.gainGold = function (amount) {
  return addResource("gold", amount);
};

window.roll = function (chance) {
  return Math.random() < chance;
};

window.formatNumber = function (value, decimals = 1) {
  return Number(value % 1 === 0 ? value : value.toFixed(decimals));
};