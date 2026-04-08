/*****************************************************
 *
 *                    RENDER STATE
 *
 *****************************************************/

const renderState = {
  uiRefs: {},
  resourceCards: {},
  vitalCards: {}
};

/*****************************************************
 *
 *                    PRIVATE HELPERS
 *
 *****************************************************/

function setText(el, value) {
  if (el) {
    el.textContent = value;
  }
}

function setWidth(el, value) {
  if (el) {
    el.style.width = value;
  }
}

function setHidden(el, hidden) {
  if (el) {
    el.classList.toggle("is-hidden", hidden);
  }
}

function setPressedState(el, isActive) {
  if (!el) return;

  el.classList.toggle("is-active", isActive);
  el.setAttribute("aria-selected", String(isActive));
  el.setAttribute("tabindex", isActive ? "0" : "-1");
}

function formatCurrentMax(current, max) {
  return `${formatNumber(current)} / ${formatNumber(max)}`;
}

function getPercent(current, max) {
  return max > 0 ? (current / max) * 100 : 0;
}

function getEncounterRefs() {
  return renderState.uiRefs.encounter || {};
}

function getTabButtonList() {
  return renderState.uiRefs.allTabButtons || [];
}

function getTabPanelList() {
  return renderState.uiRefs.allTabPanels || [];
}

function getActionButtons() {
  return renderState.uiRefs.actionButtons || [];
}

/*****************************************************
 *
 *                    STATE ACCESSORS
 *
 *****************************************************/

window.getUiRefs = function () {
  return renderState.uiRefs;
};

window.getResourceCards = function () {
  return renderState.resourceCards;
};

window.getVitalCards = function () {
  return renderState.vitalCards;
};

/*****************************************************
 *
 *                    UI REFERENCES
 *
 *****************************************************/

window.initializeRenderRefs = function () {
  renderState.uiRefs.headerPlayerInfo = document.getElementById("header-player-info");
  renderState.uiRefs.playerName = document.getElementById("player-name");
  renderState.uiRefs.playerLevel = document.getElementById("player-level");
  renderState.uiRefs.playerXp = document.getElementById("player-xp");
  renderState.uiRefs.playerTitles = document.getElementById("player-titles");

  renderState.uiRefs.playerLifeStat = document.getElementById("player-life-stat");
  renderState.uiRefs.playerStaminaStat = document.getElementById("player-stamina-stat");
  renderState.uiRefs.playerToHit = document.getElementById("player-to-hit");
  renderState.uiRefs.playerEvasion = document.getElementById("player-evasion");

  renderState.uiRefs.eventLog = document.getElementById("event-log");

  renderState.uiRefs.tabButtons = {
    wilds: document.querySelector('[data-tab="wilds"]'),
    village: document.querySelector('[data-tab="village"]'),
    tower: document.querySelector('[data-tab="tower"]'),
    character: document.querySelector('[data-tab="character"]')
  };

  renderState.uiRefs.allTabButtons = Array.from(
    document.querySelectorAll(".tab-button")
  );

  renderState.uiRefs.allTabPanels = Array.from(
    document.querySelectorAll(".tab-content")
  );

  renderState.uiRefs.encounter = {
    panel: document.getElementById("encounter-panel"),
    subtitle: document.getElementById("encounter-subtitle"),

    playerName: document.getElementById("encounter-player-name"),
    playerLifeText: document.getElementById("encounter-player-life-text"),
    playerStaminaText: document.getElementById("encounter-player-stamina-text"),
    playerTimerText: document.getElementById("encounter-player-timer-text"),
    playerLifeFill: document.getElementById("encounter-player-life-fill"),
    playerStaminaFill: document.getElementById("encounter-player-stamina-fill"),
    playerTimerFill: document.getElementById("encounter-player-timer-fill"),
    playerMode: document.getElementById("encounter-player-mode"),

    enemyName: document.getElementById("encounter-enemy-name"),
    enemyLifeText: document.getElementById("encounter-enemy-life-text"),
    enemyTimerText: document.getElementById("encounter-enemy-timer-text"),
    enemyLifeFill: document.getElementById("encounter-enemy-life-fill"),
    enemyTimerFill: document.getElementById("encounter-enemy-timer-fill")
  };

  renderState.uiRefs.combatModeButtons = Array.from(
    document.querySelectorAll("[data-combat-mode]")
  );

  renderState.uiRefs.actionButtons = Array.from(
    document.querySelectorAll("[data-action]")
  );
};

