window.actions = {
  gatherWood() {
    if (!spendStamina(1)) {
      addLog("Too exhausted to gather wood.");
      return;
    }

    if (resourceAtCap("wood")) {
      restoreStamina(1);
      addLog("You can't carry more wood.");
      return;
    }

    const woodAmount = game.upgrades.stoneAxe ? 2 : 1;
    const gained = addResource("wood", woodAmount);

    addLog(
      game.upgrades.stoneAxe
        ? `You chop wood and gain ${gained}.`
        : `You gather wood and gain ${gained}.`
    );

    if (roll(0.01)) {
      addResource("scrolls", 1);
      addLog("You found a strange scroll.");
    }
  },

  restWilds() {
    restoreStamina(0.5);
    restoreLife(0.5);
    addLog("You rest briefly in the wilds.");
  },

  muckStables() {
    if (!spendStamina(1)) {
      addLog("Too exhausted.");
      return;
    }

    const gold = gainGold(0.5);
    addLog(`You earn ${gold} gold mucking stables.`);
  },

  restInn() {
    if (!spendResource("gold", 1)) {
      addLog("Not enough gold.");
      return;
    }

    restoreStamina(5);
    restoreLife(5);
    addLog("You rest at the inn and recover.");
  },

  sellWood() {
    if (!spendResource("wood", 1)) {
      addLog("No wood to sell.");
      return;
    }

    const gold = gainGold(2);
    addLog(`You sell wood for ${gold} gold.`);
  },
  
  hireLaborer() {
    if (!spendResource("gold", 25)) {
      addLog("You need 25 gold to hire a laborer.");
      return;
    }

    game.workers.laborers += 1;

    addLog(`You hire a laborer. Total laborers: ${game.workers.laborers}`);
  },

  rumors() {
    game.timers.rumorSearches++;

    if (game.timers.rumorSearches >= 10) {
      addLog("You hear of a ruined tower nearby.");
      return;
    }

    addLog(roll(1 / 30)
      ? "A whisper about something strange..."
      : "Nothing useful.");
  },

  lookForWork() {
    if (!spendStamina(1)) {
      addLog("Too tired.");
      return;
    }

    game.timers.workSearches++;

    if (roll(0.25)) {
      const gold = gainGold(1);
      addLog(`You complete a small job and earn ${gold} gold.`);
    } else {
      addLog("No work found.");
    }
  },

  buyCoinPurse() {
    if (game.upgrades.coinPursePurchases >= game.upgrades.coinPurseMax) {
      addLog("Coin Purse already maxed.");
      return;
    }

    if (!spendResource("gold", 10)) {
      addLog("Need 10 gold.");
      return;
    }

    game.upgrades.coinPursePurchases++;
    game.resources.gold.max += 10;

    addLog("Gold capacity increased.");
  },
  buyCoinPurse() {
    if (game.upgrades.coinPursePurchases >= game.upgrades.coinPurseMax) {
      addLog("Coin Purse already maxed.");
      return;
    }

    if (!spendResource("gold", 10)) {
      addLog("Need 10 gold.");
      return;
    }

    game.upgrades.coinPursePurchases++;
    game.resources.gold.max += 10;

    addLog("Gold capacity increased.");
  },
  buyWoodBundle() {
    if (game.upgrades.woodBundlePurchases >= game.upgrades.woodBundleMax) {
      addLog("Wood Bundle already maxed.");
      return;
    }

    if (!spendResource("gold", 10)) {
      addLog("Need 10 gold.");
      return;
    }

    game.upgrades.woodBundlePurchases++;
    game.resources.wood.max += 5;

    addLog(`Wood capacity increased to ${game.resources.wood.max}.`);
  },
  buyStoneAxe() {
    if (game.upgrades.stoneAxe) {
      addLog("Already have a Stone Axe.");
      return;
    }

    if (!spendResource("gold", 10)) {
      addLog("Need 10 gold.");
      return;
    }

    game.upgrades.stoneAxe = true;
    addLog("You now chop wood more efficiently.");
  }
};