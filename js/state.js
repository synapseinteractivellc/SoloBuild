window.game = {
  player: {
    name: "Wanderer",
    level: 0,
    xp: 0,
    xpToNext: 10,
    titles: [],
    life: 10,
    maxLife: 10,
    stamina: 10,
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
  encounter: {
    active: false,
    location: "wilds",
    playerMode: "punch",
    playerActionProgress: 0,
    enemyActionProgress: 0,
    enemy: null
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
  if (game.log.length > 16) game.log.length = 16;
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

window.damageLife = function (amount) {
  game.player.life = clamp(
    game.player.life - amount,
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

window.gainXp = function (amount) {
  game.player.xp += amount;
};

window.getWildsResourceGainAmount = function (resourceId) {
  if (resourceId === "wood") {
    return game.upgrades.stoneAxe ? 2 : 1;
  }

  if (resourceId === "stone") {
    return game.upgrades.pickaxe ? 2 : 1;
  }

  if (resourceId === "herbs") {
    return game.upgrades.herbShears ? 2 : 1;
  }

  return 1;
};

window.createHornedRabbit = function () {
  return {
    id: "hornedRabbit",
    name: "Horned Rabbit",
    life: 8,
    maxLife: 8,
    speed: 12,
    toHit: 83,
    evasion: 5,
    damage: 1
  };
};

window.startEncounter = function (enemy, location = "wilds") {
  game.encounter.active = true;
  game.encounter.location = location;
  game.encounter.playerMode = "punch";
  game.encounter.playerActionProgress = 0;
  game.encounter.enemyActionProgress = 0;
  game.encounter.enemy = enemy;

  addLog(`${enemy.name} encountered.`);
};

window.endEncounter = function () {
  game.encounter.active = false;
  game.encounter.location = "wilds";
  game.encounter.playerMode = "punch";
  game.encounter.playerActionProgress = 0;
  game.encounter.enemyActionProgress = 0;
  game.encounter.enemy = null;
};

window.getPlayerCombatModeLabel = function () {
  const mode = game.encounter.playerMode;

  if (mode === "kick") return "Kick";
  if (mode === "defend") return "Defend";
  if (mode === "flee") return "Flee";
  return "Punch";
};

window.getEffectivePlayerSpeed = function () {
  if (game.encounter.playerMode === "defend") {
    return game.player.speed / 2;
  }

  return game.player.speed;
};

window.getHitChance = function (attackerToHit, defenderEvasion) {
  const reduction = Math.log10(1 + Math.max(0, defenderEvasion)) * 10;
  return clamp(attackerToHit - reduction, 5, 95);
};

window.rollToHit = function (attackerToHit, defenderEvasion) {
  return Math.random() * 100 < getHitChance(attackerToHit, defenderEvasion);
};

window.resolveExploreOutcome = function () {
  const rollValue = Math.random();

  if (rollValue < 0.60) {
    startEncounter(createHornedRabbit(), "wilds");
    return;
  }

  if (rollValue < 0.75) {
    const gained = addResource("wood", getWildsResourceGainAmount("wood"));
    addLog(`You explore the wilds and gather ${gained} wood.`);
    return;
  }

  if (rollValue < 0.89) {
    const gained = addResource("stone", getWildsResourceGainAmount("stone"));
    addLog(`You explore the wilds and gather ${gained} stone.`);
    return;
  }

  if (rollValue < 0.98) {
    const gained = addResource("herbs", getWildsResourceGainAmount("herbs"));
    addLog(`You explore the wilds and gather ${gained} herbs.`);
    return;
  }

  if (rollValue < 0.995) {
    const gained = addResource("gold", 1);
    addLog(`You explore the wilds and find ${gained} gold.`);
    return;
  }

  const gained = addResource("scrolls", 1);
  addLog(
    gained > 0
      ? "You find a strange scroll hidden in the wilds."
      : "You discover a strange scroll, but cannot carry more."
  );
};

window.resolveRabbitLoot = function () {
  const rollValue = Math.random();

  if (rollValue < 0.60) {
    addLog("The Horned Rabbit drops nothing of value.");
    return;
  }

  if (rollValue < 0.84) {
    const gained = addResource("horn", 1);
    addLog(
      gained > 0
        ? "You recover a horn from the Horned Rabbit."
        : "You could have recovered a horn, but cannot carry more."
    );
    return;
  }

  if (rollValue < 0.99) {
    const gained = addResource("leather", 1);
    addLog(
      gained > 0
        ? "You salvage a piece of usable leather."
        : "You could have salvaged leather, but cannot carry more."
    );
    return;
  }

  const hornGained = addResource("horn", 1);
  const leatherGained = addResource("leather", 1);

  if (hornGained > 0 && leatherGained > 0) {
    addLog("Against the odds, you recover both a horn and a strip of leather.");
    return;
  }

  if (hornGained > 0 || leatherGained > 0) {
    addLog("You recover what little usable material remains from the fight.");
    return;
  }

  addLog("The carcass has value, but you cannot carry any of it.");
};

window.handleEncounterVictory = function () {
  const enemyName = game.encounter.enemy ? game.encounter.enemy.name : "Enemy";
  gainXp(1);
  addLog(`${enemyName} defeated. You gain 1 XP.`);
  resolveRabbitLoot();
  endEncounter();
};

window.handlePlayerDefeat = function () {
  addLog("You collapse from your wounds and awaken battered back in the wilds.");

  game.player.life = 1;
  game.player.stamina = 1;

  game.resources.gold.amount = 0;
  game.resources.wood.amount = 0;
  game.resources.stone.amount = 0;
  game.resources.herbs.amount = 0;
  game.resources.horn.amount = 0;
  game.resources.leather.amount = 0;


  endEncounter();
  game.activeTab = "wilds";
};

window.resolvePlayerCombatAction = function () {
  if (!game.encounter.active || !game.encounter.enemy) return false;

  const enemy = game.encounter.enemy;
  const mode = game.encounter.playerMode;

  if (mode === "flee") {
    const fleeChance = clamp(50 + (getEffectivePlayerSpeed() - enemy.speed) * 8, 10, 90);

    if (roll(fleeChance / 100)) {
      addLog(`You escape from the ${enemy.name}.`);
      endEncounter();
      return true;
    }

    addLog(`You fail to escape from the ${enemy.name}.`);
    return true;
  }

  if (mode === "defend") {
    return true;
  }

  let actionName = "punch";
  let damage = 1;

  if (mode === "kick") {
    if (game.player.stamina < 1) {
      game.encounter.playerMode = "punch";
      addLog("Too exhausted to kick. You fall back to punching.");
      actionName = "punch";
      damage = 1;
    } else {
      spendStamina(1);
      actionName = "kick";
      damage = 2;
    }
  }

  const hit = rollToHit(game.player.toHit, enemy.evasion);

  if (!hit) {
    addLog(`You miss the ${enemy.name} with your ${actionName}.`);
    return true;
  }

  enemy.life = clamp(enemy.life - damage, 0, enemy.maxLife);
  addLog(`You ${actionName} the ${enemy.name} for ${damage} damage.`);

  if (enemy.life <= 0) {
    handleEncounterVictory();
  }

  return true;
};

window.resolveEnemyCombatAction = function () {
  if (!game.encounter.active || !game.encounter.enemy) return false;

  const enemy = game.encounter.enemy;
  const playerMode = game.encounter.playerMode;
  const defenderEvasion = playerMode === "flee" ? 0 : game.player.evasion;
  const hit = rollToHit(enemy.toHit, defenderEvasion);

  if (!hit) {
    addLog(`The ${enemy.name} misses you.`);
    return true;
  }

  let damage = enemy.damage;

  if (playerMode === "defend") {
    damage = Math.max(0, damage - 1);
  }

  if (damage <= 0) {
    addLog(`The ${enemy.name} strikes, but your defense absorbs the blow.`);
    return true;
  }

  damageLife(damage);
  addLog(`The ${enemy.name} hits you for ${damage} damage.`);

  if (game.player.life <= 0) {
    handlePlayerDefeat();
  }

  return true;
};

window.runCombatStep = function (deltaSeconds) {
  if (!game.encounter.active || !game.encounter.enemy) return false;

  let changed = false;

  game.encounter.playerActionProgress += deltaSeconds * (getEffectivePlayerSpeed() / 10);
  game.encounter.enemyActionProgress += deltaSeconds * (game.encounter.enemy.speed / 10);

  while (game.encounter.active && game.encounter.playerActionProgress >= 1) {
    game.encounter.playerActionProgress -= 1;
    changed = resolvePlayerCombatAction() || changed;
  }

  while (game.encounter.active && game.encounter.enemyActionProgress >= 1) {
    game.encounter.enemyActionProgress -= 1;
    changed = resolveEnemyCombatAction() || changed;
  }

  return changed;
};