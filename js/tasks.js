/*****************************************************
 *
 *                    TASK DEFINITIONS
 *
 *****************************************************/

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
  },

  /*****************************************************
   *
   *          🔥 NEW: MARTIAL TRAINING
   *
   *****************************************************/

  martialTraining: {
    label: "Martial Training",
    duration: 10,

    onCycleEnd(game) {
      const skill = game.skills.martial;

      skill.xp += 5;

      if (skill.xp >= skill.xpToNext) {
        skill.xp -= skill.xpToNext;
        skill.level += 1;
        skill.xpToNext = Math.floor(skill.xpToNext * 1.2);

        addLog("Your martial skill improves.");
      } else {
        addLog("You complete your training.");
      }

      return "complete";
    }
  }
};


/*****************************************************
 *
 *                    TASK ENGINE
 *
 *****************************************************/

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

  if (def.perSecond) {
    def.perSecond(game);
  }

  task.elapsed++;
  task.remaining--;

  if (def.interval && task.elapsed % def.interval.every === 0) {
    def.interval.action(game);
  }

  if (task.remaining <= 0) {
    if (def.onCycleEnd) {
      const result = def.onCycleEnd(game);

      if (result === "complete") {
        stopTask("You finish your task.");
        render();
        return;
      }

      if (result === "repeat") {
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