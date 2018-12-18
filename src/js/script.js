var direction;
var nextDirection;
var hero;
var heroPosition;
var speed = 20;
var size = 40;
var life = 4;
var xSquares = 1280 / 40; // Number of square on x axis
var ySquares = 800 / 40; // Number of square on y axis
var bonusInterval; // The periodic call to the addBonus function
var bonusInterval2; // The periodic call to the addBonus function
var lives;
var direction;
let badboy;
/*
class badboy {
    constructor(
 */
//calculer viewport
//window.innerWidth
//window.innerHeight
//recuperer position élément

// Entrer dans le jeu après avoir taper enter
oxo.inputs.listenKey('enter', function() {
    if (oxo.screens.getCurrentScreen() === '') {
        oxo.screens.loadScreen('game', game)
        setInterval(deplacementAleatoir, 100)
    }
})
//fonction jeu
function game() {
    lives = document.querySelector('.lives');
    displayLife(life);
    bonusInterval = setInterval(addBadboy, speed * 100);
    bonusInterval2 = setInterval(addTree, speed * 100);
    hero = document.querySelector('.hero');
    oxo.animation.moveElementWithArrowKeys(hero, speed);
    deplacementAleatoir();
    // hero = oxo.animation.getMovableElement();// move hero
    //var badboy = document.querySelector('.badboy');
    //var tree = document.querySelector('.tree');
    //if (tree && hero) {}
    // if (badboy && hero) {}

};
//fonction de fin
function end() {
    console.log('loser');
    clearInterval(bonusInterval);
    clearInterval(bonusInterval2);
}

//fonction nombre de vie
function displayLife(lifeNumber) {
    lives.innerHTML = '';
    for (var i = 0; i < lifeNumber; i++){
        lives.innerHTML += "<3"
    }
}

//fonction bot badboy
function addBadboy() {
    var bonus = oxo.elements.createElement({
        type: 'div',
        class: 'badboy',
        //obstacle: true,
        styles: {
            transform:
                'translate(' +
                oxo.utils.getRandomNumber(0, xSquares - 1) * 10 +
                'px, ' +
                oxo.utils.getRandomNumber(0, ySquares - 1) * 10 +
                'px)',
        },
    });
    oxo.elements.onCollisionWithElement(hero, bonus, function(){
        //si plus de vie alors => end
        displayLife(--life);
        if (life === 0){
            oxo.screens.loadScreen('end', end);
        }
    }, false)
}

//fonction bot arbre
function addTree() {
    var bonus = oxo.elements.createElement({
        type: 'div',
        class: 'tree',
        styles: {
            transform:
                'translate(' +
                oxo.utils.getRandomNumber(0, xSquares - 1) * 10 +
                'px, ' +
                oxo.utils.getRandomNumber(0, ySquares - 1) * 10 +
                'px)',
        },
    });
    oxo.elements.onCollisionWithElement(hero, bonus, function(){
        displayLife(++life);
    }, false)
}

//fonction déplacement aléatoire par interval
const array = ['up', 'down', 'left', 'right'];
function deplacementAleatoir() {
    var test = document.querySelectorAll('.badboy');
    console.log('coucou')
    if(test){
        for(let i = 0; i < test.length; i++){
            let randomMove = oxo.utils.getRandomNumber(0, array.length-1)
            oxo.animation.move(test[i], array[randomMove], 10); // Move 10px to the right
        }
    }
}

function setLinks() {
    document
      .querySelectorAll("li")
      .forEach(function(li) {
        li.addEventListener("click", function() {
          oxo.screens.loadScreen(this.innerHTML, function() {
            setLinks()
          })
        })
      })
  }
  
  oxo.screens.loadScreen('home', function() {
    setLinks()
  });
  
  Dans chaque page html :
  
  <ul>
      <li>home</li>
      <li>end</li>
      <li>win</li>
      <li>game</li>
    </ul>