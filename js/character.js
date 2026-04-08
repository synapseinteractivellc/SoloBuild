/*****************************************************
 *
 *          Character / Leveling System
 *
 *****************************************************/

window.getXpToNextLevel = function (level) {
  // Special case: level 0 -> 1
  if (level === 0) {
    return 1;
  }

  return level * 10;
};

window.applyLevelUpBenefits = function (level) {
  const game = getGame();
  const player = game.player;

  // Core growth every level
  player.maxLife += 2;
  player.maxStamina += 1;

  // Restore by the gained amount, but do not exceed max
  player.life = clamp(player.life + 2, 0, player.maxLife);
  player.stamina = clamp(player.stamina + 1, 0, player.maxStamina);

  // Very small combat stat growth
  if (level % 3 === 0) {
    player.toHit += 1;
    addLog("Your accuracy improves slightly.");
  }

  if (level % 4 === 0) {
    player.evasion += 1;
    addLog("Your evasiveness improves slightly.");
  }
};

window.checkForLevelUp = function () {
  const game = getGame();
  const player = game.player;

  let leveledUp = false;

  while (player.xp >= player.xpToNext) {
    player.xp -= player.xpToNext;
    player.level += 1;

    applyLevelUpBenefits(player.level);

    player.xpToNext = getXpToNextLevel(player.level);

    leveledUp = true;

    addLog(`You have reached level ${player.level}.`);

    if (player.level === 1 && !game.unlocks.character) {
      game.unlocks.character = true;
      addLog("You feel a new awareness of yourself. The Character tab is now available.");
    }
  }

  return leveledUp;
};

window.addXp = function (amount) {
  const game = getGame();
  const player = game.player;

  player.xp += amount;

  return checkForLevelUp();
};