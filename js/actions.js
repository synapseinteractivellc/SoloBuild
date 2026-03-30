const actionDefs = {
  gatherWood: {
    id: "gatherWood",
    tab: "wilds",
    label: "Gather Wood",
    isUnlocked: (game) => game.unlocks.gatherWood,
    canRun: (game) => game.player.stamina >= 1 && game.resources.wood.amount < game.resources.wood.max,
    run: (game) => {
      game.resources.wood.amount += 1;
      game.player.stamina -= 1;
    },
  },
};