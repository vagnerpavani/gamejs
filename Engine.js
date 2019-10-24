const LARGURA = 600;
const ALTURA = 400;
var canvas = document.createElement("canvas");
var cntx = (canvas.getContext("2d"));
var frames = 0;

var butaoIniciar = document.getElementById("butao");


//controle do jogador//
/* 32  -> jump -> space
   97  -> left -> A
   100 -> right -> D*/

var controles = [];
controles.push(32,97,100);
canvas.style.border = "1px solid #000";
canvas.width = LARGURA;
canvas.height = ALTURA;
document.body.appendChild(canvas);


//movimentos//
addEventListener("keypress",keyHandler)

class Plataform {
    constructor(){
        this.cor = "#777777"; 
        this.positionY = 0;
        this.positionX = 0
        this.height = 0;
        this.width = 0;
    }
    drawPlataform(){
        cntx.fillStyle = this.cor
        cntx.fillRect(this.positionX,this.positionY,this.width,this.height);  
    }
}

//plataforma de chao 
ground = new Plataform;
ground.cor = "#000000";
ground.positionY = 350;
ground.width = LARGURA;
ground.height = 50;

plataformTest = new Plataform;
plataformTest.positionX = 350;
plataformTest.positionY = 300;
plataformTest.width = LARGURA;
plataformTest.height = 30;



//configuracoes do jogador//
playerHitBox = {
    altura : 60,
    largura : 40,
    positionX : 50,
    positionY : 50,
    moveSpeed : 0,
    aceleration : 0,
    verticalSpeed : 0,
    jumpForce : 15,
    jumpQtd : 0,
    gravity : 1,
    updatePlayerStatus : function(){
        //acao da gravidade
        this.verticalSpeed += this.gravity;
        this.positionY += this.verticalSpeed;
        //desacelera o player
        if(this.aceleration < 0){
            this.aceleration += 0.5;
        }else{
            this.aceleration -= 0.5;
        }
        if(this.moveSpeed == 0.5 || this.moveSpeed == -0.5){
            this.moveSpeed = 0;
        }

       //limita a velocidade
        if(this.moveSpeed >= 4){
            this.aceleration = 1;
            this.moveSpeed = 4;
        }
        if(this.moveSpeed <= -4){
            this.aceleration = 1;
            this.moveSpeed = -4;
        }
        //movendo o player
        this.positionX += this.moveSpeed;
        
        //colisao com chao//
        if(this.positionY > ground.positionY - this.altura){
            this.positionY = ground.positionY - this.altura;
            this.jumpQtd = 0;
        }
        
    },
    movePlayerLeft : function() {
        this.aceleration += 1;
        this.moveSpeed -=  this.aceleration; 
    },
    movePlayerRight : function() {
        this.aceleration += 1;
        this.moveSpeed +=  this.aceleration;
    },
    playerJump : function(){
        if(this.jumpQtd < 2){
            this.verticalSpeed = - this.jumpForce;
            this.jumpQtd++;
        }
    },
    drawPlayer : function(){
        cntx.fillStyle = "#e80e0e";
        cntx.fillRect(this.positionX,this.positionY,this.largura,this.altura);
    }    
};



//funcao que avalia a tecla apertada e chama a acao correspondente//
function keyHandler(element){
    switch(element.keyCode){
        case 32:
            playerHitBox.playerJump();
            return
        case 97:
            playerHitBox.movePlayerLeft();
            return 
            
        case 100:
            playerHitBox.movePlayerRight();
            return
    }
}
function atualiza(){
    frames++;
    playerHitBox.updatePlayerStatus();
}
function render(){
    cntx.fillStyle = "#9ad1e3";
    cntx.fillRect(0,0,LARGURA,ALTURA);
    ground.drawPlataform();
    plataformTest.drawPlataform();
    playerHitBox.drawPlayer();
}
function roda(){
    butaoIniciar.style.display = "none";
    atualiza();
    render();
    requestAnimationFrame(roda);
}