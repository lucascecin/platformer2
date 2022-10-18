// collision function
function collision(first, second){
    return !(first.hitbox.x > second.x + second.width ||   
             first.hitbox.x + first.hitbox.width < second.x  ||   
             first.hitbox.y > second.y + second.height||  
             first.hitbox.y + first.hitbox.height < second.y)    
}

// event listeners e keyboard handlers
document.addEventListener("keydown", keydownHandler);
document.addEventListener("keyup", keyupHandler);

function keydownHandler(e){
    var key = e.key;
    switch(key){
        case " ":
            spacePressed = true;
            break;
        case "ArrowLeft":
            leftPressed = true;
            break;
        case "ArrowRight":
            rightPressed = true;
            break;
        case "q":
            quitGame = true;
            break;
    }
}

function keyupHandler(e){
    var key = e.key;
    switch(key){
        case " ":
            spacePressed = false;
            player.canJumpAgain = true;
            break;
        case "ArrowLeft":
            leftPressed = false;
            break;
        case "ArrowRight":
            rightPressed = false;
            break;
    }
}