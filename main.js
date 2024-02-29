import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs"

// initialize context
kaboom({
  width: 700,
  height: 400,
  canvas: document.getElementById("canvas"),
  font: "Arial",
});

let score = 0;
let scoreSpeed = 0.5;
let jumpForce = 900;

let highscore = parseInt(localStorage.highscore);
if(isNaN(highscore)){
  localStorage.setItem("highscore", "0");
  highscore = parseInt(localStorage.highscore);
};
console.log("Current High Score: " + highscore);
// rgb constants
const black = rgb(0,0,0);
const white = rgb(255,255,255);
const gray = rgb(128,128,128,);

// Sprites
loadSprite("player", "sprites/player.png");
loadSprite("speaker1", "sprites/speaker1.png");
loadSprite("speaker2", "sprites/speaker2.png");
loadSprite("background", "sprites/event.png")
loadSprite("mic", "sprites/mic.png")
loadSprite("mag", "sprites/mag.png")

/*---------------------GAME scene-------------------*/

scene("game", () => {
  
  setGravity(2000);

  // The background image
  const background = add([
    sprite("background"),
    pos(width() / 2, height() / 2),
    anchor("center"),
    scale(0.7),
    fixed(),
    "background",
  ]);

  //A rectanlge that blends in with the floor but sits behind the player
  const floorShadow = add([
    rect(width(), 48),
    pos(0, height()-30),
    color(gray),
    area(),
  ]);

  //Displays text of the players current score
  const scoreLabel = add([
    text(score.toString()),
    pos(500, 100),
    color(white),
  ]);

  //Displays text that signals if the player got a power-up (magazine)
  const bonusTag = add([
    text("*"),
    pos(500, 100),
    anchor("topright"),
    color(rgb(255,0,0,)),
    scale(0),
    "bonus",

  ]);

  //User controlled sprite (can only jump)
  const player = add([
    sprite("player"),
    pos(40, 350),
    anchor("botleft"),
    area(),
    body(),
    scale(0.2, 0.3),
    "player",
  ]);

  //Gray floor rectanlge that stops the player from falling into the abyss
  const floor = add([
    rect(width(), 48),
    pos(0, height()-10),
    area(),
    body({ isStatic: true }),
    color(gray),

  ]);

  //Decorative Object to simulate launching the projectiles
  const speaker = add([
    area(),
    pos(width() * .85, height()-10),
    anchor("botleft"),
    sprite("speaker2"),
    scale(0.4),
    "speaker",
  ]);
  
  //Call to spawn a mic projectile that starts at the right of the screen and travels left. Game ends on impact with the player
  function launchMic() {
    const mic = add([
      sprite("mic"),
      area(),
      scale(0.2),
      pos(width()-50, height() - 48),
      anchor("center"),
      color(rand(0, 255), rand(0, 255), rand(0, 255)),
      rotate(0),
      move(LEFT, rand(300, 450)),
      offscreen({ destroy: true }),
      "mic",
    ]);
    addKaboom(mic.pos);
    shake();

    wait(rand(1.2, 2.3), launchMic);
    loop(0.01, () => {
      mic.angle -= 3;
    });
  }

  //Call to spawn a magazine projectile that starts at the right of the screen and travels left. Sits above the microphone.
  function launchMag() {
    const mag = add([
      sprite("mag"),
      area(),
      scale(0.2),
      pos(width()-50, height() - 180),
      anchor("center"),
      rotate(0),
      move(LEFT, rand(200, 250)),
      offscreen({ destroy: true }),
      "mag",
    ]);

    wait(rand(5, 15), launchMag);
    loop(0.01, () => {
      mag.angle+=1;
    });
  }

//Events

//If the player hits the mic the game ends (go to lose screen) Also saves highscore to localStorage
onCollide("player", "mic", () => {
  if(score > highscore){
    localStorage.highscore = score.toString();
    highscore = parseInt(localStorage.highscore);
  }
  console.log("Current High Score: " + highscore);
  go("lose");
});

//If the player jumps into the mag, score grows by an increased amount for a short duration
player.onCollide("mag", (mag) => {
  destroy(mag);
  bonusTag.scale = vec2(1,1);
  scoreSpeed = 0.05;
  wait(3, ()=>{
    scoreSpeed = 0.5;
    bonusTag.scale = vec2(0, 0);
  })
});

//Rate at which the score increases by 1 for each second of "scoreSpeed" Function calls itself so it continues the entire scene
function scoreInc() {
    wait(scoreSpeed, () => {
      score++;
      scoreLabel.text = score.toString();
      scoreInc();
    });
  };
scoreInc()

//Player Movement
  
onKeyDown("space", () => {
  if(player.isGrounded()) {
    player.jump(jumpForce); 
  }
});

onClick(()=> {
  if(player.isGrounded()) {
    player.jump(jumpForce); 
  }
});

onTouchStart(() => {
  if(player.isGrounded()) {
    player.jump(jumpForce); 
  }
});

//Starts the functions that continually launch the objects
launchMic();
wait(2, launchMag);


}); // End of Game Scene


/*---------------------"lose" scene-------------------*/
scene("lose", ()=>{

  // counter used to stop player from spamming space to start a round
  let t = 0;
  wait(0.5, () => {
    t = 1;
  });
  const background1 = add([
    sprite("background"),
    pos(width() / 2, height() / 2),
    anchor("center"),
    scale(0.7),
    fixed(),
    "background1",
  ]);

  //Box background for play again button
  const titleBtn = add([
    rect(300, 100),
    pos(width() / 2, height() / 2),
    anchor("center"),
    area(),
    color(gray),
    "titleBtn",
    outline(4, white),
  ]);

  //Text of play again button
  const playBtn = add([
    text("PLAY AGAIN"),
    pos(width() / 2, height() / 2),
    anchor("center"),
    area(),
    color(white),
    "title",
  ])

  //Tells the player their score for last attempt
  const scoreTitle = add([
    text("SCORE = " + score),
    pos(width() / 2, (height() / 2)+100),
    anchor("center"),
    area(),
    color(white),
    "scoreTitle",
  ]);

  const highscoreTitle = add([
    text("HIGH SCORE = " + highscore),
    pos(width() / 2, (height() / 2)+140),
    anchor("center"),
    area(),
    color(white),
    "scoreTitle",
  ]);

  //Changes play again button color on hover
  onHover("titleBtn", () => {
    titleBtn.color = rgb(10, 10, 10);
  });
  onHoverEnd("titleBtn", () => {
    titleBtn.color = gray;
  });

  //resets score and starts game when play again button is pressed
  onClick("titleBtn", () => {
    score = 0;
    go("game");
  });

  onTouchStart(() => {
    score = 0;
    go("game");
  })

  onKeyDown("space", () => {
    if(t>0){
    score = 0;
    go("game");
    };
  });
  
}); // End of Lose Scene

go("game");
