import LoadingScene from "./scenes/loading";
import PlayingScene from "./scenes/playing";
import TutorialScene from "./scenes/tutorial";
import EndScene from "./scenes/end";
import { PlaytClient } from "@playt/client";

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
  scene: [LoadingScene, PlayingScene, TutorialScene, EndScene],
});

export const client = PlaytClient({
  apiUrl: "http://localhost:4000",
  gameId: "",
  gameKey: "",
});
