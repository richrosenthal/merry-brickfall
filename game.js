const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

//game state variables
//game state
let lastTime = 0; //will store the timestamp of the previous frame
let running = true; //this is just a flag, later we can set it to false to pause or stop the game loop

//Paddle object
const paddle = {
    w: 80,
    h: 12,
    x: canvas.width / 2 - 80 / 2, // centered horizontally
    y: canvas.height -20, //near bottom
    speed: 300, //pixels per second
    vx: 0 // current horizontal velocity
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 40,
    r: 6,
    vx: 140,
    vy: -140
};

// Bricks config
const brickConfig = {
  rows: 5,
  cols: 8,
  w: 48,
  h: 16,
  padding: 6,
  offsetTop: 50,
  offsetLeft: 20
};

// 2D array of bricks
let bricks = [];

function initBricks() {
  bricks = [];
  for (let row = 0; row < brickConfig.rows; row++) {
    bricks[row] = [];
    for (let col = 0; col < brickConfig.cols; col++) {
      const x = brickConfig.offsetLeft + col * (brickConfig.w + brickConfig.padding);
      const y = brickConfig.offsetTop + row * (brickConfig.h + brickConfig.padding);
      bricks[row][col] = { x, y, alive: true };
    }
  }
}

initBricks();

//input flags
let leftPressed = false;
let rightPressed = false;

//Input listeners
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") leftPressed = true;
    if (e.key === "ArrowRight") rightPressed = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") leftPressed = false;
    if (e.key === "ArrowRight") rightPressed = false;
});

// --------------------
// HELPERS
// --------------------
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 40;
  ball.vx = 140;
  ball.vy = -140;
}

// --------------------
// UPDATE
// --------------------
function update(dt) {
  // Paddle movement
  paddle.vx = 0;
  if (leftPressed) paddle.vx = -paddle.speed;
  if (rightPressed) paddle.vx = paddle.speed;

  paddle.x += paddle.vx * dt;

  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.w > canvas.width) {
    paddle.x = canvas.width - paddle.w;
  }

  // ----------------
  // Ball movement
  // ----------------
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Wall bounce (left/right)
  if (ball.x - ball.r <= 0) {
    ball.x = ball.r;
    ball.vx *= -1;
  }
  if (ball.x + ball.r >= canvas.width) {
    ball.x = canvas.width - ball.r;
    ball.vx *= -1;
  }

  // Ceiling bounce
  if (ball.y - ball.r <= 0) {
    ball.y = ball.r;
    ball.vy *= -1;
  }

  // Paddle bounce
  const paddleTop = paddle.y;
  const paddleLeft = paddle.x;
  const paddleRight = paddle.x + paddle.w;

  if (
    ball.y + ball.r >= paddleTop &&
    ball.y + ball.r <= paddleTop + paddle.h &&
    ball.x >= paddleLeft &&
    ball.x <= paddleRight &&
    ball.vy > 0
  ) {
    ball.y = paddleTop - ball.r; // prevent sticking
    ball.vy *= -1;
  }
    // Brick collisions
  for (let row = 0; row < brickConfig.rows; row++) {
    for (let col = 0; col < brickConfig.cols; col++) {
      const brick = bricks[row][col];
      if (!brick.alive) continue;

      const bx = brick.x;
      const by = brick.y;
      const bw = brickConfig.w;
      const bh = brickConfig.h;

      // simple AABB vs circle check
      if (
        ball.x + ball.r > bx &&
        ball.x - ball.r < bx + bw &&
        ball.y + ball.r > by &&
        ball.y - ball.r < by + bh
      ) {
        brick.alive = false;
        ball.vy *= -1; // bounce vertically
        // simple exit so we don't hit multiple bricks at once
        row = brickConfig.rows;
        break;
      }
    }
  }

  // Fall below screen (temporary reset)
  if (ball.y - ball.r > canvas.height) {
    resetBall();
  }
}


//Draw - render game state
function draw(){
    //clear screen
    ctx.clearRect(0,0, canvas.width, canvas.height);
    
    //simple background placeholder
    ctx.fillStyle = "#0f1a33";
    ctx.fillRect(0,0, canvas.width, canvas.height);

      // bricks
  for (let row = 0; row < brickConfig.rows; row++) {
    for (let col = 0; col < brickConfig.cols; col++) {
      const brick = bricks[row][col];
      if (!brick.alive) continue;

      ctx.fillStyle = "white";
      ctx.fillRect(brick.x, brick.y, brickConfig.w, brickConfig.h);
    }
  }

    // paddle
    ctx.fillStyle = "white";
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

    // ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();

    //debug text
    ctx.font = "14px monospace";
    ctx.fillText("Step 3 ball + paddle bounce", 12, 20);
}

// Game Loop
function loop(timestamp){
    if (!running) return;

    const dt = (timestamp - lastTime)/ 1000; //ms to seconds
    lastTime = timestamp;

    update(dt);
    draw();

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);