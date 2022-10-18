let cam = {
    x: 0,
    y: 0,
    width: canvas.width,    
    height: canvas.height,  
    rightInnerBoundary: function () {
        return this.x + (this.width * 0.75);
    },
    leftInnerBoundary: function () {
        return this.x + (this.width * 0.25);
    },
    topInnerBoundary: function () {
        return this.y + (this.height * 0.25);
    },
    bottomInnerBoundary: function () {
        return this.y + (this.height * 0.75);
    }
}

function updateCamera() {
    //posiciona a câmera em relação ao player
    if (player.x < cam.leftInnerBoundary()) {
        cam.x = Math.floor(player.x - (cam.width * 0.25));
    }
    if (player.y < cam.topInnerBoundary()) {
        cam.y = Math.floor(player.y - (cam.height * 0.25));
    }
    if (player.x + player.width > cam.rightInnerBoundary()) {
        cam.x = Math.floor(player.x + player.width - (cam.width * 0.75));
    }
    if (player.y + player.height > cam.bottomInnerBoundary()) {
        cam.y = Math.floor(player.y + player.height - (cam.height * 0.75));
    }
    //limitando a câmera às fronteiras do mundo
    if (cam.x < gameWorld.x) {
        cam.x = gameWorld.x;
    }
    if (cam.y < gameWorld.y) {
        cam.y = gameWorld.y;
    }
    if (cam.x + cam.width > gameWorld.x + gameWorld.width) {
        cam.x = gameWorld.x + gameWorld.width - cam.width;
    }
    if (cam.y + cam.height > gameWorld.y + gameWorld.height) {
        cam.y = gameWorld.y + gameWorld.height - cam.height;
    }
}