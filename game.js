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


// Update function to change game state
function update(dt){

   paddle.vx = 0;
   if (leftPressed) paddle.vx = -paddle.speed;
   if (rightPressed) paddle.vx = paddle.speed;

   //2 move paddle using dt (frame-rate independent)
   paddle.x += paddle.vx * dt;

   //3 Clamp paddle to screen
   if (paddle.x < 0) paddle.x = 0;
   if (paddle.x + paddle.w > canvas.width){
     paddle.x = canvas.width - paddle.w;
   } 
}

//Draw - render game state
function draw(){
    //clear screen
    ctx.clearRect(0,0, canvas.width, canvas.height);
    
    //simple background placeholder
    ctx.fillStyle = "#0f1a33";
    ctx.fillRect(0,0, canvas.width, canvas.height);

    // paddle
    ctx.fillStyle = "white";
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

    //debug text
    ctx.font = "14px monospace";
    ctx.fillText("Step 2 move paddle ← →", 12, 20);
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