/*****************************************************
 *
 *                    RESOURCE HELPERS
 *
 *****************************************************/

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

/*****************************************************
 *
 *                    VITAL HELPERS
 *
 *****************************************************/

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

/*****************************************************
 *
 *                    ACTION HELPERS
 *
 *****************************************************/

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

  renderState.uiRefs.actionButtons = Array.from(
    document.querySelectorAll("[data-action]")
  );
};

/*****************************************************
 *
 *                    TAB RENDERING
 *
 *****************************************************/

window.updateTabVisibility = function () {
  const game = getGame();
  const uiRefs = getUiRefs();

  setHidden(uiRefs.tabButtons?.village, !game.unlocks.village);
  setHidden(uiRefs.tabButtons?.tower, !game.unlocks.tower);
  setHidden(uiRefs.tabButtons?.character, !game.unlocks.character);

  const activeButton = uiRefs.tabButtons?.[game.activeTab];
  if (!activeButton || activeButton.classList.contains("is-hidden")) {
    game.activeTab = "wilds";
  }
};

window.setActiveTab = function (tabId) {
  const game = getGame();
  const tabButtons = getTabButtonList();
  const tabPanels = getTabPanelList();

  game.activeTab = tabId;

  tabButtons.forEach(button => {
    const isActive = button.dataset.tab === tabId;
    setPressedState(button, isActive);
  });

  tabPanels.forEach(panel => {
    const isActive = panel.id === `${tabId}-tab`;
    setHidden(panel, !isActive);
  });
};

/*****************************************************
 *
 *                    CORE RENDERERS
 *
 *****************************************************/

window.renderHeader = function () {
  const game = getGame();
  const uiRefs = getUiRefs();

  if (!uiRefs.headerPlayerInfo) return;

  const name = game.player.name || "Wanderer";
  const level = game.player.level ?? 0;

  uiRefs.headerPlayerInfo.textContent = `${name} - Level ${level}`;
};

window.renderResources = function () {
  const game = getGame();
  const resourceCards = getResourceCards();

  Object.entries(game.resources).forEach(([id, resource]) => {
    const card = resourceCards[id];
    if (!card) return;

    setHidden(card, resource.hidden);

    const valueEl = card.querySelector(".resource-value");
    setText(valueEl, `${formatNumber(resource.amount)} / ${resource.max}`);
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
    const pct = getPercent(current, max);

    setHidden(refs.card, vital.hidden);
    setWidth(refs.fill, `${pct}%`);
    setText(refs.text, formatCurrentMax(current, max));
  });
};

window.renderLog = function () {
  const game = getGame();
  const uiRefs = getUiRefs();

  if (!uiRefs.eventLog) return;

  uiRefs.eventLog.innerHTML = "";

  game.log.forEach(message => {
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.textContent = message;
    uiRefs.eventLog.appendChild(entry);
  });
};

window.renderActionGroups = function () {
  const buttons = getActionButtons();

  buttons.forEach(button => {
    const actionId = button.dataset.action;
    const action = actions[actionId];

    if (!action) return;

    const visible = action.isVisible ? action.isVisible() : true;
    setHidden(button, !visible);

    if (!visible) return;

    setText(
      button,
      typeof action.label === "function" ? action.label() : action.label
    );

    button.disabled = action.isDisabled ? action.isDisabled() : false;
  });
};

/*****************************************************
 *
 *                    ENCOUNTER RENDERING
 *
 *****************************************************/

