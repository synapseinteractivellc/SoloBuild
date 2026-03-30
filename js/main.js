document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-content"));

  // UI References
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

  uiRefs.actionButtons = Array.from(document.querySelectorAll("[data-action]"));

  // Resource cards
  resourceCards.gold = document.querySelector('[data-resource="gold"]');
  resourceCards.wood = document.querySelector('[data-resource="wood"]');
  resourceCards.scrolls = document.querySelector('[data-resource="scrolls"]');

  // Tab switching
  function setActiveTab(tabId) {
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
      setActiveTab(button.dataset.tab);
    });

    button.addEventListener("keydown", (event) => {
      const currentIndex = tabButtons.indexOf(button);
      let nextIndex = currentIndex;

      if (event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % tabButtons.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex =
          (currentIndex - 1 + tabButtons.length) % tabButtons.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabButtons.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      const nextButton = tabButtons[nextIndex];
      nextButton.focus();
      setActiveTab(nextButton.dataset.tab);
    });
  });

  const tabsContainer = document.querySelector(".tabs");
  if (tabsContainer) {
    tabsContainer.setAttribute("role", "tablist");
  }

  // Player name input binding
  uiRefs.playerName.addEventListener("input", (event) => {
    game.player.name = event.target.value.trim() || "Wanderer";
  });

  // Action buttons
  uiRefs.actionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const actionId = button.dataset.action;
      const action = actions[actionId];

      if (!action) return;

      action();
      render();
    });
  });

  setInterval(() => {
    const woodPerSecond = game.workers.laborers * 0.1;

    if (woodPerSecond > 0 && !resourceAtCap("wood")) {
      addResource("wood", woodPerSecond);
    }

    render();
  }, 1000);

  // Init
  setActiveTab("wilds");
  render();
});