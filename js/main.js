document.addEventListener("DOMContentLoaded", () => {
  const game = {
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
    resources: {
      gold: { amount: 0, max: 10, hidden: false },
      wood: { amount: 0, max: 5, hidden: true },
      scrolls: { amount: 0, max: 99, hidden: true }
    },
    timers: {
      rumorSearches: 0,
      workSearches: 0
    },
    log: [
      "You awaken battered and exhausted in a world that is not your own."
    ]
  };

  const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-content"));
  const actionButtons = Array.from(document.querySelectorAll("[data-action]"));

  const refs = {
    playerName: document.getElementById("player-name"),
    playerLevel: document.getElementById("player-level"),
    playerXp: document.getElementById("player-xp"),
    playerTitles: document.getElementById("player-titles"),
    lifeFill: document.getElementById("life-fill"),
    lifeText: document.getElementById("life-text"),
    staminaFill: document.getElementById("stamina-fill"),
    staminaText: document.getElementById("stamina-text"),
    manaCard: document.querySelector('[data-stat="mana"]'),
    manaFill: document.getElementById("mana-fill"),
    manaText: document.getElementById("mana-text"),
    eventLog: document.getElementById("event-log")
  };

  const resourceCards = {
    gold: document.querySelector('[data-resource="gold"]'),
    wood: document.querySelector('[data-resource="wood"]'),
    scrolls: document.querySelector('[data-resource="scrolls"]')
  };

  function setActiveTab(tabId) {
    tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === tabId;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    tabPanels.forEach((panel) => {
      const isActive = panel.id === `${tabId}-tab`;
      panel.classList.toggle("is-hidden", !isActive);
    });
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function addLog(message) {
    game.log.unshift(message);
    if (game.log.length > 12) game.log.length = 12;
  }

  function resourceAtCap(resourceId) {
    const r = game.resources[resourceId];
    return r.amount >= r.max;
  }

  function addResource(resourceId, amount) {
    const r = game.resources[resourceId];
    const next = clamp(r.amount + amount, 0, r.max);
    const gained = next - r.amount;
    r.amount = next;

    if (r.hidden && r.amount > 0) r.hidden = false;

    return gained;
  }

  function spendResource(resourceId, amount) {
    const r = game.resources[resourceId];
    if (r.amount < amount) return false;
    r.amount -= amount;
    return true;
  }

  function spendStamina(amount) {
    if (game.player.stamina < amount) return false;
    game.player.stamina = clamp(game.player.stamina - amount, 0, game.player.maxStamina);
    return true;
  }

  function restoreStamina(amount) {
    game.player.stamina = clamp(game.player.stamina + amount, 0, game.player.maxStamina);
  }

  function restoreLife(amount) {
    game.player.life = clamp(game.player.life + amount, 0, game.player.maxLife);
  }

  function gainGold(amount) {
    return addResource("gold", amount);
  }

  function roll(chance) {
    return Math.random() < chance;
  }

  const actions = {
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

      addResource("wood", 1);
      addLog("You gather wood.");

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

      gainGold(0.5);
      addLog("You earn 0.5 gold mucking stables.");
    },

    restInn() {
      if (!spendResource("gold", 1)) {
        addLog("Not enough gold.");
        return;
      }

      restoreStamina(5);
      restoreLife(5);
      addLog("You rest at the inn.");
    },

    sellWood() {
      if (!spendResource("wood", 1)) {
        addLog("No wood to sell.");
        return;
      }

      gainGold(2);
      addLog("You sell wood for 2 gold.");
    },

    rumors() {
      game.timers.rumorSearches++;

      if (game.timers.rumorSearches >= 10) {
        addLog("You hear of a ruined tower nearby.");
        return;
      }

      addLog(Math.random() < 1/30 ? "A whisper about something strange..." : "Nothing useful.");
    },

    lookForWork() {
      if (!spendStamina(1)) {
        addLog("Too tired.");
        return;
      }

      game.timers.workSearches++;

      if (Math.random() < 0.25) {
        gainGold(1);
        addLog("You complete a small job.");
      } else {
        addLog("No work found.");
      }
    }
  };

  function renderResources() {
    Object.entries(game.resources).forEach(([id, r]) => {
      const card = resourceCards[id];
      if (!card) return;

      card.classList.toggle("is-hidden", r.hidden);
      card.querySelector(".resource-value").textContent = `${r.amount} / ${r.max}`;
    });
  }

  function renderVitals() {
    const lifePct = (game.player.life / game.player.maxLife) * 100;
    const stamPct = (game.player.stamina / game.player.maxStamina) * 100;

    refs.lifeFill.style.width = `${lifePct}%`;
    refs.lifeText.textContent = `${game.player.life} / ${game.player.maxLife}`;

    refs.staminaFill.style.width = `${stamPct}%`;
    refs.staminaText.textContent = `${game.player.stamina} / ${game.player.maxStamina}`;
  }

  function renderLog() {
    refs.eventLog.innerHTML = "";
    game.log.forEach(msg => {
      const div = document.createElement("div");
      div.className = "log-entry";
      div.textContent = msg;
      refs.eventLog.appendChild(div);
    });
  }

  function renderActions() {
    actionButtons.forEach(btn => {
      const id = btn.dataset.action;
      let disabled = false;

      if (id === "gatherWood") disabled = game.player.stamina < 1 || resourceAtCap("wood");
      if (id === "muckStables") disabled = game.player.stamina < 1;
      if (id === "restInn") disabled = game.resources.gold.amount < 1;
      if (id === "sellWood") disabled = game.resources.wood.amount < 1;

      btn.disabled = disabled;
    });
  }

  function render() {
    renderResources();
    renderVitals();
    renderLog();
    renderActions();
  }

  actionButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const fn = actions[btn.dataset.action];
      if (!fn) return;
      fn();
      render();
    });
  });

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
  });

  setActiveTab("character");
  render();
});