import { endTutorial } from "../playt.js";

export default class TutorialScene extends Phaser.Scene {
  constructor() {
    super("tutorial");
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    const endTutorialText = this.add.text(300, 300, "End tutorial", {
      fontSize: "26px",
      color: "white",
    });
    endTutorialText.setInteractive();
    endTutorialText.on("pointerdown", () => {
      endTutorial();
    });
  }
}
