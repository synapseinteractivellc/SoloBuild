window.clamp = function (value, min, max) {
  return Math.min(Math.max(value, min), max);
};

window.addLog = function (message) {
  const game = getGame();
  game.log.unshift(message);

  if (game.log.length > 16) {
    game.log.length = 16;
  }
};

window.formatNumber = function (value, decimals = 1) {
  return Number(value % 1 === 0 ? value : value.toFixed(decimals));
};

window.roll = function (chance) {
  return Math.random() < chance;
};

window.resourceAtCap = function (id) {
  const game = getGame();
  return game.resources[id].amount >= game.resources[id].max;
};

window.addResource = function (id, amount) {
  const game = getGame();
  const resource = game.resources[id];
  const next = clamp(resource.amount + amount, 0, resource.max);
  const gained = next - resource.amount;

  resource.amount = next;

  if (resource.hidden && resource.amount > 0) {
    resource.hidden = false;
  }

  return gained;
};

window.spendResource = function (id, amount) {
  const game = getGame();
  const resource = game.resources[id];

  if (resource.amount < amount) {
    return false;
  }

  resource.amount -= amount;
  return true;
};

window.spendStamina = function (amount) {
  const game = getGame();

  if (game.player.stamina < amount) {
    return false;
  }

  game.player.stamina = clamp(
    game.player.stamina - amount,
    0,
    game.player.maxStamina
  );

  return true;
};

window.restoreStamina = function (amount) {
  const game = getGame();

  game.player.stamina = clamp(
    game.player.stamina + amount,
    0,
    game.player.maxStamina
  );
};

window.restoreLife = function (amount) {
  const game = getGame();

  game.player.life = clamp(
    game.player.life + amount,
    0,
    game.player.maxLife
  );
};

window.damageLife = function (amount) {
  const game = getGame();

  game.player.life = clamp(
    game.player.life - amount,
    0,
    game.player.maxLife
  );
};

window.restoreMana = function (amount) {
  const game = getGame();

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
  const game = getGame();

  game.player.maxMana = Math.max(0, amount);

  if (!keepCurrent) {
    game.player.mana = clamp(game.player.mana, 0, game.player.maxMana);
  }

  game.vitals.mana.hidden = game.player.maxMana <= 0;
};

window.gainGold = function (amount) {
  return addResource("gold", amount);
};

window.gainXp = function (amount) {
  const game = getGame();
  game.player.xp += amount;
};

window.getWildsResourceGainAmount = function (resourceId) {
  const game = getGame();

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

window.resolveExploreOutcome = function () {
  const game = getGame();
  if (!game.unlocks.tower) {
    const baseChance = 0.02;
    const maxChance = 0.30;
    const rampPerExplore = 0.01;

    const rampedChance = Math.min(
      maxChance,
      baseChance + game.timers.towerExploreSearches * rampPerExplore
    );

    const rumorBonus = game.timers.towerRumorBonusApplied ? 0.10 : 0;
    const finalTowerChance = Math.min(maxChance + 0.10, rampedChance + rumorBonus);

    const towerRoll = Math.random();

    if (towerRoll < finalTowerChance) {
      game.unlocks.tower = true;
      game.tower.discovered = true;
      game.activeTab = "tower";
      addLog(
        "While exploring the wilds, you come across the ruins of an abandoned tower. Though crumbling and choked with rubble, it may yet be reclaimed."
      );
      return;
    }

    game.timers.towerExploreSearches++;
  }

  const rollValue = Math.random();

  if (rollValue < 0.6) {
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

// =======================
// TASK DEFINITIONS
// =======================

window.TASKS = {
  makeCamp: {
    label: "Make Camp",
    duration: 10,
    startCost: { wood: 1 },

    perSecond(game) {
      restoreLife(1);
      restoreStamina(1);
    },

    onCycleEnd(game) {
      const fullLife = game.player.life >= game.player.maxLife;
      const fullStamina = game.player.stamina >= game.player.maxStamina;

      if (fullLife && fullStamina) return "complete";
      if (game.resources.wood.amount >= 1) return "repeat";
      return "stop";
    }
  },

  clearRubble: {
    label: "Clear Rubble",
    duration: 60,

    perSecondCost: { stamina: 1 },

    interval: {
      every: 6,
      action(game) {
        const gained = addResource("stone", 1);
        addLog(
          gained > 0
            ? "You recover 1 stone from the rubble."
            : "You find stone but cannot carry more."
        );
      }
    }
  }
};

// =======================
// TASK ENGINE
// =======================

let taskInterval = null;

window.startTaskEngine = function () {
  if (taskInterval) return;

  taskInterval = setInterval(() => {
    tickActiveTask();
  }, 1000);
};

window.startTask = function (taskId) {
  const game = getGame();
  const def = TASKS[taskId];

  if (!def) return;
  if (game.tasks.active) {
    addLog("You are already busy.");
    return;
  }

  // pay start cost
  if (def.startCost) {
    for (const [res, amt] of Object.entries(def.startCost)) {
      if (game.resources[res].amount < amt) {
        addLog(`Need ${amt} ${res}.`);
        return;
      }
    }

    for (const [res, amt] of Object.entries(def.startCost)) {
      spendResource(res, amt);
    }
  }

  game.tasks.active = {
    id: taskId,
    remaining: def.duration,
    elapsed: 0
  };

  addLog(`You begin: ${def.label}`);
};

window.stopTask = function (reason = "") {
  const game = getGame();

  if (!game.tasks.active) return;

  if (reason) addLog(reason);

  game.tasks.active = null;
};

window.tickActiveTask = function () {
  const game = getGame();
  const task = game.tasks.active;

  if (!task) return;

  const def = TASKS[task.id];

  // per second cost
  if (def.perSecondCost) {
    for (const [res, amt] of Object.entries(def.perSecondCost)) {
      if (res === "stamina") {
        if (!spendStamina(amt)) {
          stopTask("Too exhausted to continue.");
          render();
          return;
        }
      }
    }
  }

  // per second effect
  if (def.perSecond) {
    def.perSecond(game);
  }

  task.elapsed++;
  task.remaining--;

  // interval effect
  if (def.interval && task.elapsed % def.interval.every === 0) {
    def.interval.action(game);
  }

  // cycle end
  if (task.remaining <= 0) {
    if (def.onCycleEnd) {
      const result = def.onCycleEnd(game);

      if (result === "complete") {
        stopTask("You finish your task.");
        render();
        return;
      }

      if (result === "repeat") {
        if (def.startCost) {
          for (const [res, amt] of Object.entries(def.startCost)) {
            if (game.resources[res].amount < amt) {
              stopTask("You lack resources to continue.");
              render();
              return;
            }
          }

          for (const [res, amt] of Object.entries(def.startCost)) {
            spendResource(res, amt);
          }
        }

        task.remaining = def.duration;
        task.elapsed = 0;
        addLog("You continue your work.");
        render();
        return;
      }
    }

    stopTask("Task complete.");
    render();
    return;
  }

  render();
};