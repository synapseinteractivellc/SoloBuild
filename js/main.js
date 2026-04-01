document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-content"));

  if (typeof loadGame === "function" && typeof applyLoadedGame === "function") {
    applyLoadedGame(game, loadGame());
  }

  uiRefs.playerName = document.getElementById("player-name");
  uiRefs.playerLevel = document.getElementById("player-level");
  uiRefs.playerXp = document.getElementById("player-xp");
  uiRefs.playerTitles = document.getElementById("player-titles");
  uiRefs.eventLog = document.getElementById("event-log");

  uiRefs.tabButtons = {
    wilds: document.querySelector('[data-tab="wilds"]'),
    village: document.querySelector('[data-tab="village"]'),
    character: document.querySelector('[data-tab="character"]')
  };

  function persistGame() {
    if (typeof saveGame === "function") {
      saveGame(game);
    }
  }

  const saveButton = document.getElementById("save-button");
  const loadButton = document.getElementById("load-button");
  const wipeButton = document.getElementById("wipe-button");

  if (saveButton) {
    saveButton.addEventListener("click", () => {
      persistGame();
      addLog("Game saved.");
      render();
    });
  }

  if (loadButton) {
    loadButton.addEventListener("click", () => {
      if (typeof loadGame === "function" && typeof applyLoadedGame === "function") {
        applyLoadedGame(game, loadGame());
        addLog("Game loaded.");
        initializeResourceCards();
        initializeVitalCards();
        initializeActionGroups();
        updateTabVisibility();
        setActiveTab(game.activeTab || "wilds");
        render();
      }
    });
  }

  if (wipeButton) {
    wipeButton.addEventListener("click", () => {
      const confirmed = window.confirm("Wipe your save and start over?");
      if (!confirmed) return;

      if (typeof resetSave === "function" && typeof applyLoadedGame === "function") {
        resetSave();
        applyLoadedGame(game, getDefaultGameState());
        addLog("Save wiped. A new beginning awaits.");
        initializeResourceCards();
        initializeVitalCards();
        initializeActionGroups();
        updateTabVisibility();
        setActiveTab(game.activeTab || "wilds");
        render();
        persistGame();
      }
    });
  }

  function updateTabVisibility() {
    if (uiRefs.tabButtons.village) {
      uiRefs.tabButtons.village.classList.toggle("is-hidden", !game.unlocks.village);
    }

    if (uiRefs.tabButtons.character) {
      uiRefs.tabButtons.character.classList.toggle("is-hidden", !game.unlocks.character);
    }

    const activeButton = uiRefs.tabButtons[game.activeTab];
    if (!activeButton || activeButton.classList.contains("is-hidden")) {
      game.activeTab = "wilds";
    }
  }

  function setActiveTab(tabId) {
    game.activeTab = tabId;

    tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === tabId;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    tabPanels.forEach((panel) => {
      const isActive = panel.id === `${tabId}-tab`;
      panel.classList.toggle("is-hidden", !isActive);
    });
  }

  window.setActiveTab = setActiveTab;
  window.updateTabVisibility = updateTabVisibility;

  tabButtons.forEach((button) => {
    button.setAttribute("role", "tab");
    button.setAttribute(
      "aria-selected",
      button.classList.contains("is-active") ? "true" : "false"
    );
    button.setAttribute(
      "tabindex",
      button.classList.contains("is-active") ? "0" : "-1"
    );

    button.addEventListener("click", () => {
      if (button.classList.contains("is-hidden")) return;
      setActiveTab(button.dataset.tab);
      render();
      persistGame();
    });

    button.addEventListener("keydown", (event) => {
      const visibleTabs = tabButtons.filter(btn => !btn.classList.contains("is-hidden"));
      const currentIndex = visibleTabs.indexOf(button);
      let nextIndex = currentIndex;

      if (event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % visibleTabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + visibleTabs.length) % visibleTabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = visibleTabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      const nextButton = visibleTabs[nextIndex];
      nextButton.focus();
      setActiveTab(nextButton.dataset.tab);
      render();
      persistGame();
    });
  });

  const tabsContainer = document.querySelector(".tabs");
  if (tabsContainer) {
    tabsContainer.setAttribute("role", "tablist");
  }

  if (uiRefs.playerName) {
    uiRefs.playerName.value = game.player.name || "Wanderer";

    uiRefs.playerName.addEventListener("input", (event) => {
      game.player.name = event.target.value.trim() || "Wanderer";
      render();
      persistGame();
    });
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    if (button.disabled) return;

    const actionId = button.dataset.action;
    const action = actions[actionId];

    if (!action || typeof action.run !== "function") return;

    action.run();
    render();
    persistGame();
  });

  initializeResourceCards();
  initializeVitalCards();
  initializeActionGroups();

  updateTabVisibility();
  setActiveTab(game.activeTab || "wilds");
  render();
  persistGame();
});