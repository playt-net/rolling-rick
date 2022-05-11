import { getMatch, joinMatch, playerToken } from "../playt.js";
import PlayingScene from "./playing.js";

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super("loading");
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
  }

  async create() {
    this.add.image(400, 300, "sky");

    const statusText = this.add.text(100, 100, "Loading", {
      fontSize: "28px",
      fontFamily: "Courier",
      color: "white",
    });

    try {
      if (!playerToken) {
        statusText.setText([`Player Token: ✖`, `Participants: ?`]);
        return;
      }
      const match = await getMatch();

      statusText.setText([
        `Player Token: ✔`,
        `Match ID: ${match.id}`,
        `Match State: ${match.matchState}`,
        `Participants: ${match.participants.length}`,
        `Available Replays: ${match.availableReplays.length}`,
      ]);

      if (match.matchState === "creating") {
        const joinText = this.add.text(600, 550, "Join match", {
          fontSize: "26px",
          fontStyle: "bold",
          color: "white",
          backgroundColor: "#0e1217",
          padding: {
            x: 4,
            y: 4,
          },
        });
        joinText.setInteractive();
        joinText.on("pointerdown", async () => {
          const { replays } = await joinMatch();
          const playingScene = this.scene.get("playing") as PlayingScene;
          playingScene.replays = replays;
          playingScene.scene.start();
        });
      } else if (match.matchState === "running") {
        const continueText = this.add.text(560, 550, "Continue match", {
          fontSize: "26px",
          fontStyle: "bold",
          color: "white",
          backgroundColor: "#0e1217",
          padding: {
            x: 4,
            y: 4,
          },
        });
        continueText.setInteractive();
        continueText.on("pointerdown", async () => {
          const playingScene = this.scene.get("playing") as PlayingScene;
          playingScene.scene.start();
        });
      }
    } catch (error: any) {
      statusText.setText([
        "You destroyed the internet!",
        error.message || "Unknown error",
      ]);
    }
  }
}
