document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-content"));

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
        nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
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

  // Initialize default tab
  setActiveTab("character");
});