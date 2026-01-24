const game = document.getElementById("game");
const dog = document.getElementById("dog");
dog.style.backgroundSize = "contain";
dog.style.backgroundRepeat = "no-repeat";
dog.style.backgroundPosition = "center";
dog.style.backgroundImage = "url(4_4.jpg)";
const dogFrames = [
  "4_4.jpg",
  "3_4.jpg",
  "2_4.jpg",
  "1_4.jpg",
  "2_4.jpg",
  "3_4.jpg"
];

let dogFrameIndex = 0;
let dogAnimTimer = 0;

dog.style.backgroundSize = "contain";
dog.style.backgroundRepeat = "no-repeat";
dog.style.backgroundPosition = "center";
dog.style.backgroundImage = "url(4_4.jpg)"; // 最初のコマ

const cactus = document.getElementById("cactus");
const bird = document.getElementById("bird");
const scoreElement = document.getElementById("score");

/* ===== 低空高速鳥 ===== */
const bird2 = document.createElement("div");
bird2.id = "bird2";
game.appendChild(bird2);

bird2.style.width = "60px";
bird2.style.height = "35px";
bird2.style.background = "purple";
bird2.style.position = "absolute";
bird2.style.bottom = "60px";
bird2.style.left = "-100px";
bird2.style.display = "none";

let bird2X = -100;
let bird2Active = false;

/* ===== cactus2 ===== */
const cactus2 = document.createElement("div");
cactus2.id = "cactus2";
game.appendChild(cactus2);

cactus2.style.width = "40px";
cactus2.style.height = "80px";
cactus2.style.background = "green";
cactus2.style.position = "absolute";
cactus2.style.bottom = "0px";
cactus2.style.left = "-100px";

/* ===== 状態 ===== */
let speed = 6;
let score = 0;
let gravity = 1.2;
let velocityY = 0;
let isJumping = false;
let isDucking = false;
let holdJump = false;
let holdPower = 0;
const maxHoldPower = 8;

let jumpCount = 0;
let doubleJumpCooldown = false;
/* ===== 初期位置 ===== */
let cactusX = 800;
let cactus2X = -100;
let birdX = -100;
let birdActive = false;

/* ===== 入力 ===== */
document.addEventListener("keydown", e => {
  if (e.code === "Space") {

    if (!isJumping) {
      velocityY = -20;
      isJumping = true;
      jumpCount = 1;
    } else if (jumpCount === 1 && !doubleJumpCooldown) {
      velocityY = -18;
      jumpCount = 2;
      doubleJumpCooldown = true;
      setTimeout(() => {
        doubleJumpCooldown = false;
      }, 3000);
    }

    holdJump = true;
  }

  if (e.code === "ArrowDown") {
    isDucking = true;
    dog.style.height = "40px";
  }
});

document.addEventListener("keyup", e => {
  if (e.code === "Space") {
    holdJump = false;
    holdPower = 0;
  }

  if (e.code === "ArrowDown") {
    isDucking = false;
    dog.style.height = "80px";
  }
});
// 📱 モバイル用ボタン
const jumpBtn = document.getElementById("jumpBtn");
const duckBtn = document.getElementById("duckBtn");

// JUMP
jumpBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  simulateKey("Space", true);
});

jumpBtn.addEventListener("touchend", e => {
  e.preventDefault();
  simulateKey("Space", false);
});

// DUCK
duckBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  simulateKey("ArrowDown", true);
});

duckBtn.addEventListener("touchend", e => {
  e.preventDefault();
  simulateKey("ArrowDown", false);
});

