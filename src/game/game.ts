import LoadingScene from "./scenes/loading";
import PlayingScene from "./scenes/playing";
import TutorialScene from "./scenes/tutorial";
import EndScene from "./scenes/end";

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

async function setupAnybrain() {
  return new Promise<void>((resolve, reject) => {
    document.addEventListener("anybrain", (event) => {
      // @ts-expect-error
      if (event.detail.loadModuleSuccess()) {
        // @ts-expect-error
        // Add secret here
        AnybrainSetCredentials();

        resolve();
      }
      // @ts-expect-error
      if (event.detail.error != 0) {
        reject();
      }
    });
  });
}

setupAnybrain();
