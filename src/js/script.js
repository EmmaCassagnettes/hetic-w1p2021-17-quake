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

// Enter the game when pressing enter, if not already in it
oxo.inputs.listenKey('enter', function() {
    if (oxo.screens.getCurrentScreen() === '') {
        oxo.screens.loadScreen('game', game)
    }
})

function game() {
    var lives = document.querySelector('.lives');
    displayLife(life);
    bonusInterval = setInterval(addBadboy, speed * 10);
    bonusInterval2 = setInterval(addTree, speed * 10);
    var hero = document.querySelector('.hero');
    oxo.animation.moveElementWithArrowKeys(hero, speed);
    // hero = oxo.animation.getMovableElement();// move hero

    var badboy = document.querySelector('.badboy');
        if (badboy && hero) {
            oxo.elements.onCollisionWithElement(hero, badboy, function(){
                displayLife(--life);
                if (life === 0){
                    oxo.screens.loadScreen('end', end);
                }
            }, false)
        }
    var tree = document.querySelector('.tree');
    if (tree && hero) {
        oxo.elements.onCollisionWithElement(hero, tree, function(){
            displayLife(++life);
        }, false)
    }
    function displayLife(lifeNumber) {
        lives.innerHTML = '';
        for (var i = 0; i < lifeNumber; i++){
            lives.innerHTML += "<3"
        }
    }
};
function end() {
    console.log('loser');
}

function addBadboy() {
    var bonus = oxo.elements.createElement({
        type: 'div',
        class: 'badboy',
        styles: {
            transform:
                'translate(' +
                oxo.utils.getRandomNumber(0, xSquares - 1) * size +
                'px, ' +
                oxo.utils.getRandomNumber(0, ySquares - 1) * size +
                'px)',
        },
    });
}

function addTree() {
    var bonus = oxo.elements.createElement({
        type: 'div',
        class: 'tree',
        styles: {
            transform:
                'translate(' +
                oxo.utils.getRandomNumber(0, xSquares - 1) * size +
                'px, ' +
                oxo.utils.getRandomNumber(0, ySquares - 1) * size +
                'px)',
        },
    });
}