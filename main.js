// to do´s
// player image with animation (idle, mvright, mvleft, jumping)
// tiles (image)
// improve door collision
    // player must be on center of the door
    // game stops, plays dqIII in/out sound and fade out/fade in to next level
// player death
// key

// global variables
let rightPressed = leftPressed = upPressed = spacePressed = false;
let gravity = 0.90;
let quitGame = false;

// game states
let game = {
    started: false,
    over: false,
    paused: false,
    active: false
};

let level = 1;
let currentMap = map1;

// game world object
let gameWorld = {
    x: 0,
    y: 0,
    width: currentMap[0].length * tileSize, 
    height: currentMap.length * tileSize   
};

// canvas setup (viewport)
let canvas = window.document.getElementById("canvas");
const ctx = canvas.getContext('2d');
canvas.width = 400 // gameWorld.width      
canvas.height = 400 // gameWorld.height // 500


///////////////////     // Generic Object
// Sprite Class //      // for background, player, doors
/////////////////

// Sprite Draw method que desenha!

class Sprite {
    constructor({ x, y, imageSrc, frameRate = 1, animations }) {
        this.x = x;
        this.y = y;
        this.loaded = false;
        this.image = new Image();
        this.image.onload = () => { 
            this.loaded = true; 
            this.width = this.image.width / this.frameRate;
            this.height = this.image.height;
        }
        this.image.src = imageSrc;
        this.frameRate = frameRate;
        this.currentFrame = 0;
        this.elapsedFrames = 0;
        this.frameBuffer = 2;
        this.animations = animations;
    
        if (this.animations) {
            for (let key in this.animations) {  // get only keys: idleRight, idleLeft..
                const image = new Image();
                image.src = this.animations[key].imageSrc
                this.animations[key].image = image
            }
        }

        console.log(this.animations)

    }
    
    draw() {
       // draw cropbox

       if (!this.loaded) return;

       const cropbox = {
            x: this.width * this.currentFrame,
            y: 0,
            width: this.width,
            height: this.height
        }

        ctx.drawImage(
            this.image, 
            cropbox.x, 
            cropbox.y,
            cropbox.width,
            cropbox.height,
            this.x,
            this.y,
            this.width/1.5,
            this.height/1.5
        )

        this.updateFrames()
    }

    updateFrames() {
        this.elapsedFrames++;

        if (this.elapsedFrames % this.frameBuffer === 0) {
            if (this.currentFrame < this.frameRate -1) this.currentFrame++; // -1 beacuse we star current frame at zero
            else this.currentFrame = 0; // max frame reached
        }
    }

}

///////////////////
// Player Class //
/////////////////

// when player is created, we pass a imageSrc
// que é passada pelo super para o construtor da classe Sprite
// que vai definir atributos da imagem


class Player extends Sprite {
    constructor ({ x, y, color, imageSrc, frameRate, animations }) { // recebe esses args
        super({ imageSrc, frameRate, animations }); // alguns args são passados para Sprite constructor
        this.x = x
        this.y = y
        this.vx = 0            
        this.vy = 0            
        this.color = color
        this.jumping = true
        this.canJumpAgain = true
    };
    drawBiggerBox() {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
        ctx.fillRect(this.x, this.y, this.width, this.height)
        ctx.restore();
    };
    drawHitBox() {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(this.hitbox.x, this.hitbox.y, 
                     this.hitbox.width, this.hitbox.height)
        ctx.restore();
    };
     
    // updateHitBox() {
    //     this.hitbox = {
    //         x: this.x + 59,
    //         y: this.y + 33,
    //         width: 48,
    //         height: 55,
    //     };
    // };

    updateHitBox() {
        this.hitbox = {
            x: this.x + 35,
            y: this.y + 22,
            width: 35,
            height: 36,
        };
    };
    
    switchSprite(name) {
        if (this.image === this.animations[name].image) return
        this.currentFrame = 0;
        this.image = this.animations[name].image;
        this.frameRate = this.animations[name].frameRate;
        this.frameBuffer = this.animations[name].frameBuffer;
    }


        
    update() {

        // Jump
        if (spacePressed && this.canJumpAgain && !this.jumping && this.vy < 2) {
            this.vy -= 2 * step;
            this.jumping = true;
            this.canJumpAgain = false;
        }
        else if (rightPressed) {
            player.switchSprite('runRight');
            this.vx += 0.02 * step;
            player.lastDirection = 'right';
        }
        else if (leftPressed) {
            player.switchSprite('runLeft');
            this.vx -= 0.02 * step;
            player.lastDirection = 'left';
        } else {
            if (player.lastDirection === 'left') player.switchSprite('idleLeft');
            else player.switchSprite('idleRight');
        }
        
        // 1) Update X axis
        this.x += this.vx   // apply velocity
        this.vx *= 0.88     // apply friction
        
        this.updateHitBox()

        // 2) Check and resolve horizontal collison
        for (let i in walls) {
            const wall = walls[i]
            if (collision(this, wall)) {
                if (this.vx > 0) { // if player moving right
                    const offset = this.hitbox.x - this.x + this.hitbox.width
                    this.x = wall.x - offset - 0.01;
                    break;
                }
                if (this.vx < 0) { // if player moving left
                    const offset = this.hitbox.x - this.x
                    this.x = wall.x + wall.width - offset + 0.01;
                    break;
                }
                
            }
        }
        
        // 3) Update Y (+gravity)
        this.y += this.vy;
        this.vy += gravity;
        this.vy *= 0.90;
        
        this.updateHitBox();
        
        // 4) Check and resolve vertical collision
        for (let i in walls) {
            const wall = walls[i]
            if (collision(this, wall)) {
                if (this.vy < 0) { // if player moving up
                    this.vy = 0;
                    const offset = this.hitbox.y - this.y;
                    this.y = wall.y + wall.height - offset + 0.01;
                    break;
                }
                if (this.vy > 0) { // if player moving down
                    this.vy = 0
                    const offset = this.hitbox.y - this.y + this.hitbox.height
                    this.y = wall.y - offset - 0.01;
                    //this.canJumpAgain = true;
                    this.jumping = false;
                    break;
                }
            }
        }

        /////////////////////////
        //collision with doors //
        /////////////////////////
        
        if (collision(player, door)) {
            level++;
            //console.log('level: ' + level);
            nextLevel(level);
        }

        this.updateHitBox();

        //canvas boundaries
        // left boundary
        if (this.hitbox.x < 0) {
            const offset = this.hitbox.x - this.x
            this.x = 0 - offset + 0.01;
            console.log('left boundary')
        }
        
        // right boundary
        if (this.hitbox.x > gameWorld.width - this.hitbox.width) { 
            const offset = this.hitbox.x - this.x + this.hitbox.width
            this.x = gameWorld.width - offset - 0.01;
        }
            // upper boundary
        if (this.hitbox.y < 0) this.hitbox.y = 0;
    }

    

    