/* ===== メインループ ===== */
setInterval(() => {
  console.log("running");

// 🐕 走るアニメーション
dogAnimTimer++;

if (dogAnimTimer % 6 === 0) {   // ← 数字を小さくすると速くなる
  dogFrameIndex++;
  if (dogFrameIndex >= dogFrames.length) {
    dogFrameIndex = 0;
  }

  dog.style.backgroundImage = `url(${dogFrames[dogFrameIndex]})`;
}

  if (doubleJumpCooldown) {
  dog.style.filter = "saturate(0.4)";
} else {
  dog.style.filter = "saturate(1)";
}

  score++;
  scoreElement.innerText = "Score: " + score;
  if (score % 500 === 0) speed++;

  /* ジャンプ物理 */
  velocityY += gravity;
  let bottom = parseInt(getComputedStyle(dog).bottom);
  bottom -= velocityY;

  if (holdJump && isJumping && holdPower < maxHoldPower) {
    velocityY -= 0.6;
    holdPower++;
  }

  if (bottom <= 0) {
    bottom = 0;
    velocityY = 0;
    isJumping = false;
    jumpCount = 0;
  }

  dog.style.bottom = bottom + "px";
// 🐕 犬の画像制御（正しい版）
if (isJumping) {
  if (velocityY < 0) {
    dog.style.backgroundImage = "url(1_4.jpg)";
  } else {
    dog.style.backgroundImage = "url(4_4.jpg)";
  }
}


  /* cactus */
  cactusX -= speed;
  cactus.style.left = cactusX + "px";

  if (cactusX < -40) {
    if (Math.random() < 0.4) {
      cactusX = 800;
      cactus2X = 880;
    } else {
      cactusX = 800 + Math.random() * 400;
    }
  }

  /* cactus2 */
  if (cactus2X > -100) {
    cactus2X -= speed;
    cactus2.style.left = cactus2X + "px";
  }

  /* 通常 bird */
  if (!birdActive && Math.random() < 0.01) {
    birdActive = true;
    birdX = 800;
    bird.style.display = "block";
    bird.style.bottom = "120px";
  }

  if (birdActive) {
    birdX -= speed;
    bird.style.left = birdX + "px";
    if (birdX < -60) {
      birdActive = false;
      bird.style.display = "none";
    }
  }

  /* 高速低空 bird2 */
  if (!bird2Active && Math.random() < 0.005) {
    bird2Active = true;
    bird2X = 800;
    bird2.style.display = "block";
  }

  if (bird2Active) {
    bird2X -= speed * 1.5;
    bird2.style.left = bird2X + "px";
    if (bird2X < -60) {
      bird2Active = false;
      bird2.style.display = "none";
    }
  }

  /* 当たり判定 */
  const dogRect = dog.getBoundingClientRect();
  if (
    intersects(dogRect, cactus.getBoundingClientRect()) ||
    intersects(dogRect, cactus2.getBoundingClientRect()) ||
    (birdActive && intersects(dogRect, bird.getBoundingClientRect())) ||
    (bird2Active && bird2.style.display !== "none" && intersects(dogRect, bird2.getBoundingClientRect()))

  ) {
    gameOver();
  }

}, 20);

function intersects(a, b) {

  // 当たり判定を75%に縮小
  const shrink = 0.75;

  const aWidth = a.width * shrink;
  const aHeight = a.height * shrink;
  const bWidth = b.width * shrink;
  const bHeight = b.height * shrink;

  const aX = a.left + (a.width - aWidth) / 2;
  const aY = a.top + (a.height - aHeight) / 2;
  const bX = b.left + (b.width - bWidth) / 2;
  const bY = b.top + (b.height - bHeight) / 2;

  return (
    aX < bX + bWidth &&
    aX + aWidth > bX &&
    aY < bY + bHeight &&
    aY + aHeight > bY
  );
}

function gameOver() {
  alert("GAME OVER 🐕 Score: " + score);

  score = 0;
  speed = 6;
  velocityY = 0;
  isJumping = false;
  holdPower = 0;
  jumpCount = 0;

  cactusX = 800;
  cactus.style.left = cactusX + "px";

  cactus2X = -100;
  cactus2.style.left = cactus2X + "px";

  birdActive = false;
  bird.style.display = "none";
  birdX = -100;
  bird.style.left = birdX + "px";

  bird2Active = false;
  bird2.style.display = "none";
  bird2X = -100;
  bird2.style.left = bird2X + "px";

  dog.style.bottom = "0px";
}
function simulateKey(code, isDown) {
  if (isDown) {
    document.dispatchEvent(new KeyboardEvent("keydown", { code }));
  } else {
    document.dispatchEvent(new KeyboardEvent("keyup", { code }));
  }
}
