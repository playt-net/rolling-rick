var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getMatch, getReplay, playerToken } from "../playt";
export default class LoadingScene extends Phaser.Scene {
    constructor() {
        super("loading");
    }
    preload() {
        this.load.image("sky", "assets/sky.png");
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
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
                const match = yield getMatch();
                statusText.setText([
                    `Player: ${match.player.name}`,
                    `Match ID: ${match.id}`,
                    `Match Tier: ${match.matchTier}`,
                    `Match State: ${match.matchState}`,
                    `Participants: ${match.players.length}`,
                    `Available Replays: ${match.players.filter((player) => player.replayId).length}`,
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
                const selectedReplays = {};
                match.players.forEach((player, index) => __awaiter(this, void 0, void 0, function* () {
                    if (player.userId === match.player.userId) {
                        return;
                    }
                    if (player.replayId) {
                        selectedReplays[player.userId] = yield getReplay(match.id, player.userId);
                        selectedReplays[player.userId].name += " (Replay)";
                    }
                    else {
                        selectedReplays[player.userId] = {
                            userId: player.userId,
                            name: player.name,
                            score: 0,
                            commands: [],
                        };
                        selectedReplays[player.userId].name += " (Live)";
                    }
                    this.add.text(100, 350 + index * 30, selectedReplays[player.userId].name, {
                        fontSize: "16px",
                        fontStyle: "bold",
                        color: "#fff",
                        backgroundColor: "#031217",
                        padding: {
                            x: 4,
                            y: 4,
                        },
                    });
                }));
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
                    joinText.on("pointerdown", () => __awaiter(this, void 0, void 0, function* () {
                        if (match.matchTier === "tutorial") {
                            this.scene.start("tutorial");
                        }
                        else {
                            const playingScene = this.scene.get("playing");
                            playingScene.data.set("replays", JSON.stringify(Object.values(selectedReplays)));
                            playingScene.data.set("difficulty", JSON.stringify(difficulty));
                            playingScene.data.set("userId", JSON.stringify(match.player.userId));
                            this.scene.start("playing");
                        }
                    }));
                }
            }
            catch (error) {
                statusText.setText([
                    "You destroyed the internet!",
                    error instanceof Error ? error.message : "Unknown error",
                ]);
            }
        });
    }
}
//# sourceMappingURL=loading.js.map