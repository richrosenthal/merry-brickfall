const canvas = document.getElementById("game"); //grabs our element from index.html
const ctx = canvas.getContext("2d"); //This gives you a drawing tool called a 2d rendering context

//game state variables
//game state
let lastTime = 0; //will store the timestamp of the previous frame
let running = true; //this is just a flag, later we can set it to false to pause or stop the game loop

// Update function to change game state
function update(dt){
   //dt = time since last frame in seconds
}

//Draw - render game state
function draw(){
    //clear screen
    ctx.clearRect(0,0, canvas.clientWidth, canvas.height);


//simple background placeholder
ctx.fillStyle = "0f1a33";
ctx.fillRect(0,0, canvas.clientWidth, canvas.height);

//tiny "it's alive text"
ctx.fillStyle = "white";
ctx.font = "14px monospace";
ctx.fillText("Step 1: game loop running", 12, 20);
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