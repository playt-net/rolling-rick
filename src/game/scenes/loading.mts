import { client } from "../game.mjs";
import { getMatch, getReplay, playerToken, Replay } from "../playt.mjs";
import PlayingScene from "./playing.mjs";

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

      const { player } = match;
      if (!player) {
        statusText.setText([`Player Token: -`, `Participants: ?`]);
        return;
      }

      statusText.setText([
        `Player: ${player.name}`,
        `Match ID: ${match.id}`,
        `Match PlayerCount: ${match.matchTier.playerCount}`,
        `Match Status: ${match.status}`,
        `Participants: ${match.players.length}`,
        `Available Replays: ${match.players.filter((player) => player.replayId).length
        }`,
      ]);

      const reportError = this.add.text(100, 320, "Report error", {
        fontSize: "28px",
        fontFamily: "Courier",
        color: "white",
      });
      reportError.setInteractive();
      reportError.on("pointerdown", () => {
        client.reportFatalError({ userId: player.userId, matchId: match.id });
      });

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
      match.players.forEach(async (player, index) => {
        if (player.userId === player.userId) {
          return;
        }
        if (player.replayId) {
          selectedReplays[player.userId] = await getReplay(
            match.id,
            player.userId,
          );
          selectedReplays[player.userId].name += " (Replay)";
        } else {
          selectedReplays[player.userId] = {
            userId: player.userId,
            name: player.name,
            score: 0,
            commands: [],
          };
          selectedReplays[player.userId].name += " (Live)";
        }

        this.add.text(
          100,
          350 + index * 30,
          selectedReplays[player.userId].name,
          {
            fontSize: "16px",
            fontStyle: "bold",
            color: "#fff",
            backgroundColor: "#031217",
            padding: {
              x: 4,
              y: 4,
            },
          },
        );
      });

      if (match.status !== "finished") {
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
          if (match.matchTier.type === "tutorial") {
            this.scene.start("tutorial");
          } else {
            const playingScene = this.scene.get("playing") as PlayingScene;
            playingScene.data.set(
              "replays",
              JSON.stringify(Object.values(selectedReplays)),
            );
            playingScene.data.set("difficulty", JSON.stringify(difficulty));
            playingScene.data.set("userId", JSON.stringify(player.userId));
            await client.startMatch(player.userId, match.id);
            this.scene.start("playing");
          }
        });
      }
    } catch (error) {
      statusText.setText([
        "You destroyed the internet!",
        error instanceof Error ? error.message : "Unknown error",
      ]);
    }
  }
}
