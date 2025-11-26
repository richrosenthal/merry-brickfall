/****************************************************
 * Merry Brickfall - Core Game Code (Refactored)
 *
 * This file is written to be readable and teachable.
 * Every block is commented, and variable names are
 * descriptive to make the game's logic clear.
 ****************************************************/

// --------------------------------------------------
// CANVAS SETUP
// --------------------------------------------------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Used for frame rate–independent movement
let previousFrameTime = 0;

// Toggles the game loop on/off (useful later)
let gameIsRunning = true;


// --------------------------------------------------
// PADDLE (player-controlled)
// --------------------------------------------------
const paddle = {
  width: 80,
  height: 12,

  // Start centered horizontally
  x: canvas.width / 2 - 80 / 2,

  // Near the bottom of the screen
  y: canvas.height - 20,

  // Movement speed (pixels per second)
  moveSpeed: 300,

  // Current horizontal velocity
  velocityX: 0
};


// --------------------------------------------------
// BALL
// --------------------------------------------------
const ball = {
  x: canvas.width / 2,
  y: canvas.height - 40,

  radius: 6,

  // Velocity in X and Y (pixels per second)
  velocityX: 140,
  velocityY: -140
};

// Reset ball to starting position
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 40;
  ball.velocityX = 140;
  ball.velocityY = -140;
}


// --------------------------------------------------
// BRICK CONFIGURATION
// --------------------------------------------------
const brickSettings = {
  rows: 5,
  cols: 8,

  width: 48,
  height: 16,

  padding: 6,

  // Offsets so bricks do not touch screen edges
  offsetTop: 50,
  offsetLeft: 20
};

// 2D array of brick objects
let brickGrid = [];

function createBrickGrid() {
  brickGrid = [];

  for (let row = 0; row < brickSettings.rows; row++) {
    brickGrid[row] = [];

    for (let col = 0; col < brickSettings.cols; col++) {
      const brickX =
        brickSettings.offsetLeft +
        col * (brickSettings.width + brickSettings.padding);

      const brickY =
        brickSettings.offsetTop +
        row * (brickSettings.height + brickSettings.padding);

      brickGrid[row][col] = {
        x: brickX,
        y: brickY,
        alive: true
      };
    }
  }
}

createBrickGrid();


// --------------------------------------------------
// PLAYER INPUT
// --------------------------------------------------
let isLeftArrowPressed = false;
let isRightArrowPressed = false;

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") isLeftArrowPressed = true;
  if (event.key === "ArrowRight") isRightArrowPressed = true;
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") isLeftArrowPressed = false;
  if (event.key === "ArrowRight") isRightArrowPressed = false;
});


// --------------------------------------------------
// GAME UPDATE (runs every frame)
// --------------------------------------------------
function updateGame(deltaTime) {
  // -------------------------
  // 1. Paddle Movement
  // -------------------------
  paddle.velocityX = 0;

  if (isLeftArrowPressed) paddle.velocityX = -paddle.moveSpeed;
  if (isRightArrowPressed) paddle.velocityX = paddle.moveSpeed;

  // Move paddle using velocity * deltaTime
  paddle.x += paddle.velocityX * deltaTime;

  // Prevent paddle from leaving screen bounds
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) {
    paddle.x = canvas.width - paddle.width;
  }

  // -------------------------
  // 2. Ball Movement
  // -------------------------
  ball.x += ball.velocityX * deltaTime;
  ball.y += ball.velocityY * deltaTime;

  // Bounce off left/right walls
  if (ball.x - ball.radius <= 0) {
    ball.x = ball.radius;
    ball.velocityX *= -1;
  }
  if (ball.x + ball.radius >= canvas.width) {
    ball.x = canvas.width - ball.radius;
    ball.velocityX *= -1;
  }

  // Bounce off ceiling
  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.velocityY *= -1;
  }

  // -------------------------
  // 3. Ball → Paddle Collision
  // -------------------------
  const paddleTopY = paddle.y;
  const paddleLeftX = paddle.x;
  const paddleRightX = paddle.x + paddle.width;

  const ballBottomY = ball.y + ball.radius;

  const ballHitsPaddle =
    ballBottomY >= paddleTopY &&
    ballBottomY <= paddleTopY + paddle.height &&
    ball.x >= paddleLeftX &&
    ball.x <= paddleRightX &&
    ball.velocityY > 0;

  if (ballHitsPaddle) {
    ball.y = paddleTopY - ball.radius; // keep ball above paddle
    ball.velocityY *= -1; // bounce upward
  }

  // -------------------------
  // 4. Ball → Brick Collision
  // -------------------------
  for (let row = 0; row < brickSettings.rows; row++) {
    for (let col = 0; col < brickSettings.cols; col++) {
      const brick = brickGrid[row][col];
      if (!brick.alive) continue;

      // Simple bounding-box vs ball test
      const collision =
        ball.x + ball.radius > brick.x &&
        ball.x - ball.radius < brick.x + brickSettings.width &&
        ball.y + ball.radius > brick.y &&
        ball.y - ball.radius < brick.y + brickSettings.height;

      if (collision) {
        brick.alive = false;
        ball.velocityY *= -1;

        // Exit loops early (prevents multi-hit issues)
        row = brickSettings.rows;
        break;
      }
    }
  }

  // -------------------------
  // 5. Ball falls below screen
  // -------------------------
  if (ball.y - ball.radius > canvas.height) {
    resetBall();
  }
}


// --------------------------------------------------
// GAME DRAWING (runs every frame)
// --------------------------------------------------
function drawGame() {
  // Clear screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  ctx.fillStyle = "#0f1a33";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw bricks
  for (let row = 0; row < brickSettings.rows; row++) {
    for (let col = 0; col < brickSettings.cols; col++) {
      const brick = brickGrid[row][col];
      if (!brick.alive) continue;

      ctx.fillStyle = "white";
      ctx.fillRect(brick.x, brick.y, brickSettings.width, brickSettings.height);
    }
  }

  // Draw paddle
  ctx.fillStyle = "white";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  // Debug text
  ctx.font = "14px monospace";
  ctx.fillText("Merry Brickfall, 10, 20);
}


// --------------------------------------------------
// GAME LOOP (animation frame by frame)
// --------------------------------------------------
function gameLoop(currentTime) {
  if (!gameIsRunning) return;

  // Convert from milliseconds → seconds
  const deltaTime = (currentTime - previousFrameTime) / 1000;
  previousFrameTime = currentTime;

  updateGame(deltaTime);
  drawGame();

  requestAnimationFrame(gameLoop);
}

// Start the game
requestAnimationFrame(gameLoop);
