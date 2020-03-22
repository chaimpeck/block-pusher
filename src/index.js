import Phaser from "phaser";
import blockImg from "./assets/block.png";
import pusherImg from "./assets/386402636.png";

const tileSize = 48;
const gameRect = {
  x: 16,
  y: 12,
  width: 768,
  height: 576
};

const level1 = {
  blockLocations: [
    [88, 512],
    [136, 464]
  ],
  pusherLocation: [40, 560]
};

const getRelativeLoc = direction => {
  if (direction === "down") {
    return { y: `+=${tileSize}` };
  } else if (direction === "left") {
    return { x: `-=${tileSize}` };
  } else if (direction === "right") {
    return { x: `+=${tileSize}` };
  } else if (direction === "up") {
    return { y: `-=${tileSize}` };
  } else {
    throw new Error("unknown direction");
  }
};

const getNewSpriteLoc = (direction, sprite) => {
  if (direction === "down") {
    return { x: sprite.x, y: sprite.y + tileSize };
  } else if (direction === "left") {
    return { x: sprite.x - tileSize, y: sprite.y };
  } else if (direction === "right") {
    return { x: sprite.x + tileSize, y: sprite.y };
  } else if (direction === "up") {
    return { x: sprite.x, y: sprite.y - tileSize };
  } else {
    throw new Error("unknown direction");
  }
};

const isWithinGameRect = location => {
  return !(
    location.x < gameRect.x ||
    location.x > gameRect.x + gameRect.width ||
    location.y < gameRect.y ||
    location.y > gameRect.y + gameRect.height
  );
};

const config = {
  type: Phaser.AUTO,
  parent: "block-pusher",
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("block", blockImg);
  this.load.spritesheet("pusher", pusherImg, {
    frameWidth: 48,
    frameHeight: 48
  });
}

function create() {
  // https://phaser.io/tutorials/making-your-first-phaser-3-game/part5

  const pusher = this.add.sprite(...level1.pusherLocation, "pusher");
  const blocks = level1.blockLocations.map(loc =>
    this.add.sprite(...loc, "block")
  );

  this.anims.create({
    key: "walk-down",
    frames: this.anims.generateFrameNumbers("pusher", { start: 0, end: 2 }),
    frameRate: 10,
    repeat: 0,
    yoyo: true
  });

  this.anims.create({
    key: "walk-left",
    frames: this.anims.generateFrameNumbers("pusher", { start: 12, end: 14 }),
    frameRate: 10,
    repeat: 0,
    yoyo: true
  });

  this.anims.create({
    key: "walk-right",
    frames: this.anims.generateFrameNumbers("pusher", { start: 24, end: 26 }),
    frameRate: 10,
    repeat: 0,
    yoyo: true
  });

  this.anims.create({
    key: "walk-up",
    frames: this.anims.generateFrameNumbers("pusher", { start: 36, end: 38 }),
    frameRate: 10,
    repeat: 0,
    yoyo: true
  });

  let isMoving = false;
  const tweenParams = {
    duration: 15,
    useFrames: true,
    onComplete: () => {
      isMoving = false;
    }
  };

  const handleMove = direction => {
    if (!["down", "right", "left", "up"].includes(direction)) {
      throw new Error(`Invalid direction: ${direction}`);
    }

    if (isMoving) {
      return;
    }
    isMoving = true;

    const newPusherLoc = getNewSpriteLoc(direction, pusher);

    // Check if Pusher will go outside game bounds
    if (!isWithinGameRect(newPusherLoc)) {
      isMoving = false;
      return;
    }

    // Check if there is a block at the new location
    const block = blocks.find(
      block => block.x === newPusherLoc.x && block.y === newPusherLoc.y
    );

    const targets = [pusher];

    if (block) {
      // Now, get the block's new location if pushed in the same direction
      const newBlockLoc = getNewSpriteLoc(direction, block);

      // Check if block will go outside game bounds
      if (!isWithinGameRect(newBlockLoc)) {
        isMoving = false;
        return;
      }

      // Look for another block along the same trajectory. Pusher can only move one block at a time
      if (
        blocks.find(
          block => block.x === newBlockLoc.x && block.y === newBlockLoc.y
        )
      ) {
        isMoving = false;
        return;
      }

      // Finally, push the block!
      targets.push(block); // Ironcally, the block is *pushed* onto the array
    }

    pusher.anims.play(`walk-${direction}`);
    this.tweens.add({ ...tweenParams, ...getRelativeLoc(direction), targets });
  };

  this.input.keyboard.on("keydown_DOWN", () => handleMove("down"));
  this.input.keyboard.on("keydown_LEFT", () => handleMove("left"));
  this.input.keyboard.on("keydown_RIGHT", () => handleMove("right"));
  this.input.keyboard.on("keydown_UP", () => handleMove("up"));
}
