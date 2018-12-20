import { create } from "domain";

//Var main elements
let tilemap;
let hero;
let livesEl;
let badboys = [];



//-----OBJECTS-----//

//Classe TileMap
class TileMap {
    constructor() {
        this.grid = new Array(); //create an array (of arrays) to interact with
        for(let row = 0; row < 38; row++) {//create the map
            let line = new Array();
            for(let col = 0; col < 18; col++) {
                var tile = oxo.elements.createElement({
                    type: 'div',
                    class: 'tile',
                    styles: {
                        height: '40px',
                        width: '40px',
                        top: col * 40 + 'px',
                        left: row * 40 + 'px'
                    },
                    appendTo: '.map'
                });
                line.push(tile);
            }
            this.grid.push(line);
        }


    }

    // méthode pour pouvoir accéder à une tile (après être passé par burnTile ou resetTile)
    getTile(x, y){
        let valx = Math.round(x/40);
        let valy = Math.round(y/40);

        let line = this.grid[valx]; //line désigne l'axe x concerné

        if(line == null) { //sécurité en cas de outofindex
            return null;
        } else {
            return line[valy];
        }
    }
    //tile--burned
    burnTile(x, y) {
        let tile = this.getTile(x, y);

        if(tile){ //!null et !undefined (sécurité)
            if(!tile.classList.contains("tile--burned")) {
                tile.classList.add("tile--burned");
            }
        }
    }
    //reset tile--burned
    resetTile(x, y) {
        let tile = this.getTile(x, y);
        if(tile){
            tile.classList.remove("tile--burned");
        }
    }
}

class Hero{
    constructor(){
        this.lives = 3;
        this.oxoElement = oxo.elements.createElement({
            type: 'div',
            class: 'hero',
            appendTo: '.contain'
        });

        oxo.animation.moveElementWithArrowKeys(this.oxoElement, 20);
        
        //---méthode viser pour tirer---//
        document.querySelector(".contain").addEventListener("click", (event) => { //fat arrow pour ne pas changeer de scope

            //previens le comportement de base du click (selection etc... sécurité)
            event.preventDefault();
            let oxo_position = oxo.animation.getPosition(this.oxoElement);

            //choisir en cas de diagonale
            let distanceX = Math.abs(oxo_position.x - event.clientX);//event.clientX retourne la position de la souris sur l'axe X (pareil pour Y)
            let distanceY = Math.abs(oxo_position.y - event.clientY);

            if(distanceX > distanceY){
                if(oxo_position.x < event.clientX){ //décicder entre la gauche et la droite
                    new Bullet(oxo_position.x,oxo_position.y,"right",false);
                }else{
                    new Bullet(oxo_position.x,oxo_position.y,"left",false);
                }
            }else{
                if(oxo_position.y < event.clientY){
                    new Bullet(oxo_position.x,oxo_position.y,"down",false);
                }else{
                    new Bullet(oxo_position.x,oxo_position.y,"up",false);
                }
            }

        });
    }

    //à utliser pour les collisions
    takeDamage(amount){
        this.lives -= amount;
        if (this.lives <= 0) {
            this.death();
        }
    }
}

class BadBoy{
    constructor(){
        this.oxoElement = oxo.elements.createElement({
            type: 'div',
            class: 'badboy',
            styles: {
                transform://TODO faire spawner sur les côtés plutôt que partout (/!\ mais appliquer cette fonction sur les bonus)
                    'translate(' +
                    oxo.utils.getRandomNumber(0, window.innerWidth) +
                    'px, ' +
                    oxo.utils.getRandomNumber(0, window.innerHeight) +
                    'px)',
            },
            appendTo: '.contain'
        });

        badboys.push(this);
        console.log(badboys);

        //Movement

        //initialise direction de depart puis randomise
        this.direction = "none";
        this.changeDirection();

        //se deplace toute les 100ms
        this.moveInterval = setInterval( () =>{ this.move() },100);

        //change de direction toute les 4000ms
        this.changeDirectionInterval = setInterval( () => { this.changeDirection() },2000);

        this.shootInterval = setInterval(()=>{ this.shoot() },4000);

        //Perd une vie par collision avec un badboy
        oxo.elements.onCollisionWithElement(hero.oxoElement, this.oxoElement, function() {
            displayLife(--hero.lives);
            if (hero.lives === 0){
                oxo.screens.loadScreen('end', death);
            }

        });
    }

    //Move the enemy
    move(){
        if(this.direction != "none"){ //au cas où
            oxo.animation.move(this.oxoElement, this.direction, 5); // Move 5px
        }
    }

    // Change the direction
    changeDirection(){
        const array = ['up', 'down', 'left', 'right'];
        this.direction = array[oxo.utils.getRandomNumber(0, array.length-1)];
    }

