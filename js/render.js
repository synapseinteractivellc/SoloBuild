window.getResourceLabel = function (id) {
  return id.charAt(0).toUpperCase() + id.slice(1);
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
  const resourceList = document.getElementById("resource-list");
  if (!resourceList) return;

  resourceList.innerHTML = "";
  window.resourceCards = {};

  Object.entries(game.resources).forEach(([id, resource]) => {
    const card = createResourceCard(id);

    if (resource.hidden) {
      card.classList.add("is-hidden");
    }

    resourceList.appendChild(card);
    resourceCards[id] = card;
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
  const vitalList = document.getElementById("vital-list");
  if (!vitalList) return;

  vitalList.innerHTML = "";
  window.vitalCards = {};

  Object.entries(game.vitals).forEach(([id, vital]) => {
    const refs = createVitalCard(id, vital);

    if (vital.hidden) {
      refs.card.classList.add("is-hidden");
    }

    vitalList.appendChild(refs.card);
    vitalCards[id] = refs;
  });
};

window.renderResources = function () {
  Object.entries(game.resources).forEach(([id, r]) => {
    const card = resourceCards[id];
    if (!card) return;

    card.classList.toggle("is-hidden", r.hidden);
    card.querySelector(".resource-value").textContent =
      `${formatNumber(r.amount)} / ${r.max}`;
  });
};

window.renderVitals = function () {
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
  uiRefs.eventLog.innerHTML = "";

  game.log.forEach(msg => {
    const div = document.createElement("div");
    div.className = "log-entry";
    div.textContent = msg;
    uiRefs.eventLog.appendChild(div);
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

window.render = function () {
  if (typeof updateTabVisibility === "function") {
    updateTabVisibility();
  }

  if (typeof setActiveTab === "function" && game.activeTab) {
    setActiveTab(game.activeTab);
  }

  renderResources();
  renderVitals();
  renderLog();
  renderActionGroups();
};