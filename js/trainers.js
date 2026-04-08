// trainers.js

window.createMartialTrainer = function () {
  return {
    id: "martialTrainer",
    name: "Martial Trainer",
    life: 999,
    maxLife: 999,
    speed: 9,
    toHit: getGame().player.toHit,
    evasion: getGame().player.evasion,
    damage: 1,
    damageReduction: 1,
    isTrainer: true
  };
};

window.startMartialTrial = function () {
  const game = getGame();

  if (game.encounter.active) {
    addLog("You are already in combat.");
    return;
  }

  if (game.chosenPath && game.chosenPath !== "martial") {
    addLog("You have already chosen a different path.");
    return;
  }

  if (game.teachers.martial.passedTrial) {
    addLog("You have already passed the martial trial.");
    return;
  }

  if (game.resources.gold.amount < 5) {
    addLog("You need 5 gold to test with the trainer.");
    return;
  }

  spendResource("gold", 5);

  game.encounter.trial = {
    type: "martial",
    damageRequired: 5,
    damageDone: 0,
    passed: false
  };

  startEncounter(createMartialTrainer(), "village");

  addLog("You pay 5 gold and step forward to face the Martial Trainer.");
  addLog("Deal 5 damage to prove your worth.");
};