document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  const tabsContainer = document.querySelector(".tabs");

  applyGameState(loadGame());
  initializeRenderRefs();

  function persistGame() {
    saveGame(getGame());
  }

  const saveButton = document.getElementById("save-button");
  const loadButton = document.getElementById("load-button");
  const wipeButton = document.getElementById("wipe-button");
  const uiRefs = getUiRefs();

  if (saveButton) {
    saveButton.addEventListener("click", () => {
      persistGame();
      addLog("Game saved.");
      render();
    });
  }

  if (loadButton) {
    loadButton.addEventListener("click", () => {
      applyGameState(loadGame());
      addLog("Game loaded.");
      initializeResourceCards();
      initializeVitalCards();
      initializeActionGroups();
      updateTabVisibility();
      setActiveTab(getGame().activeTab || "wilds");
      render();
    });
  }

  if (wipeButton) {
    wipeButton.addEventListener("click", () => {
      const confirmed = window.confirm("Wipe your save and start over?");
      if (!confirmed) return;

      resetSave();
      resetGameState();
      addLog("Save wiped. A new beginning awaits.");
      initializeResourceCards();
      initializeVitalCards();
      initializeActionGroups();
      updateTabVisibility();
      setActiveTab(getGame().activeTab || "wilds");
      render();
      persistGame();
    });
  }

  if (tabsContainer) {
    tabsContainer.setAttribute("role", "tablist");
  }

  tabButtons.forEach(button => {
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

    button.addEventListener("keydown", event => {
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

  if (uiRefs.playerName) {
    uiRefs.playerName.value = getGame().player.name || "Wanderer";

    uiRefs.playerName.addEventListener("input", event => {
      getGame().player.name = event.target.value.trim() || "Wanderer";
      render();
      persistGame();
    });
  }

  document.querySelectorAll("[data-combat-mode]").forEach(button => {
    button.addEventListener("click", () => {
      const game = getGame();

      if (!game.encounter.active) return;

      const mode = button.dataset.combatMode;

      if (mode === "kick" && game.player.stamina < 1) {
        return;
      }

      setPlayerCombatMode(mode);
      render();
      persistGame();
    });
  });

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;

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
  setActiveTab(getGame().activeTab || "wilds");
  render();
  persistGame();

  let lastCombatTick = performance.now();

  window.setInterval(() => {
    const now = performance.now();
    const deltaSeconds = (now - lastCombatTick) / 1000;
    lastCombatTick = now;

    const game = getGame();
    const combatWasActive = game.encounter.active;
    const changed = runCombatStep(deltaSeconds);

    if (combatWasActive || getGame().encounter.active) {
      render();
    }

    if (changed) {
      persistGame();
    }
  }, 100);

  window.setInterval(() => {
    persistGame();
  }, 5000);
});