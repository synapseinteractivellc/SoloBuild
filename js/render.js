window.renderResources = function () {
  Object.entries(game.resources).forEach(([id, r]) => {
    const card = resourceCards[id];
    if (!card) return;

    card.classList.toggle("is-hidden", r.hidden);
    card.querySelector(".resource-value").textContent =
      `${r.amount} / ${r.max}`;
  });
};

window.renderVitals = function () {
  const lifePct = (game.player.life / game.player.maxLife) * 100;
  const stamPct = (game.player.stamina / game.player.maxStamina) * 100;

  uiRefs.lifeFill.style.width = `${lifePct}%`;
  uiRefs.lifeText.textContent =
    `${game.player.life} / ${game.player.maxLife}`;

  uiRefs.staminaFill.style.width = `${stamPct}%`;
  uiRefs.staminaText.textContent =
    `${game.player.stamina} / ${game.player.maxStamina}`;
};

window.renderLog = function () {
  uiRefs.eventLog.innerHTML = "";

  game.log.forEach(msg => {
    const div = document.createElement("div");
    div.className = "log-entry";
    div.textContent = msg;
    uiRefs.eventLog.appendChild(div);
  });
};

window.renderActions = function () {
  uiRefs.actionButtons.forEach(btn => {
    const id = btn.dataset.action;
    let disabled = false;

    if (id === "gatherWood") {
      disabled = game.player.stamina < 1 || resourceAtCap("wood");
      btn.textContent = game.upgrades.stoneAxe ? "Chop Wood" : "Gather Wood";
    }

    if (id === "sellWood") {
      disabled = game.resources.wood.amount < 1;
    }

    if (id === "restInn") {
      disabled = game.resources.gold.amount < 1;
    }

    if (id === "muckStables") {
      disabled = game.player.stamina < 1;
    }

    if (id === "buyCoinPurse") {
      disabled =
        game.upgrades.coinPursePurchases >= game.upgrades.coinPurseMax ||
        game.resources.gold.amount < 10;
    }

    if (id === "buyWoodBundle") {
      disabled =
        game.upgrades.woodBundlePurchases >= game.upgrades.woodBundleMax ||
        game.resources.gold.amount < 10;

      btn.textContent =
        game.upgrades.woodBundlePurchases >= game.upgrades.woodBundleMax
          ? "Wood Bundle (Maxed)"
          : "Wood Bundle (-10 Gold)";
    }

    if (id === "buyStoneAxe") {
      disabled =
        game.upgrades.stoneAxe ||
        game.resources.gold.amount < 10;
    }

    btn.disabled = disabled;
  });
};

window.render = function () {
  renderResources();
  renderVitals();
  renderLog();
  renderActions();
};