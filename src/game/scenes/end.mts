import { client } from "../game.mjs";

export default class EndScene extends Phaser.Scene {
  constructor() {
    super("end");
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
  }

  async create() {
    this.add.image(400, 300, "sky");

    const endText = this.add.text(100, 100, "Continue", {
      fontSize: "28px",
      fontFamily: "Courier",
      color: "white",
    });

    endText.setInteractive();

    endText.on("pointerdown", async () => {
      try {
        await client.quitMatch();
      } catch (error) {
        endText.setText([
          "You destroyed the internet!",
          error instanceof Error ? error.message : "Unknown error",
        ]);
      }
    });
  }
}
