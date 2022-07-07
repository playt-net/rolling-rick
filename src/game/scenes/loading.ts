import { getMatch, getReplay, playerToken, Replay } from "../playt.js";
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
      const playersWithReplays = match.players.filter(
        (player: any) => player.replayId
      );
      statusText.setText([
        `Player: ${match.player.name}`,
        `Match ID: ${match.id}`,
        `Match State: ${match.matchState}`,
        `Participants: ${match.players.length}`,
        `Available Replays: ${playersWithReplays.length}`,
      ]);

      this.add.text(100, 250, "Select difficulty:", {
        fontSize: "28px",
        fontFamily: "Courier",
        color: "white",
      });

      let difficulty = "easy";
      const easy = this.add.text(100, 280, "[*]", {
        fontSize: "28px",
        fontFamily: "Courier",
        color: "#0f0",
      });
      easy.setInteractive();
      easy.on("pointerdown", () => {
        difficulty = "easy";
        easy.setColor("#00ff00");
        normal.setColor("#fff");
        hard.setColor("#fff");
      });

      const normal = this.add.text(180, 280, "[**]", {
        fontSize: "28px",
        fontFamily: "Courier",
        color: "white",
      });
      normal.setInteractive();
      normal.on("pointerdown", () => {
        difficulty = "normal";
        easy.setColor("#fff");
        normal.setColor("#00ff00");
        hard.setColor("#fff");
      });

      const hard = this.add.text(280, 280, "[***]", {
        fontSize: "28px",
        fontFamily: "Courier",
        color: "white",
      });
      hard.setInteractive();
      hard.on("pointerdown", () => {
        difficulty = "hard";
        easy.setColor("#fff");
        normal.setColor("#fff");
        hard.setColor("#00ff00");
      });

      const selectedReplays: {
        [userId: string]: Replay;
      } = {};
      playersWithReplays.forEach((player: any, index: number) => {
        const replayText = this.add.text(
          100 + index * 20,
          350,
          index.toString(),
          {
            fontSize: "16px",
            fontStyle: "bold",
            color: "#999",
            backgroundColor: "#0e1217",
            padding: {
              x: 4,
              y: 4,
            },
          }
        );
        replayText.setInteractive();
        replayText.on("pointerdown", async () => {
          if (selectedReplays[player.userId]) {
            replayText.setColor("#999");
            delete selectedReplays[player.userId];
          } else {
            replayText.setColor("#fff");
            selectedReplays[player.userId] = await getReplay(
              match.id,
              player.userId
            );
          }
        });
      });

      if (match.matchState !== "finished") {
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
          const playingScene = this.scene.get("playing") as PlayingScene;
          playingScene.data.set(
            "replays",
            JSON.stringify(Object.values(selectedReplays))
          );
          playingScene.data.set("difficulty", JSON.stringify(difficulty));
          playingScene.data.set("userId", JSON.stringify(match.player.userId));
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
