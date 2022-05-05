import { abortMatch, joinMatch, submitScore, updateScore } from "./playt.js";

// Random parameter which should be same for all players of this match
const bombVelocity = 123;

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

let myPlayer;
let stars;
let bombs;
let platforms;
let cursors;
let score = 0;
let isFinal = false;
let scoreText;
let replay = [];

let others = [];
let othersCommands = [];

new Phaser.Game(config);

function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("star", "assets/star.png");
  this.load.image("bomb", "assets/bomb.png");
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

async function create() {
  //  A simple background for our game
  this.add.image(400, 300, "sky");

  //  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = this.physics.add.staticGroup();

  //  Here we create the ground.
  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  platforms.create(400, 568, "ground").setScale(2).refreshBody();

  //  Now let's create some ledges
  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  // The player and its settings
  myPlayer = this.physics.add.sprite(100, 450, "dude");

  //  Player physics properties. Give the little guy a slight bounce.
  myPlayer.setBounce(0.2);
  myPlayer.setCollideWorldBounds(true);

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
  cursors = this.input.keyboard.createCursorKeys();

  //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
  stars = this.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  stars.children.iterate(function (child, index) {
    //  Give each star a slightly different bounce
    child.setBounceY(0.5 + Math.sin(index) / 4);
  });

  bombs = this.physics.add.group();

  let bomb1 = bombs.create(400, 32, "bomb");
  bomb1.setBounce(1);
  bomb1.setCollideWorldBounds(true);
  bomb1.setVelocity(bombVelocity, 20);
  bomb1.allowGravity = false;

  let bomb2 = bombs.create(200, 32, "bomb");
  bomb2.setBounce(1);
  bomb2.setCollideWorldBounds(true);
  bomb2.setVelocity(-bombVelocity, 20);
  bomb2.allowGravity = false;
  //  The score
  scoreText = this.add.text(16, 16, "score: 0", {
    fontSize: "32px",
    fill: "#000",
  });

  const abortText = this.add.text(710, 550, "ABORT", {
    fontSize: "26px",
    fill: "white",
  });
  abortText.setInteractive();
  abortText.on("pointerdown", () => {
    this.physics.pause();
    abortMatch();
  });

  //  Collide the player and the stars with the platforms
  this.physics.add.collider(myPlayer, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);

  //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
  this.physics.add.overlap(myPlayer, stars, collectStar, null, this);

  this.physics.add.collider(myPlayer, bombs, hitBomb, null, this);

  try {
    const response = await joinMatch();
    const result = await response.json();
    if (!response.ok) {
      throw result;
    }

    const othersScore = result
      .map((replay) => `${replay.name}: ${replay.score}`)
      .join(" ");
    this.add.text(16, 4, othersScore, {
      fontSize: "16px",
      fill: "#000",
    });

    result.forEach((replay) => {
      const otherPlayer = this.physics.add.sprite(100, 450, "dude");
      otherPlayer.setBounce(0.2);
      // otherPlayer.setCollideWorldBounds(true);
      this.physics.add.collider(otherPlayer, platforms);

      others.push(otherPlayer);
      othersCommands.push(replay.commands);
    });
  } catch (error) {
    this.scene.pause();
    this.add.text(16, 550, error.message, {
      fontSize: "32px",
      fill: "orange",
    });
  }
}

function update() {
  if (isFinal) {
    return;
  }

  if (cursors.left.isDown) {
    myPlayer.setVelocityX(-160);

    myPlayer.anims.play("left", true);
  } else if (cursors.right.isDown) {
    myPlayer.setVelocityX(160);

    myPlayer.anims.play("right", true);
  } else {
    myPlayer.setVelocityX(0);

    myPlayer.anims.play("turn");
  }

  if (cursors.up.isDown && myPlayer.body.touching.down) {
    myPlayer.setVelocityY(-330);
  }

  const position = [myPlayer.x, myPlayer.y, myPlayer.anims.getCurrentKey()];
  const previous = replay.at(-1);
  if (!previous || previous[1].toString() !== position.toString()) {
    replay.push([this.time.now, position]);
  }

  others.forEach((other, index) => {
    const commands = othersCommands[index];
    let nextCommand = commands[0];
    while (nextCommand && nextCommand[0] <= this.time.now) {
      commands.splice(0, 1);
      nextCommand = commands[0];
    }
    if (!nextCommand) {
      return;
    }
    const [x, y, animation, finished] = nextCommand[1];
    other.setX(x);
    other.setY(y);
    other.anims.play(animation, true);
    if (finished) {
      other.setTint(finished === "win" ? 0x00ff00 : 0xff0000);
    }
  });

  scoreText.setText(`Score: ${score}`);
}

function collectStar(player, star) {
  star.disableBody(true, true);

  //  Add and update the score
  score += 10;
  scoreText.setText(`Score: ${score}`);

  if (stars.countActive(true) === 0) {
    this.physics.pause();
    player.setTint(0x00ff00);
    player.anims.play("turn");

    replay.push([this.time.now, [player.x, player.y, "turn", "win"]]);
    isFinal = true;

    submitScore(score, replay);
  } else {
    updateScore(score);
  }
}

function hitBomb(player) {
  this.physics.pause();
  player.setTint(0xff0000);

  player.anims.play("turn");
  replay.push([this.time.now, [player.x, player.y, "turn", "loss"]]);

  isFinal = true;
  submitScore(score, replay);
}
