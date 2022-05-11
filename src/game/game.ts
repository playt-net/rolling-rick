import LoadingScene from "./scenes/loading.js";
import PlayingScene from "./scenes/playing.js";

new Phaser.Game({
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.NONE,
    parent: "game",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [LoadingScene, PlayingScene],
});
