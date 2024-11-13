import {
  isMuted,
  type Replay,
  submitScore,
  surrender,
  updateScore,
} from "../playt.mjs";
import throttle from "lodash.throttle";
import { client } from "../game.mjs";

export default class PlayingScene extends Phaser.Scene {
  // Random parameter which should be same for all players of this match
  bombVelocity = 122;
  myPlayer!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  stars!: Phaser.Physics.Arcade.Group;
  bombs!: Phaser.Physics.Arcade.Group;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  score = 0;
  isFinal = false;
  scoreText!: Phaser.GameObjects.Text;
  replays!: Replay[];
  otherScores!: number[];
  otherScoreText!: Phaser.GameObjects.Text;
  liveScores!: { userId: string; username: string; score: string }[];
  liveScoresText!: Phaser.GameObjects.Text;
  commands: Replay["commands"] = [];
  lastUpdate = Date.now();
  mute = isMuted();

  others: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = [];
  othersCommands: Replay["commands"][] = [];

  startedAt: number = Date.now();
  liveMatch: {
    send: (payload: unknown) => void;
  } | null = null;

  constructor() {
    super("playing");
  }

  async preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    //  A simple background for our game
    this.add.image(400, 300, "sky");

    //  The platforms group contains the ground and the 2 ledges we can jump on
    this.platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();

    //  Now let's create some ledges
    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");

    // The player and its settings
    this.myPlayer = this.physics.add.sprite(100, 450, "dude");

    //  Player physics properties. Give the little guy a slight bounce.
    this.myPlayer.setBounce(0.2);
    this.myPlayer.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    //  Input Events
    this.cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.children.iterate((child, index) => {
      //  Give each star a slightly different bounce
      // @ts-ignore
      child.setBounceY(0.5 + Math.sin(index) / 4);
    });

    const difficulty: "easy" | "normal" | "hard" = JSON.parse(
      this.data.get("difficulty"),
    );

    const bombVelocity = {
      easy: 20,
      normal: 300,
      hard: 800,
    }[difficulty];

    this.bombs = this.physics.add.group();

    const bomb1 = this.bombs.create(400, 32, "bomb");
    bomb1.setBounce(1);
    bomb1.setCollideWorldBounds(true);
    bomb1.setVelocity(this.bombVelocity, bombVelocity);
    bomb1.allowGravity = false;

    const bomb2 = this.bombs.create(200, 32, "bomb");
    bomb2.setBounce(1);
    bomb2.setCollideWorldBounds(true);
    bomb2.setVelocity(-this.bombVelocity, bombVelocity);
    bomb2.allowGravity = false;

    //  The score
    this.scoreText = this.add.text(16, 16, "score: 0", {
      fontSize: "32px",
      color: "#000",
    });

    this.scoreText.setInteractive();
    this.scoreText.on("pointerdown", () => {
      const stars = this.stars.children.getArray();

      stars
        .filter((star) => star.active)
        .map((star, index) => {
          this.time.delayedCall(100 * (index + 1), () => {
            this.collectStar(
              this.myPlayer,
              star as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
            );
            this.update();
          });
        });
    });

    // The surrender button
    const surrenderText = this.add.text(640, 550, "SURRENDER", {
      fontSize: "26px",
      color: "white",
    });
    surrenderText.setInteractive();
    surrenderText.on("pointerdown", () => {
      this.physics.pause();
      surrender(this.score);
    });

