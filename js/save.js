window.SAVE_KEY = "pathsOfPowerSave";

window.saveGame = function (gameState = getGame()) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    return true;
  } catch (error) {
    console.error("Failed to save game.", error);
    return false;
  }
};

window.loadGame = function () {
  try {
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) {
      return getDefaultGameState();
    }

    const parsed = JSON.parse(raw);
    return mergeGameState(getDefaultGameState(), parsed);
  } catch (error) {
    console.error("Failed to load save. Using defaults instead.", error);
    return getDefaultGameState();
  }
};

window.resetSave = function () {
  try {
    localStorage.removeItem(SAVE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to reset save.", error);
    return false;
  }
};