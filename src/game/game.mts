import PlaytBrowserClient from "@playt/client/browser";

import LoadingScene from "./scenes/loading.mjs";
import PlayingScene from "./scenes/playing.mjs";
import TutorialScene from "./scenes/tutorial.mjs";
import EndScene from "./scenes/end.mjs";

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

const API_HOST = process.env.API_HOST;

if (!API_HOST) {
  console.error({ API_HOST });
  throw new Error("Missing environment variables");
}

export const client = PlaytBrowserClient({
  apiUrl: API_HOST,
});
