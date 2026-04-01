const renderState = {
  uiRefs: {},
  resourceCards: {},
  vitalCards: {}
};

window.getUiRefs = function () {
  return renderState.uiRefs;
};

window.getResourceCards = function () {
  return renderState.resourceCards;
};

window.getVitalCards = function () {
  return renderState.vitalCards;
};

window.initializeRenderRefs = function () {
  renderState.uiRefs.playerName = document.getElementById("player-name");
  renderState.uiRefs.playerLevel = document.getElementById("player-level");
  renderState.uiRefs.playerXp = document.getElementById("player-xp");
  renderState.uiRefs.playerTitles = document.getElementById("player-titles");
  renderState.uiRefs.eventLog = document.getElementById("event-log");

  renderState.uiRefs.tabButtons = {
    wilds: document.querySelector('[data-tab="wilds"]'),
    village: document.querySelector('[data-tab="village"]'),
    character: document.querySelector('[data-tab="character"]')
  };
};

window.getResourceLabel = function (id) {
  const labels = {
    gold: "Gold",
    wood: "Wood",
    stone: "Stone",
    herbs: "Herbs",
    horn: "Horn",
    leather: "Leather",
    scrolls: "Scrolls"
  };

  return labels[id] || id.charAt(0).toUpperCase() + id.slice(1);
};

window.createResourceCard = function (id) {
  const card = document.createElement("div");
  card.className = "resource-card resource-inline";
  card.dataset.resource = id;

  const name = document.createElement("span");
  name.className = "resource-name";
  name.textContent = `${getResourceLabel(id)}:`;

  const value = document.createElement("span");
  value.className = "resource-value";
  value.textContent = "0 / 0";

  card.appendChild(name);
  card.appendChild(value);

  return card;
};

window.initializeResourceCards = function () {
  const game = getGame();
  const resourceList = document.getElementById("resource-list");

  if (!resourceList) return;

  resourceList.innerHTML = "";
  renderState.resourceCards = {};

  Object.entries(game.resources).forEach(([id, resource]) => {
    const card = createResourceCard(id);

    if (resource.hidden) {
      card.classList.add("is-hidden");
    }

    resourceList.appendChild(card);
    renderState.resourceCards[id] = card;
  });
};

window.createVitalCard = function (id, vital) {
  const card = document.createElement("div");
  card.className = "stat-card stat-inline";
  card.dataset.vital = id;

  const label = document.createElement("span");
  label.className = "stat-label";
  label.textContent = `${vital.label}:`;

  const bar = document.createElement("div");
  bar.className = "bar";

  const fill = document.createElement("div");
  fill.className = `bar-fill ${vital.fillClass}`;

  const text = document.createElement("span");
  text.className = "bar-text";
  text.textContent = "0 / 0";

  bar.appendChild(fill);
  bar.appendChild(text);

  card.appendChild(label);
  card.appendChild(bar);

  return {
    card,
    fill,
    text
  };
};

window.initializeVitalCards = function () {
  const game = getGame();
  const vitalList = document.getElementById("vital-list");

  if (!vitalList) return;

  vitalList.innerHTML = "";
  renderState.vitalCards = {};

  Object.entries(game.vitals).forEach(([id, vital]) => {
    const refs = createVitalCard(id, vital);

    if (vital.hidden) {
      refs.card.classList.add("is-hidden");
    }

    vitalList.appendChild(refs.card);
    renderState.vitalCards[id] = refs;
  });
};

window.initializeActionGroups = function () {
  const groupEls = document.querySelectorAll("[data-action-group]");

  groupEls.forEach(groupEl => {
    const groupId = groupEl.dataset.actionGroup;
    groupEl.innerHTML = "";

    Object.entries(actions).forEach(([actionId, action]) => {
      if (action.group !== groupId) return;

      const button = document.createElement("button");
      button.className = "action-button";
      button.type = "button";
      button.dataset.action = actionId;

      groupEl.appendChild(button);
    });
  });
};

window.updateTabVisibility = function () {
  const game = getGame();
  const uiRefs = getUiRefs();

  if (uiRefs.tabButtons?.village) {
    uiRefs.tabButtons.village.classList.toggle("is-hidden", !game.unlocks.village);
  }

  if (uiRefs.tabButtons?.character) {
    uiRefs.tabButtons.character.classList.toggle("is-hidden", !game.unlocks.character);
  }

  const activeButton = uiRefs.tabButtons?.[game.activeTab];
  if (!activeButton || activeButton.classList.contains("is-hidden")) {
    game.activeTab = "wilds";
  }
};

window.setActiveTab = function (tabId) {
  const game = getGame();
  const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-content"));

  game.activeTab = tabId;

  tabButtons.forEach(button => {
    const isActive = button.dataset.tab === tabId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.setAttribute("tabindex", isActive ? "0" : "-1");
  });

  tabPanels.forEach(panel => {
    const isActive = panel.id === `${tabId}-tab`;
    panel.classList.toggle("is-hidden", !isActive);
  });
};

window.renderResources = function () {
  const game = getGame();
  const resourceCards = getResourceCards();

  Object.entries(game.resources).forEach(([id, resource]) => {
    const card = resourceCards[id];
    if (!card) return;

    card.classList.toggle("is-hidden", resource.hidden);
    card.querySelector(".resource-value").textContent =
      `${formatNumber(resource.amount)} / ${resource.max}`;
  });
};

