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
  const game = getGame();

  game.encounter.active = true;
  game.encounter.location = location;
  game.encounter.playerMode = "punch";
  game.encounter.playerActionProgress = 0;
  game.encounter.enemyActionProgress = 0;
  game.encounter.enemy = enemy;

  addLog(`${enemy.name} encountered.`);
};

window.endEncounter = function () {
  const game = getGame();

  game.encounter.active = false;
  game.encounter.location = "wilds";
  game.encounter.playerMode = "punch";
  game.encounter.playerActionProgress = 0;
  game.encounter.enemyActionProgress = 0;
  game.encounter.enemy = null;
};

window.setPlayerCombatMode = function (mode) {
  const game = getGame();
  game.encounter.playerMode = mode;
};

window.getPlayerCombatModeLabel = function () {
  const game = getGame();
  const mode = game.encounter.playerMode;

  if (mode === "kick") return "Kick";
  if (mode === "defend") return "Defend";
  if (mode === "flee") return "Flee";
  return "Punch";
};

window.getEffectivePlayerSpeed = function () {
  const game = getGame();

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

window.resolveRabbitLoot = function () {
  const rollValue = Math.random();

  if (rollValue < 0.6) {
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
  const game = getGame();
  const enemyName = game.encounter.enemy ? game.encounter.enemy.name : "Enemy";

  gainXp(1);
  addLog(`${enemyName} defeated. You gain 1 XP.`);
  resolveRabbitLoot();
  endEncounter();
};

window.handlePlayerDefeat = function () {
  const game = getGame();

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
  const game = getGame();

  if (!game.encounter.active || !game.encounter.enemy) {
    return false;
  }

  const enemy = game.encounter.enemy;
  const mode = game.encounter.playerMode;

  if (mode === "flee") {
    const fleeChance = clamp(
      50 + (getEffectivePlayerSpeed() - enemy.speed) * 8,
      10,
      90
    );

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
  const game = getGame();

  if (!game.encounter.active || !game.encounter.enemy) {
    return false;
  }

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
  const game = getGame();

  if (!game.encounter.active || !game.encounter.enemy) {
    return false;
  }

  let changed = false;

  game.encounter.playerActionProgress +=
    deltaSeconds * (getEffectivePlayerSpeed() / 10);

  game.encounter.enemyActionProgress +=
    deltaSeconds * (game.encounter.enemy.speed / 10);

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