    // draw() {
    //     ctx.save()
    //     ctx.fillStyle = this.color;
    //     ctx.fillRect(this.x, this.y, this.width, this.height);
    //     ctx.restore();
    // }
}   
 

// Creates Player
let player = new Player( {
    frameRate: 11,
    x: 50, 
    y: 200, 
    imageSrc: "img/king/idle.png", 
    animations: {  
        idleRight: {
            frameRate: 11,
            frameBuffer: 2,
            loop: true,
            imageSrc: "img/king/idle.png"
        },
        idleLeft: {
            frameRate: 11,
            frameBuffer: 2,
            loop: true,
            imageSrc: "img/king/idleLeft.png"
        },
        runRight: {
            frameRate: 8,
            frameBuffer: 4,
            loop: true,
            imageSrc: "img/king/runRight.png"
        },
        runLeft: {
            frameRate: 8,
            frameBuffer: 4,
            loop: true,
            imageSrc: "img/king/runLeft.png"
        },
    }
    
    
});
    
    
    

// Splash Screen init
function splashScreen() {
    ctx.font = "20px Georgia";
    let x = (canvas.width / 2) - 100
    let y = (canvas.height / 2)
    ctx.fillText("Just a platformer!", x+20, y);   
    ctx.fillText("Press Space Bar to Start", x, y+50);
    if (spacePressed) {
        //fillMap(currentMap)
        nextLevel(level);
        game.started = true; // runs update and draw on main loop
    }
}

function updateGameWorld() {
    gameWorld.width = currentMap[0].length * tileSize; 
    gameWorld.height = currentMap.length * tileSize; 
}

function nextLevel(level) {
   
    walls = [];
    
    if (level == 1) {
        currentMap = map1;
        gameWorld.width = currentMap[0].length * tileSize; 
        gameWorld.height = currentMap.length * tileSize; 
        fillMap(currentMap); 
        player.x = 50; 
        player.y = 500;
    }
    if (level == 2) {
        currentMap = map2;
        gameWorld.width = currentMap[0].length * tileSize; 
        gameWorld.height = currentMap.length * tileSize;  
        fillMap(currentMap);
        player.x = 50;
        player.y = 1000;
    }
    else if (level == 3) {
        console.log('map3');
        currentMap = map3;
        gameWorld.width = currentMap[0].length * tileSize; 
        gameWorld.height = currentMap.length * tileSize;  
        fillMap(currentMap);
        player.x = 50;
        player.y = 200;
    }
    else if (level >= 4) {
        console.log('back to map1')
        currentMap = map1
        gameWorld.width = currentMap[0].length * tileSize; 
        gameWorld.height = currentMap.length * tileSize;  
        fillMap(currentMap);
        player.x = 50;
        player.y = 500;
    }
}


  /////////////////
 /// game loop ///
/////////////////

let lastTime = 0; 
let deltaTime = 0; 
let accumulator = 0; 
const step = (1/60) * 1000; // static time step

function loop(timeStamp) {

    requestAnimationFrame(loop);

    if (quitGame) {return}; //if "Q" is pressed

    //ctx.clearRect(0, 0, canvas.width, canvas.height);

    //if (game.paused) {cancelAnimationFrame(loop)};

    if (!game.started) { splashScreen(); }

    else {

        let deltaTime = timeStamp - lastTime; // calcula o deltaTime do frame ~16.6
        accumulator += deltaTime; // accumulator é o accumulator de tempo, decrescido pelo step
        let updated = false; // no início de cada loop, updated é falso
        let whileCounter = 0;
        while (accumulator > step) {
            // update and collision checks
            player.update();
            updateCamera();
            whileCounter++;
            accumulator -= step;
            if(whileCounter > 3) { //  safeguard to endless while loop 
                //console.log('while counter > 5 !!!');
                accumulator = 0;
                break;
            }
            updated = true; // only draw if updated at least once
        }
        if (updated) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(-cam.x, -cam.y);
            drawMap(currentMap);
            //player.drawBiggerBox();
            //player.drawHitBox()
            player.draw();
            ctx.restore();
            
            //top bar
            ctx.save();
            ctx.fillStyle = 'grey';
            ctx.font = "bold 20px serif";
            ctx.fillText("level " + level, 10,25);
            ctx.restore();
        }
        
        lastTime = timeStamp; 
    }
}
loop(0);