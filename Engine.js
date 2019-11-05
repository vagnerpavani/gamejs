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
    // B -> Player
    // A -> Platform
    constructor(a,b) {
        const A = a.getPosition()
        const B = b.getPosition()

        const Bwidth = B.xEnd - B.x
        

        //console.log(A,B)

        // Parte inferior de B acima da parte superior de A
        // Parte superior de B acima da parte inferior de A
        const B_ABOVE_A = B.yEnd >= A.y && B.y <= A.yEnd

        // Parte superior de B abaixo da parte inferior de A
        // Parte inferior de B abaixo da parte superior de A
        const B_UNDER_A = B.y >= A.yEnd && B.yEnd <= A.y

        const xTolerance = Math.ceil(Bwidth * 0.9)

        const B_INSIDE_A_HEIGHT = (B.xEnd <= (A.xEnd + xTolerance) && B.x >= (A.x - xTolerance));
        const A_INSIDE_B_HEIGHT = (A.xEnd <= B.xEnd && A.x >= B.x);

        const HORIZONTAL_ALIGN = B_INSIDE_A_HEIGHT || A_INSIDE_B_HEIGHT;

        const verticalTest = (B_ABOVE_A || B_UNDER_A) && HORIZONTAL_ALIGN;

        // Quase mesma logica do teste vertical
        const B_BEFORE_A = A.xEnd >= B.x && A.xEnd <= B.xEnd && A.x < B.x
        const B_AFTER_A = A.x <= B.xEnd && A.xEnd >= B.xEnd && A.x > B.x 

        const B_INSIDE_A_HORIZON = (B.yEnd <= A.yEnd && B.y >= A.y);
        const A_INSIDE_B_HORIZON = (A.yEnd <= B.yEnd && A.y >= B.y);
        
        const VERTICAL_ALIGN = (B_INSIDE_A_HORIZON || A_INSIDE_B_HORIZON)

        const horizontalTest = (B_BEFORE_A || B_AFTER_A) && (VERTICAL_ALIGN)

        this.isColliding = function() {
            return verticalTest || horizontalTest
        }

        const FROM_ABOVE = B_ABOVE_A && HORIZONTAL_ALIGN
        const FROM_BELOW = B_UNDER_A && HORIZONTAL_ALIGN
        const FROM_LEFT = B_BEFORE_A && VERTICAL_ALIGN
        const FROM_RIGHT = B_AFTER_A && VERTICAL_ALIGN

        this.isCollidingFrom = function () {
            return {
                above : FROM_ABOVE ,
                below : FROM_BELOW,
                left : FROM_LEFT,
                right : FROM_RIGHT 
            }
        }

        this.counterOffset = function () {
            // DO NOT USE
            return {
                above: FROM_ABOVE ? A.yEnd - B.y : 0,
                below: FROM_BELOW ? A.y - B.yEnd : 0,
                left: FROM_LEFT ? A.xEnd - B.x : 0,
                right: FROM_RIGHT ? A.x - B.xEnd : 0,
            }

        }

        this.offset = function() {
            return {
                above: FROM_ABOVE ? B.yEnd - A.y : 0,
                below: FROM_BELOW ? B.y - A.yEnd : 0,
                left: FROM_LEFT ? B.xEnd - A.x : 0,
                right: FROM_RIGHT ? B.x - A.xEnd : 0,
            }
        }

    }
}

class Plataform {
    constructor(x,y,h,w){
        this.cor = "#777777"; 
        this.positionY = y ? y : 0
        this.positionX = x ? x : 0
        this.height = h ? h : 0
        this.width = w ? w : 0
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
plataformTest.positionY = 300;
plataformTest.width = LARGURA/4;
plataformTest.height = 30;

[new Plataform(50,200,400,30), 
 new Plataform(200,200,400,30), 
 plataformTest, 
 ground]
.forEach( (x) => plataformasNaTela.push(x) )

//configuracoes do jogador//
playerHitBox = {
    color: "#e80e0e",
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


        plataformasNaTela
            .map((platform) => new CollisionTest(platform,this)) // Gera um CollisionTest para cada plataforma
            .filter((ct) => ct.isColliding()) // Pega só os testes com colisão
        .forEach((ct) => {  // Aplica cada colisão individualmente na velocidade do player
            const from = ct.isCollidingFrom()
            console.log("c -> from", from, "vSpd", this.verticalSpeed, "mSpd", this.moveSpeed, "offset", ct.offset(), ct.counterOffset())

            if  ( from.above && this.verticalSpeed > 0 ) { 
                this.verticalSpeed = 0;
                this.positionY -= ct.offset().above
                this.jumpQtd = 0;
            }
            if  ( from.below && this.verticalSpeed < 0 ) { 
                // Nao alterar a velocidade se o player colidir de baixo para cima com a plataforma
            }
            if  ( from.left && this.moveSpeed < 0 ) { 
                this.moveSpeed = this.moveSpeed * -1.6
                this.color = "#00ff00"
            }
            if  ( from.right && this.moveSpeed > 0 ) { 
                this.moveSpeed = this.moveSpeed * -1.6
                this.color = "#0000ff"
            }
        })

            //limita a velocidade
            if(this.moveSpeed >= 4){
                this.aceleration = 1;
                this.moveSpeed = 4;
            }
            if(this.moveSpeed <= -4){
                this.aceleration = 1;
                this.moveSpeed = -4;
            }

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
        if(this.jumpQtd < 2){
            this.verticalSpeed = - this.jumpForce;
            this.jumpQtd++;
        }
    },

    drawPlayer : function(){
        cntx.fillStyle = this.color
        cntx.fillRect(this.positionX,this.positionY,this.width,this.height);
    },
};


//funcao que avalia a tecla apertada e chama a acao correspondente//
function keyHandler(element){
    if (butaoIniciar.style.display != "none") {
        roda()
        return
    }
    
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
    plataformasNaTela.forEach( (x) => x.drawPlataform() )
    // ground.drawPlataform();
    // plataformTest.drawPlataform();
    playerHitBox.drawPlayer();
}

function roda(){
    butaoIniciar.style.display = "none";
    atualiza();
    render();
    requestAnimationFrame(roda);
}