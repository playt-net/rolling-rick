import { quitMatch } from "../playt";

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

    endText.on("pointerdown", () => {
      try {
        quitMatch();
        // @ts-expect-error
        AnybrainStopMatch();
        // @ts-expect-error
        AnybrainStopSDK();
      } catch (error) {
        endText.setText([
          "You destroyed the internet!",
          error instanceof Error ? error.message : "Unknown error",
        ]);
      }
    });
  }
}
