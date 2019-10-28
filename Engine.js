const LARGURA = 600;
const ALTURA = 400;
var canvas = document.createElement("canvas");
var cntx = (canvas.getContext("2d"));
var frames = 0;

var butaoIniciar = document.getElementById("butao");

var plataformasNaTela = [];

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

class CollisionTest {
    constructor(a,b) {
        const A = a.getPosition()
        const B = b.getPosition()

        console.log(A,B)

        // Parte inferior de B acima da parte superior de A
        // Parte superior de B acima da parte inferior de A
        const B_ABOVE_A = B.yEnd >= A.y && B.y <= A.yEnd

        // Parte superior de B abaixo da parte inferior de A
        // Parte inferior de B abaixo da parte superior de A
        const B_UNDER_A = B.y >= A.yEnd && B.yEnd <= A.y

        const verticalTest = B_ABOVE_A || B_UNDER_A

        // Mesma logica do teste vertical
        const B_BEFORE_A = B.xEnd >= A.x && B.x <= A.xEnd 
        const B_AFTER_A = B.x >= A.xEnd && B.xEnd <= A.x 

        const horizontalTest = B_BEFORE_A || B_AFTER_A

        this.isColliding = function() {
            return verticalTest && horizontalTest
        }

        this.isCollidingFrom = function () {
            return {
                above : B_ABOVE_A,
                below : B_UNDER_A ,
                left : B_BEFORE_A && B.x <= A.x,
                right : B_AFTER_A && B.xEnd <= A.xEnd
            }
        }

    }
}

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
    getPosition() {
        return {
            x : this.positionX,
            y : this.positionY,
            xEnd : this.positionX + this.width,
            yEnd : this.positionY + this.height
        }
    }
}

//plataforma de chao 
ground = new Plataform;
ground.cor = "#000000";
ground.positionY = 350;
ground.width = LARGURA;
ground.height = 50;

plataformasNaTela.push(ground);

plataformTest = new Plataform;
plataformTest.positionX = 350;
plataformTest.positionY = 250;
plataformTest.width = LARGURA;
plataformTest.height = 30;

plataformasNaTela.push(plataformTest);

//configuracoes do jogador//
playerHitBox = {
    height : 60,
    width : 40,
    positionX : 50,
    positionY : 50,
    moveSpeed : 0,
    aceleration : 0,
    verticalSpeed : 0,
    jumpForce : 10,
    jumpQtd : 0,
    gravity : 0.5,
    getPosition: function() {
        return {
            x : this.positionX,
            y : this.positionY,
            xEnd : this.positionX + this.width,
            yEnd : this.positionY + this.height
        }
    },
    updatePlayerStatus : function(){
        //acao da gravidade
        this.verticalSpeed += this.gravity;
        
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

        plataformasNaTela
            .map((platform) => new CollisionTest(platform,this)) // Gera um CollisionTest para cada plataforma
            .filter((ct) => ct.isColliding()) // Pega só os testes com colisão
        .forEach((ct) => {  // Aplica cada colisão individualmente na velocidade do player
            const from = ct.isCollidingFrom()
            console.log("c -> from", from, "vSpd", this.verticalSpeed, "mSpd", this.moveSpeed)

            if  ( from.above && this.verticalSpeed > 0 ) { 
                this.verticalSpeed = 0;
            }
            if  ( from.below && this.verticalSpeed < 0 ) { 
                // Nao alterar a velocidade se o player colidir de baixo para cima com a plataforma
            }
            if  ( from.left && this.moveSpeed < 0 ) { 
                //this.moveSpeed = this.moveSpeed * -1
            }
            if  ( from.right && this.moveSpeed > 0 ) { 
                //this.moveSpeed = this.moveSpeed * -1
            }
        })

        //movendo o player (importante que seja por ultimo para validar as colisões antes)
        this.positionY += this.verticalSpeed;
        this.positionX += this.moveSpeed;

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
        if(this.jumpQtd < 10){
            this.verticalSpeed = - this.jumpForce;
            this.jumpQtd++;
        }
    },

    drawPlayer : function(){
        cntx.fillStyle = "#e80e0e";
        cntx.fillRect(this.positionX,this.positionY,this.width,this.height);
    },
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