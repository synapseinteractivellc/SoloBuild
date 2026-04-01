const villageDiscoveries = [
  {
    key: "inn",
    message:
      "After wandering the village and asking around, you finally find the local inn. It looks worn, but far better than the streets."
  },
  {
    key: "market",
    message:
      "You follow the noise of haggling voices and discover the village market."
  },
  {
    key: "blacksmith",
    message:
      "The steady ring of hammer on metal leads you to the village blacksmith."
  },
  {
    key: "mason",
    message:
      "Stacks of cut stone and dust-covered tools mark the mason's yard."
  },
  {
    key: "herbalist",
    message:
      "A sharp, earthy scent leads you to a cramped herbalist's shop."
  }
];

window.actions = {
  initialWander: {
    label: "Wander",
    group: "wilds-exploration",
    isVisible: () => !getGame().unlocks.village,
    isDisabled: () => {
      const game = getGame();
      return game.player.stamina < 1 || game.encounter.active;
    },
    run() {
      const game = getGame();

      if (!spendStamina(1)) {
        addLog("Too exhausted to wander. You need rest.");
        return;
      }

      const rollValue = Math.random();

      if (rollValue < 0.25) {
        game.unlocks.village = true;
        game.activeTab = "village";
        addLog(
          "After hours of wandering, you spot signs of civilization and discover a village."
        );
        return;
      }

      if (rollValue < 0.95) {
        addLog("You wander for a while but find nothing of interest.");
        return;
      }

      addLog(
        "Something moves in the brush. You tense for a fight, but the creature disappears into the wilds."
      );
    }
  },

  exploreWilds: {
    label: "Explore",
    group: "wilds-exploration",
    isVisible: () => getGame().unlocks.village,
    isDisabled: () => getGame().encounter.active,
    run() {
      resolveExploreOutcome();
    }
  },

  gatherWood: {
    label: () => (getGame().upgrades.stoneAxe ? "Chop Wood" : "Gather Wood"),
    group: "wilds-survival",
    isVisible: () => true,
    isDisabled: () => {
      const game = getGame();
      return (
        game.encounter.active ||
        game.player.stamina < 1 ||
        resourceAtCap("wood")
      );
    },
    run() {
      const game = getGame();

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
    }
  },

  gatherStone: {
    label: "Gather Stone",
    group: "wilds-survival",
    isVisible: () => getGame().unlocks.mason,
    isDisabled: () => {
      const game = getGame();
      return (
        game.encounter.active ||
        game.player.stamina < 1 ||
        resourceAtCap("stone")
      );
    },
    run() {
      const game = getGame();

      if (!spendStamina(1)) {
        addLog("Too exhausted to gather stone.");
        return;
      }

      if (resourceAtCap("stone")) {
        restoreStamina(1);
        addLog("You cannot carry any more stone.");
        return;
      }

      const stoneAmount = game.upgrades.pickaxe ? 2 : 1;
      const gained = addResource("stone", stoneAmount);

      addLog(
        game.upgrades.pickaxe
          ? `You work the stone pile outside the village and gather ${gained} stone.`
          : `You gather ${gained} stone from loose rubble in the wilderness.`
      );
    }
  },

  forageHerbs: {
    label: "Forage Herbs",
    group: "wilds-survival",
    isVisible: () => getGame().unlocks.herbalist,
    isDisabled: () => {
      const game = getGame();
      return (
        game.encounter.active ||
        game.player.stamina < 1 ||
        resourceAtCap("herbs")
      );
    },
    run() {
      const game = getGame();

      if (!spendStamina(1)) {
        addLog("Too exhausted to forage for herbs.");
        return;
      }

      if (resourceAtCap("herbs")) {
        restoreStamina(1);
        addLog("You cannot carry any more herbs.");
        return;
      }

      const herbAmount = game.upgrades.herbShears ? 2 : 1;
      const gained = addResource("herbs", herbAmount);

      addLog(
        game.upgrades.herbShears
          ? `You gather a useful bundle and gain ${gained} herbs.`
          : `You search the wilds around the village and gather ${gained} herbs.`
      );

      if (roll(0.05)) {
        restoreLife(1);
        addLog("One of the herbs proves useful and restores 1 life.");
      }
    }
  },

  restWilds: {
    label: "Rest",
    group: "wilds-survival",
    isVisible: () => true,
    isDisabled: () => getGame().encounter.active,
    run() {
      restoreStamina(0.5);
      restoreLife(0.5);
      addLog("You rest briefly in the wilds.");
    }
  },

  wanderVillage: {
    label: () => {
      const game = getGame();
      const allFound =
        game.unlocks.inn &&
        game.unlocks.market &&
        game.unlocks.blacksmith &&
        game.unlocks.mason &&
        game.unlocks.herbalist;

      return allFound ? "Village Fully Explored" : "Wander the Village";
    },
    group: "village-wander",
    isVisible: () => getGame().unlocks.village,
    isDisabled: () => {
      const game = getGame();
      const allFound =
        game.unlocks.inn &&
        game.unlocks.market &&
        game.unlocks.blacksmith &&
        game.unlocks.mason &&
        game.unlocks.herbalist;

      return game.player.stamina < 1 || allFound;
    },
    run() {
      const game = getGame();

      if (!spendStamina(1)) {
        addLog("Too tired to keep wandering the village.");
        return;
      }

      const currentGold = game.resources.gold.amount;
      const muggedRoll = Math.random();

      if (muggedRoll < 0.01) {
        if (currentGold <= 0) {
          addLog(
            "A few rough-looking locals size you up, but lose interest when they see you have no coin."
          );
          return;
        }

        const loseAll = Math.random() < 0.5;
        const amountLost = loseAll ? currentGold : Math.ceil(currentGold / 2);

        spendResource("gold", amountLost);

        addLog(
          loseAll
            ? `You are cornered in a side alley and mugged. You lose all ${amountLost} gold.`
            : `You are jostled in a crowded lane and realize too late that ${amountLost} gold is gone.`
        );
        return;
      }

      if (!game.unlocks.inn) {
        if (Math.random() < 0.75) {
          game.unlocks.inn = true;
          addLog(villageDiscoveries.find(place => place.key === "inn").message);
          return;
        }

        addLog(
          "You wander the streets asking for directions, but the village still feels unfamiliar and closed to you."
        );
        return;
      }

      const remainingLocations = villageDiscoveries.filter(
        place => place.key !== "inn" && !game.unlocks[place.key]
      );

      if (remainingLocations.length === 0) {
        addLog("You know the village well enough now to find your way around.");
        return;
      }

      if (Math.random() < 0.7) {
        const discovered =
          remainingLocations[
            Math.floor(Math.random() * remainingLocations.length)
          ];

        game.unlocks[discovered.key] = true;
        addLog(discovered.message);
        return;
      }

      addLog("You spend time wandering the village, but uncover nothing new.");
    }
  },

  sleepInAlley: {
    label: "Sleep in Alley",
    group: "village-wander",
    isVisible: () => {
      const game = getGame();
      return (
        game.unlocks.village &&
        (game.resources.gold.amount < 1 || !game.unlocks.inn)
      );
    },
    isDisabled: () => false,
    run() {
      const game = getGame();

      restoreStamina(2);

      const badOutcomeRoll = Math.random();

      if (badOutcomeRoll < 0.15) {
        restoreLife(-1);
        addLog(
          "You try to sleep in a narrow alley. The cold stone and a rough wake-up leave you battered. You recover a little stamina, but lose 1 life."
        );
        return;
      }

      if (badOutcomeRoll < 0.3) {
        const currentGold = game.resources.gold.amount;

        if (currentGold > 0) {
          const amountLost = Math.max(1, Math.floor(currentGold / 2));
          spendResource("gold", amountLost);
          addLog(
            `You doze in an alley and wake to find ${amountLost} gold missing. At least you got a little rest.`
          );
          return;
        }
      }

      addLog(
        "You sleep in an alley as best you can. It is miserable, but you recover a little stamina."
      );
    }
  },

  muckStables: {
    label: "Muck Stables",
    group: "village-work",
    isVisible: () => {
      const game = getGame();
      return game.unlocks.village && game.unlocks.inn;
    },
    isDisabled: () => getGame().player.stamina < 1,
    run() {
      if (!spendStamina(1)) {
        addLog("Too exhausted.");
        return;
      }

      const gold = gainGold(0.5);
      addLog(`You earn ${gold} gold mucking stables.`);
    }
  },

  lookForWork: {
    label: "Look for Work",
    group: "village-work",
    isVisible: () => {
      const game = getGame();
      return game.unlocks.village && game.unlocks.market;
    },
    isDisabled: () => getGame().player.stamina < 1,
    run() {
      const game = getGame();

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
    }
  },

  rumors: {
    label: "Rumors",
    group: "village-work",
    isVisible: () => {
      const game = getGame();
      return game.unlocks.village && game.unlocks.inn;
    },
    isDisabled: () => false,
    run() {
      const game = getGame();

      game.timers.rumorSearches++;

      if (game.timers.rumorSearches >= 10) {
        addLog("You hear of a ruined tower nearby.");
        return;
      }

      addLog(
        roll(1 / 30)
          ? "A whisper about something strange..."
          : "Nothing useful."
      );
    }
  },

  restInn: {
    label: "Rest in Inn",
    group: "village-market",
    isVisible: () => {
      const game = getGame();
      return game.unlocks.village && game.unlocks.inn;
    },
    isDisabled: () => getGame().resources.gold.amount < 1,
    run() {
      if (!spendResource("gold", 1)) {
        addLog("Not enough gold.");
        return;
      }

      restoreStamina(5);
      restoreLife(5);
      addLog("You rest at the inn and recover.");
    }
  },

  sellWood: {
    label: "Sell Wood",
    group: "village-market",
    isVisible: () => {
      const game = getGame();
      return game.unlocks.village && game.unlocks.market;
    },
    isDisabled: () => getGame().resources.wood.amount < 1,
    run() {
      if (!spendResource("wood", 1)) {
        addLog("No wood to sell.");
        return;
      }

      const gold = gainGold(2);
      addLog(`You sell wood for ${gold} gold.`);
    }
  },

  buyCoinPurse: {
    label: "Coin Purse (-10 Gold)",
    group: "village-upgrades",
    isVisible: () => {
      const game = getGame();
      return (
        game.unlocks.village &&
        game.unlocks.market &&
        game.upgrades.coinPursePurchases < game.upgrades.coinPurseMax
      );
    },
    isDisabled: () => {
      const game = getGame();
      return (
        game.upgrades.coinPursePurchases >= game.upgrades.coinPurseMax ||
        game.resources.gold.amount < 10
      );
    },
    run() {
      const game = getGame();

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
    }
  },

  buyWoodBundle: {
    label: "Wood Bundle (-10 Gold)",
    group: "village-upgrades",
    isVisible: () => {
      const game = getGame();
      return (
        game.unlocks.village &&
        game.unlocks.market &&
        game.upgrades.woodBundlePurchases < game.upgrades.woodBundleMax
      );
    },
    isDisabled: () => {
      const game = getGame();
      return (
        game.upgrades.woodBundlePurchases >= game.upgrades.woodBundleMax ||
        game.resources.gold.amount < 10
      );
    },
    run() {
      const game = getGame();

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
    }
  },

  buyStoneAxe: {
    label: "Stone Axe (-10 Gold)",
    group: "village-upgrades",
    isVisible: () => {
      const game = getGame();
      return game.unlocks.village && game.unlocks.blacksmith && !game.upgrades.stoneAxe;
    },
    isDisabled: () => {
      const game = getGame();
      return game.upgrades.stoneAxe || game.resources.gold.amount < 10;
    },
    run() {
      const game = getGame();

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
  },

  sellStone: {
    label: "Sell Stone",
    group: "village-market",
    isVisible: () => {
      const game = getGame();
      return game.unlocks.village && game.unlocks.mason;
    },
    isDisabled: () => getGame().resources.stone.amount < 1,
    run() {
      if (!spendResource("stone", 1)) {
        addLog("No stone to sell.");
        return;
      }

      const gold = gainGold(2);
      addLog(`You sell stone for ${gold} gold.`);
    }
  },

  sellHerbs: {
    label: "Sell Herbs",
    group: "village-market",
    isVisible: () => {
      const game = getGame();
      return game.unlocks.village && game.unlocks.herbalist;
    },
    isDisabled: () => getGame().resources.herbs.amount < 1,
    run() {
      if (!spendResource("herbs", 1)) {
        addLog("No herbs to sell.");
        return;
      }

      const gold = gainGold(3);
      addLog(`You sell herbs for ${gold} gold.`);
    }
  },

  buyPickaxe: {
    label: "Pickaxe (-10 Gold)",
    group: "village-upgrades",
    isVisible: () => {
      const game = getGame();
      return game.unlocks.village && game.unlocks.mason && !game.upgrades.pickaxe;
    },
    isDisabled: () => {
      const game = getGame();
      return game.upgrades.pickaxe || game.resources.gold.amount < 10;
    },
    run() {
      const game = getGame();

      if (game.upgrades.pickaxe) {
        addLog("You already have a pickaxe.");
        return;
      }

      if (!spendResource("gold", 10)) {
        addLog("Need 10 gold.");
        return;
      }

      game.upgrades.pickaxe = true;
      addLog("You buy a pickaxe. Stone gathering is now more efficient.");
    }
  },

  buyHerbShears: {
    label: "Herb Shears (-10 Gold)",
    group: "village-upgrades",
    isVisible: () => {
      const game = getGame();
      return game.unlocks.village && game.unlocks.herbalist && !game.upgrades.herbShears;
    },
    isDisabled: () => {
      const game = getGame();
      return game.upgrades.herbShears || game.resources.gold.amount < 10;
    },
    run() {
      const game = getGame();

      if (game.upgrades.herbShears) {
        addLog("You already have herb shears.");
        return;
      }

      if (!spendResource("gold", 10)) {
        addLog("Need 10 gold.");
        return;
      }

      game.upgrades.herbShears = true;
      addLog("You buy herb shears. Herb gathering is now more efficient.");
    }
  },

  buyStoneCart: {
    label: "Stone Cart (-10 Gold)",
    group: "village-upgrades",
    isVisible: () => {
      const game = getGame();
      return (
        game.unlocks.village &&
        game.unlocks.mason &&
        game.upgrades.stoneCartPurchases < game.upgrades.stoneCartMax
      );
    },
    isDisabled: () => {
      const game = getGame();
      return (
        game.upgrades.stoneCartPurchases >= game.upgrades.stoneCartMax ||
        game.resources.gold.amount < 10
      );
    },
    run() {
      const game = getGame();

      if (game.upgrades.stoneCartPurchases >= game.upgrades.stoneCartMax) {
        addLog("Stone Cart already maxed.");
        return;
      }

      if (!spendResource("gold", 10)) {
        addLog("Need 10 gold.");
        return;
      }

      game.upgrades.stoneCartPurchases++;
      game.resources.stone.max += 5;

      addLog(`Stone capacity increased to ${game.resources.stone.max}.`);
    }
  },

  buyHerbPouch: {
    label: "Herb Pouch (-10 Gold)",
    group: "village-upgrades",
    isVisible: () => {
      const game = getGame();
      return (
        game.unlocks.village &&
        game.unlocks.herbalist &&
        game.upgrades.herbPouchPurchases < game.upgrades.herbPouchMax
      );
    },
    isDisabled: () => {
      const game = getGame();
      return (
        game.upgrades.herbPouchPurchases >= game.upgrades.herbPouchMax ||
        game.resources.gold.amount < 10
      );
    },
    run() {
      const game = getGame();

      if (game.upgrades.herbPouchPurchases >= game.upgrades.herbPouchMax) {
        addLog("Herb Pouch already maxed.");
        return;
      }

      if (!spendResource("gold", 10)) {
        addLog("Need 10 gold.");
        return;
      }

      game.upgrades.herbPouchPurchases++;
      game.resources.herbs.max += 5;

      addLog(`Herb capacity increased to ${game.resources.herbs.max}.`);
    }
  }
};