    shoot(){
        let oxo_position = oxo.animation.getPosition(this.oxoElement); //position initiale
        const array = ['up', 'down', 'left', 'right'];
        let dir = array[oxo.utils.getRandomNumber(0, array.length-1)];
        new Bullet(oxo_position.x,oxo_position.y,dir,true);
    }


}

// Balle d'eau ou de feu
class Bullet{
    constructor(posx,posy,direction,isFire){

        this.oxoElement = oxo.elements.createElement({
            type: 'div',
            class: isFire ? "fireball" : "waterball",
            styles: {
                transform:
                    'translate(' +
                        posx +
                    'px, ' +
                        posy +
                    'px)',
            },
            appendTo: '.contain'
        });
        
        this.direction = direction;
        this.isFire = isFire;

        //Target of the bullet
        //Hero is touched
        if (isFire) {
            oxo.elements.onCollisionWithElement(this.oxoElement, hero.oxoElement, function() {
                displayLife(--hero.lives);
                if (hero.lives === 0){
                    oxo.screens.loadScreen('end', death);
                }
            }) ;
        //Badboy is dead
        } else {
            //
            badboys.forEach(badboy => {
                oxo.elements.onCollisionWithElement(this.oxoElement, badboy.oxoElement, function() {
                    console.log("Game Over");
                    badboy.oxoElement.remove();
                    clearInterval(badboy.moveInterval); //il ne faut pas oublier de clear tous les interval quand on détruit un objet !! (ex. pour les bonus)
                    clearInterval(badboy.changeDirectionInterval);
                    clearInterval(badboy.shootInterval);
                    badboy.oxoElement.remove();//supprimer du HTML
                    destroyObj(this);//set this à null (cf fin du code)
                }) ;
            });
        }

        // distance parcourue
        this.traveldistance = 0;

        this.moveInterval = setInterval(()=>{this.move()},50,true);//50ms

        oxo.elements.onLeaveScreenOnce(this.oxoElement, function() {
            console.log("sorti d'écran");
        });
    };

    move(){// "déplacement" de la balle
        this.traveldistance += 10;
        oxo.animation.move(this.oxoElement, this.direction, 10);//10px

        let oxo_position = oxo.animation.getPosition(this.oxoElement);

        if(this.isFire)
            tilemap.burnTile(oxo_position.x,oxo_position.y);
        else
            tilemap.resetTile(oxo_position.x,oxo_position.y);

        if(this.traveldistance > 500){//distance maximum à parcourir 500px
            this.killBullet();
        }
    }

    killBullet(){
        clearInterval(this.moveInterval);
        this.oxoElement.remove();
        destroyObj(this);
    }
}

//-----FONCTIONS-----//

// Entrer dans le jeu après avoir tapé enter
oxo.inputs.listenKey('enter', function() {
    if (oxo.screens.getCurrentScreen() === '') {
        oxo.screens.loadScreen('game', startGame)
    }
})

//Game init
function startGame() {
    tilemap = new TileMap();
    hero = new Hero();


    setInterval(function(){new BadBoy()},5000);//un badboy sauvage apparaît toutes les 5sec

    livesEl = document.querySelector('.lives');
    displayLife(hero.lives);

    document.querySelector(".menuBtn").addEventListener("click", function() {
        oxo.screens.loadScreen('home', function() {
            setLinks()
        })
    })

    //TEMPORAIRE -> A SUPPRIMER
    document.querySelector(".endBtn").addEventListener("click", function() {
        oxo.screens.loadScreen('end', function() {
            setLinks()
        })
    })
};

//fonction nombre de vie
function displayLife(lifeNumber) {
    livesEl.innerHTML = '';
    for (var i = 0; i < lifeNumber; i++){
        livesEl.innerHTML += "<3"//TODO à modifier (sprites)
    }
}


function setLinks() {
    document.querySelector(".home__instruction").addEventListener("click", function() {
        oxo.screens.loadScreen('game', function() {
            setLinks()
        })
    })
}

function death (){
    console.log("Game Over");
    oxo.screens.loadScreen('end', end);
    clearInterval(this.moveInterval); //il ne faut pas oublier de clear tous les interval quand on détruit un objet !! (ex. pour les bonus)
    clearInterval(this.changeDirectionInterval);
    clearInterval(this.shootInterval);
    this.oxoElement.remove();//supprimer du HTML
    destroyObj(this);//set this à null (cf fin du code)
}

//SET objects to null
function destroyObj(obj){
    obj = null;
}

//diviseur pour %tile--burned
var countTiliBurned = 0;

setInterval(function(){
    countTiliBurned = document.querySelectorAll('.tile--burned').length;
    console.log(countTiliBurned)
    if(countTiliBurned > 138){
        console.log('end game');
        death();
    }
},5000);

// Music homepage
element_lecture.onclick=function(){
    musicHome.play();
};
