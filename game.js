const game = document.getElementById("game");
const dog = document.getElementById("dog");
const duckEnergyText = document.getElementById("duckEnergyText");
const scoreElement = document.getElementById("score");

const cactus = document.getElementById("cactus");
const cactus2 = document.getElementById("cactus2");
const bird = document.getElementById("bird");
const bird2 = document.getElementById("bird2");

/* ===== 犬アニメ ===== */
const dogFrames = ["4_4.jpg","3_4.jpg","2_4.jpg","1_4.jpg","2_4.jpg","3_4.jpg"];
let frameIndex = 0;
let animTimer = 0;
dog.style.setProperty("--dog-img", "url(4_4.jpg)");

/* ===== 状態 ===== */
let speed = 6;
let score = 0;

let gravity = 1.2;
let velocityY = 0;
let isJumping = false;
let jumpCount = 0;

/* 二段ジャンプ疲労 */
let doubleJumpCooldown = false;

/* しゃがみ */
let isDucking = false;
let duckEnergy = 100;
let duckLock = false;
let duckLockTimer = 0;

/* 敵 */
let cactusX = game.clientWidth;
let cactus2X = -100;
let birdX = -100;
let birdActive = false;
let bird2X = -100;
let bird2Active = false;

/* ===== 入力 ===== */
function startJump() {
  if (duckLock) return;

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
}

function startDuck() {
  if (duckLock) return;
  if (duckEnergy === 100) {
    isDucking = true;
    dog.style.height = "40px";
  }
}

function endDuck() {
  isDucking = false;
  dog.style.height = "80px";
}

/* キーボード */
document.addEventListener("keydown", e => {
  if (e.code === "Space") startJump();
  if (e.code === "ArrowDown") startDuck();
});

document.addEventListener("keyup", e => {
  if (e.code === "ArrowDown") endDuck();
});

/* 📱 スマホ */
jumpBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  startJump();
});

duckBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  startDuck();
});

duckBtn.addEventListener("touchend", e => {
  e.preventDefault();
  endDuck();
});

/* ===== メインループ ===== */
let isGameOver = false;
setInterval(() => {
if (isGameOver) return;

  /* スコア */
score++;
scoreElement.innerText = "Score: " + score;
if (score % 500 === 0) speed++;

  /* アニメ */
  animTimer++;
  if (!isJumping && animTimer % 6 === 0) {
    frameIndex = (frameIndex + 1) % dogFrames.length;
    dog.style.setProperty("--dog-img", `url(${dogFrames[frameIndex]})`);
  }

  /* ジャンプ中画像 */
  if (isJumping) {
    dog.style.setProperty("--dog-img",
      velocityY < 0 ? "url(1_4.jpg)" : "url(4_4.jpg)"
    );
  }

  /* 物理 */
  velocityY += gravity;
  let bottom = parseInt(getComputedStyle(dog).bottom);
  bottom -= velocityY;

  if (bottom <= 0) {
    bottom = 0;
    velocityY = 0;
    isJumping = false;
    jumpCount = 0;
  }
  dog.style.bottom = bottom + "px";

  /* スタミナ */
  if (isDucking && !duckLock) {
    duckEnergy -= 0.5;
    if (duckEnergy <= 0) {
      duckEnergy = 0;
      endDuck();
      duckLock = true;
      duckLockTimer = 50;
    }
  }

  if (!isDucking && duckEnergy < 100) {
    duckEnergy += 0.5;
  }

  if (duckLock && --duckLockTimer <= 0) {
    duckLock = false;
  }

  duckEnergyText.innerText = duckLock ? "Zzz" : Math.ceil(duckEnergy);

  /* 色 */
  let filter = "saturate(1)";
  if (doubleJumpCooldown) filter = "saturate(0.4)";
  if (duckLock) filter = "grayscale(1)";
  dog.style.filter = filter;
  duckEnergyText.style.filter = filter;


  /* 🌵 */
  cactusX -= speed;
  cactus.style.left = cactusX + "px";
  if (cactusX < -40) cactusX = game.clientWidth;

  /* 🐦 */
  if (!birdActive && Math.random() < 0.01) {
    birdActive = true;
    birdX = game.clientWidth;
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
/* 🐦 低空高速鳥（bird2） */
if (!bird2Active && Math.random() < 0.006) {
  bird2Active = true;
  bird2X = game.clientWidth;
  bird2.style.display = "block";
  bird2.style.bottom = "60px"; // ← 低空（しゃがみで回避）
}
if (bird2Active) {
  bird2X -= speed * 2;   // ★ 2倍速
  bird2.style.left = bird2X + "px";

  if (bird2X < -60) {
    bird2Active = false;
    bird2.style.display = "none";
  }
}

  /* 💥 当たり判定 */
  const dogRect = dog.getBoundingClientRect();

if (!isGameOver && (
  intersects(dogRect, cactus.getBoundingClientRect()) ||
  (birdActive && intersects(dogRect, bird.getBoundingClientRect())) ||
  (bird2Active && intersects(dogRect, bird2.getBoundingClientRect()))
)) {
  isGameOver = true;
  gameOver();
}


}, 20);

/* ===== 当たり判定（75%） ===== */
function intersects(a, b) {
  const s = 0.75;

  const aw = a.width * s;
  const ah = a.height * s;
  const bw = b.width * s;
  const bh = b.height * s;

  const ax = a.left + (a.width - aw) / 2;
  const ay = a.top + (a.height - ah) / 2;
  const bx = b.left + (b.width - bw) / 2;
  const by = b.top + (b.height - bh) / 2;

  return (
    ax < bx + bw &&
    ax + aw > bx &&
    ay < by + bh &&
    ay + ah > by
  );
}

function gameOver() {
  alert("GAME OVER 🐕 Score: " + score);

  score = 0;
  scoreElement.innerText = "Score: 0";

  speed = 6;

  cactusX = game.clientWidth;
  cactus.style.left = cactusX + "px";

  birdActive = false;
  bird.style.display = "none";
  birdX = -100;

  /* ★ 高速鳥リセット（重要） */
  bird2Active = false;
  bird2.style.display = "none";
  bird2X = -100;

  velocityY = 0;
  isJumping = false;
  jumpCount = 0;

  setTimeout(() => {
  isGameOver = false;
}, 500);
}