    // the mute button
    const muteText = this.add.text(550, 16, this.mute ? "🔈" : "🔇", {
      fontSize: "32px",
      color: "#000",
    });
    muteText.setInteractive();
    muteText.on("pointerdown", () => {
      this.mute = !this.mute;
      muteText.setText(this.mute ? "🔈" : "🔇");
      client.updatePlayerSettings({ mute: this.mute });
    });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(this.myPlayer, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(
      this.myPlayer,
      this.stars,
      this.collectStar as ArcadePhysicsCallback,
      undefined,
      this,
    );

    this.physics.add.collider(
      this.myPlayer,
      this.bombs,
      this.hitBomb as unknown as ArcadePhysicsCallback,
      undefined,
      this,
    );

    this.replays = JSON.parse(this.data.get("replays") || "[]");
    this.otherScores = Array(this.replays.length)
      .fill(null)
      .map(() => 0);
    const othersScore = this.replays
      .map(
        (replay, index) =>
          `${replay.name}: ${this.otherScores[index]}/${replay.score}`,
      )
      .join(" ");
    this.otherScoreText = this.add.text(16, 4, othersScore, {
      fontSize: "16px",
      color: "#000",
    });

    this.liveScoresText = this.add.text(200, 24, "Live: ", {
      fontSize: "16px",
      color: "#000",
    });

    this.replays.forEach((replay) => {
      const otherPlayer = this.physics.add.sprite(100, 450, "dude");
      otherPlayer.setBounce(0.2);
      this.physics.add.collider(otherPlayer, this.platforms);

      this.others.push(otherPlayer);
      this.othersCommands.push(replay.commands);
    });

    this.startedAt = Date.now();
  }

  update() {
    if (this.isFinal) {
      return;
    }

    if (this.cursors.left.isDown) {
      this.myPlayer.setVelocityX(-160);

      this.myPlayer.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.myPlayer.setVelocityX(160);

      this.myPlayer.anims.play("right", true);
    } else {
      this.myPlayer.setVelocityX(0);

      this.myPlayer.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.myPlayer.body.touching.down) {
      this.myPlayer.setVelocityY(-330);
    }

    const position = [
      this.myPlayer.x,
      this.myPlayer.y,
      this.myPlayer.anims.getName(),
    ];
    const timer = Date.now() - this.startedAt;
    const previous = this.commands.at(-1);
    if (!previous || previous[1].toString() !== position.toString()) {
      this.addCommand([timer, position]);
    }

    this.others.forEach((other, index) => {
      const commands = this.othersCommands[index];
      let nextCommand = commands[0];
      while (nextCommand && nextCommand[0] <= timer) {
        commands.splice(0, 1);
        nextCommand = commands[0];
      }
      if (!nextCommand) {
        return;
      }
      if (nextCommand[1][0] === "score") {
        this.otherScores[index] = nextCommand[1][1];
        const othersScore = this.replays
          .map(
            (replay, index) =>
              `${replay.name}: ${this.otherScores[index]}/${replay.score}`,
          )
          .join(" ");
        this.otherScoreText.setText(othersScore);
      } else {
        const [x, y, animation, finished] = nextCommand[1];
        other.setX(x);
        other.setY(y);
        other.anims.play(animation, true);

        if (finished) {
          other.setTint(finished === "win" ? 0x00ff00 : 0xff0000);
        }
      }
    });

    this.scoreText.setText(`Score: ${this.score}`);
  }

  collectStar(
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    star: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
  ) {
    star.disableBody(true, true);

    //  Add and update the score
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    const timer = Date.now() - this.startedAt;
    if (this.stars.countActive(true) === 0) {
      this.physics.pause();
      player.setTint(0x00ff00);
      player.anims.play("turn");
      this.addCommand([timer, [player.x, player.y, "turn", "win"]]);
      this.isFinal = true;
      submitScore(this.score, this.commands);
      client.stopMatch();
      this.scene.start("end");
    } else {
      this.addCommand([timer, ["score", this.score]]);
      updateScore(this.score);
    }
  }

  addCommand(command: any) {
    this.commands.push(command);
    this.sendLiveMatchUpdate(command);
  }

  sendLiveMatchUpdate = throttle(
    (command: any) => {
      if (this.liveMatch) {
        const userId = this.data.get("userId");
        this.liveMatch.send({ userId, command });
      }
    },
    100,
    { leading: true, trailing: true },
  );

  hitBomb(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    this.physics.pause();
    player.setTint(0xff0000);

    player.anims.play("turn");
    const timer = Date.now() - this.startedAt;
    this.addCommand([timer, [player.x, player.y, "turn", "loss"]]);

    this.isFinal = true;
    submitScore(this.score, this.commands);
    client.stopMatch();
    this.scene.start("end");
  }
}
