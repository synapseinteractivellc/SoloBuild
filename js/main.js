document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-content"));

  uiRefs.playerName = document.getElementById("player-name");
  uiRefs.playerLevel = document.getElementById("player-level");
  uiRefs.playerXp = document.getElementById("player-xp");
  uiRefs.playerTitles = document.getElementById("player-titles");

  uiRefs.lifeFill = document.getElementById("life-fill");
  uiRefs.lifeText = document.getElementById("life-text");

  uiRefs.staminaFill = document.getElementById("stamina-fill");
  uiRefs.staminaText = document.getElementById("stamina-text");

  uiRefs.manaCard = document.querySelector('[data-stat="mana"]');
  uiRefs.manaFill = document.getElementById("mana-fill");
  uiRefs.manaText = document.getElementById("mana-text");

  uiRefs.eventLog = document.getElementById("event-log");

  resourceCards.gold = document.querySelector('[data-resource="gold"]');
  resourceCards.scrolls = document.querySelector('[data-resource="scrolls"]');
  resourceCards.wood = document.querySelector('[data-resource="wood"]');
  resourceCards.stone = document.querySelector('[data-resource="stone"]');
  resourceCards.herbs = document.querySelector('[data-resource="herbs"]');

  uiRefs.tabButtons = {
    wilds: document.querySelector('[data-tab="wilds"]'),
    village: document.querySelector('[data-tab="village"]'),
    character: document.querySelector('[data-tab="character"]')
  };

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
    });
  });

  const tabsContainer = document.querySelector(".tabs");
  if (tabsContainer) {
    tabsContainer.setAttribute("role", "tablist");
  }

  uiRefs.playerName.addEventListener("input", (event) => {
    game.player.name = event.target.value.trim() || "Wanderer";
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    if (button.disabled) return;

    const actionId = button.dataset.action;
    const action = actions[actionId];

    if (!action || typeof action.run !== "function") return;

    action.run();
    render();
  });

  initializeActionGroups();

  setInterval(() => {
    let changed = false;

    const woodPerSecond = game.workers.laborers * 0.1;

    if (woodPerSecond > 0 && !resourceAtCap("wood")) {
      const gained = addResource("wood", woodPerSecond);
      if (gained > 0) {
        changed = true;
      }
    }

    if (changed) {
      render();
    }
  }, 1000);

  updateTabVisibility();
  setActiveTab(game.activeTab || "wilds");
  render();
});