window.renderVitals = function () {
  const game = getGame();
  const vitalCards = getVitalCards();

  Object.entries(game.vitals).forEach(([id, vital]) => {
    const refs = vitalCards[id];
    if (!refs) return;

    const current = game.player[vital.currentKey];
    const max = game.player[vital.maxKey];
    const pct = max > 0 ? (current / max) * 100 : 0;

    refs.card.classList.toggle("is-hidden", vital.hidden);
    refs.fill.style.width = `${pct}%`;
    refs.text.textContent = `${formatNumber(current)} / ${formatNumber(max)}`;
  });
};

window.renderLog = function () {
  const game = getGame();
  const uiRefs = getUiRefs();

  if (!uiRefs.eventLog) return;

  uiRefs.eventLog.innerHTML = "";

  game.log.forEach(message => {
    const div = document.createElement("div");
    div.className = "log-entry";
    div.textContent = message;
    uiRefs.eventLog.appendChild(div);
  });
};

window.renderActionGroups = function () {
  const buttons = document.querySelectorAll("[data-action]");

  buttons.forEach(button => {
    const actionId = button.dataset.action;
    const action = actions[actionId];

    if (!action) return;

    const visible = action.isVisible ? action.isVisible() : true;
    button.classList.toggle("is-hidden", !visible);

    if (!visible) return;

    button.textContent =
      typeof action.label === "function" ? action.label() : action.label;

    button.disabled = action.isDisabled ? action.isDisabled() : false;
  });
};

window.renderEncounterPanel = function () {
  const game = getGame();
  const uiRefs = getUiRefs();
  const panel = document.getElementById("wilds-encounter-panel");

  if (!panel) return;

  const wildsButton = uiRefs.tabButtons?.wilds;
  const encounterActive = !!(
    game.encounter &&
    game.encounter.active &&
    game.encounter.enemy
  );
  const encounterInWilds =
    encounterActive && game.encounter.location === "wilds";
  const offWildsTab = game.activeTab !== "wilds";

  panel.classList.toggle("is-hidden", !encounterInWilds);

  if (wildsButton) {
    wildsButton.classList.toggle(
      "has-encounter-alert",
      encounterInWilds && offWildsTab
    );
  }

  if (!encounterInWilds) return;

  const enemy = game.encounter.enemy;
  const playerLifePct =
    game.player.maxLife > 0 ? (game.player.life / game.player.maxLife) * 100 : 0;
  const playerStaminaPct =
    game.player.maxStamina > 0
      ? (game.player.stamina / game.player.maxStamina) * 100
      : 0;
  const enemyLifePct =
    enemy.maxLife > 0 ? (enemy.life / enemy.maxLife) * 100 : 0;

  const playerTimerPct = clamp(game.encounter.playerActionProgress * 100, 0, 100);
  const enemyTimerPct = clamp(game.encounter.enemyActionProgress * 100, 0, 100);

  document.getElementById("encounter-subtitle").textContent =
    `${enemy.name} engaged in the wilds.`;
  document.getElementById("encounter-player-name").textContent =
    game.player.name || "Wanderer";
  document.getElementById("encounter-player-life-text").textContent =
    `${formatNumber(game.player.life)} / ${formatNumber(game.player.maxLife)}`;
  document.getElementById("encounter-player-stamina-text").textContent =
    `${formatNumber(game.player.stamina)} / ${formatNumber(game.player.maxStamina)}`;
  document.getElementById("encounter-player-timer-text").textContent =
    `${Math.round(playerTimerPct)}%`;
  document.getElementById("encounter-player-life-fill").style.width =
    `${playerLifePct}%`;
  document.getElementById("encounter-player-stamina-fill").style.width =
    `${playerStaminaPct}%`;
  document.getElementById("encounter-player-timer-fill").style.width =
    `${playerTimerPct}%`;
  document.getElementById("encounter-player-mode").textContent =
    getPlayerCombatModeLabel();

  document.getElementById("encounter-enemy-name").textContent = enemy.name;
  document.getElementById("encounter-enemy-life-text").textContent =
    `${formatNumber(enemy.life)} / ${formatNumber(enemy.maxLife)}`;
  document.getElementById("encounter-enemy-timer-text").textContent =
    `${Math.round(enemyTimerPct)}%`;
  document.getElementById("encounter-enemy-life-fill").style.width =
    `${enemyLifePct}%`;
  document.getElementById("encounter-enemy-timer-fill").style.width =
    `${enemyTimerPct}%`;

  const modeButtons = document.querySelectorAll("[data-combat-mode]");
  modeButtons.forEach(button => {
    const mode = button.dataset.combatMode;
    const isActive = game.encounter.playerMode === mode;

    button.classList.toggle("is-active", isActive);
    button.disabled = mode === "kick" && game.player.stamina < 1;
  });
};

window.renderCharacterPanel = function () {
  const game = getGame();
  const uiRefs = getUiRefs();

  if (uiRefs.playerLevel) {
    uiRefs.playerLevel.textContent = String(game.player.level);
  }

  if (uiRefs.playerXp) {
    uiRefs.playerXp.textContent =
      `${formatNumber(game.player.xp)} / ${formatNumber(game.player.xpToNext)}`;
  }

  if (uiRefs.playerTitles) {
    uiRefs.playerTitles.textContent =
      game.player.titles.length > 0 ? game.player.titles.join(", ") : "N/A";
  }

  if (uiRefs.playerName && uiRefs.playerName !== document.activeElement) {
    uiRefs.playerName.value = game.player.name || "Wanderer";
  }
};

window.render = function () {
  const game = getGame();

  updateTabVisibility();

  if (game.activeTab) {
    setActiveTab(game.activeTab);
  }

  renderResources();
  renderVitals();
  renderLog();
  renderActionGroups();
  renderEncounterPanel();
  renderCharacterPanel();
};