window.renderEncounterPanel = function () {
  const game = getGame();
  const uiRefs = getUiRefs();
  const encounterRefs = getEncounterRefs();

  if (!encounterRefs.panel) return;

  const wildsButton = uiRefs.tabButtons?.wilds;
  const villageButton = uiRefs.tabButtons?.village;

  const encounterActive = !!(
    game.encounter &&
    game.encounter.active &&
    game.encounter.enemy
  );

  setHidden(encounterRefs.panel, !encounterActive);

  if (wildsButton) {
    wildsButton.classList.toggle(
      "has-encounter-alert",
      encounterActive &&
        game.encounter.location === "wilds" &&
        game.activeTab !== "wilds"
    );
  }

  if (villageButton) {
    villageButton.classList.toggle(
      "has-encounter-alert",
      encounterActive &&
        game.encounter.location === "village" &&
        game.activeTab !== "village"
    );
  }

  if (!encounterActive) return;

  const enemy = game.encounter.enemy;

  const playerLifePct = getPercent(game.player.life, game.player.maxLife);
  const playerStaminaPct = getPercent(
    game.player.stamina,
    game.player.maxStamina
  );
  const enemyLifePct = getPercent(enemy.life, enemy.maxLife);

  const playerTimerPct = clamp(
    game.encounter.playerActionProgress * 100,
    0,
    100
  );
  const enemyTimerPct = clamp(
    game.encounter.enemyActionProgress * 100,
    0,
    100
  );

  let subtitle = `${enemy.name} engaged.`;

  if (game.encounter.location === "wilds") {
    subtitle = `${enemy.name} engaged in the wilds.`;
  } else if (game.encounter.location === "village") {
    subtitle = `${enemy.name} engaged in the village.`;
  }

  if (game.encounter.trial?.type === "martial") {
    subtitle = `${enemy.name} trial in progress. Deal ${game.encounter.trial.damageRequired} damage to pass.`;
  }

  setText(encounterRefs.subtitle, subtitle);
  setText(encounterRefs.playerName, game.player.name || "Wanderer");
  setText(
    encounterRefs.playerLifeText,
    formatCurrentMax(game.player.life, game.player.maxLife)
  );
  setText(
    encounterRefs.playerStaminaText,
    formatCurrentMax(game.player.stamina, game.player.maxStamina)
  );
  setText(encounterRefs.playerTimerText, `${Math.round(playerTimerPct)}%`);
  setText(encounterRefs.playerMode, getPlayerCombatModeLabel());

  setWidth(encounterRefs.playerLifeFill, `${playerLifePct}%`);
  setWidth(encounterRefs.playerStaminaFill, `${playerStaminaPct}%`);
  setWidth(encounterRefs.playerTimerFill, `${playerTimerPct}%`);

  setText(encounterRefs.enemyName, enemy.name);
  setText(
    encounterRefs.enemyLifeText,
    formatCurrentMax(enemy.life, enemy.maxLife)
  );
  setText(encounterRefs.enemyTimerText, `${Math.round(enemyTimerPct)}%`);

  setWidth(encounterRefs.enemyLifeFill, `${enemyLifePct}%`);
  setWidth(encounterRefs.enemyTimerFill, `${enemyTimerPct}%`);

  uiRefs.combatModeButtons.forEach(button => {
    const mode = button.dataset.combatMode;
    const isActive = game.encounter.playerMode === mode;

    button.classList.toggle("is-active", isActive);

    const kickDisabled = mode === "kick" && game.player.stamina < 1;
    const fleeDisabled = !!game.encounter.trial;

    button.disabled = kickDisabled || (mode === "flee" && fleeDisabled);
  });
};

/*****************************************************
 *
 *                    CHARACTER RENDERING
 *
 *****************************************************/

window.renderCharacterPanel = function () {
  const game = getGame();
  const uiRefs = getUiRefs();

  setText(uiRefs.playerLevel, String(game.player.level));
  setText(uiRefs.playerXp, formatCurrentMax(game.player.xp, game.player.xpToNext));
  setText(
    uiRefs.playerTitles,
    game.player.titles.length > 0 ? game.player.titles.join(", ") : "N/A"
  );
  setText(
    uiRefs.playerLifeStat,
    formatCurrentMax(game.player.life, game.player.maxLife)
  );
  setText(
    uiRefs.playerStaminaStat,
    formatCurrentMax(game.player.stamina, game.player.maxStamina)
  );
  setText(uiRefs.playerToHit, String(formatNumber(game.player.toHit)));
  setText(uiRefs.playerEvasion, String(formatNumber(game.player.evasion)));

  if (uiRefs.playerName && uiRefs.playerName !== document.activeElement) {
    uiRefs.playerName.value = game.player.name || "Wanderer";
  }
};

/*****************************************************
 *
 *                    MASTER RENDER
 *
 *****************************************************/

window.render = function () {
  const game = getGame();

  updateTabVisibility();

  if (game.activeTab) {
    setActiveTab(game.activeTab);
  }

  renderHeader();
  renderResources();
  renderVitals();
  renderLog();
  renderActionGroups();
  renderEncounterPanel();
  renderCharacterPanel();
};