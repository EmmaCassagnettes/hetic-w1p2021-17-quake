//Var main elements
let tilemap;
let hero;
let livesEl;
let badboys = [];

//-----OBJECTS-----//

//TILEMAP CLASS//
class TileMap {
  constructor() {
    this.grid = new Array(); //create an array (of arrays) to interact with
    for (let row = 0; row < 38; row++) {
      //create the map
      let line = new Array();
      for (let col = 0; col < 18; col++) {
        var tile = oxo.elements.createElement({
          type: "div",
          class: "tile",
          styles: {
            height: "40px",
            width: "40px",
            top: col * 40 + "px",
            left: row * 40 + "px"
          },
          appendTo: ".map"
        });
        line.push(tile);
      }
      this.grid.push(line);
    }
  }

  // method to get a tile (after burnTile or resetTile)
  getTile(x, y) {
    let valx = Math.round(x / 40);
    let valy = Math.round(y / 40);

    let line = this.grid[valx]; //line is the x axe

    if (line == null) {
      //security in case of outofindex
      return null;
    } else {
      return line[valy];
    }
  }
  //tile--burned
  burnTile(x, y) {
    let tile = this.getTile(x, y);

    if (tile) {
      //!null and !undefined (security)
      if (!tile.classList.contains("tile--burned")) {
        tile.classList.add("tile--burned");
      }
    }
  }
  //reset tile
  resetTile(x, y) {
    let tile = this.getTile(x, y);
    if (tile) {
      tile.classList.remove("tile--burned");
    }
  }
}

//HERO CLASS//
class Hero {
  constructor() {
    this.lives = 3;
    this.oxoElement = oxo.elements.createElement({
      type: "div",
      class: "hero",
      appendTo: ".contain"
    });

    oxo.animation.moveElementWithArrowKeys(this.oxoElement, 20);

    //method to target and shoot
    document.querySelector(".contain").addEventListener("click", event => {
      //fat arrow to stay in the correct scope

      event.preventDefault(); //security to remove the click behaviour (select, etc.)
      let oxo_position = oxo.animation.getPosition(this.oxoElement);

      //choose in case of diagonal
      let distanceX = Math.abs(oxo_position.x - event.clientX); //event.clientX return the cursor position (on X)
      let distanceY = Math.abs(oxo_position.y - event.clientY); //event.clientY return the cursor position (on Y)

      if (distanceX > distanceY) {
        //decide between left and right
        if (oxo_position.x < event.clientX) {
          new Bullet(oxo_position.x, oxo_position.y, "right", false);
        } else {
          new Bullet(oxo_position.x, oxo_position.y, "left", false);
        }
      } else {
        if (oxo_position.y < event.clientY) {
          new Bullet(oxo_position.x, oxo_position.y, "down", false);
        } else {
          new Bullet(oxo_position.x, oxo_position.y, "up", false);
        }
      }
    });
  }
}

//BADBOY CLASS//
class BadBoy {
  constructor() {
    this.oxoElement = oxo.elements.createElement({
      type: "div",
      class: "badboy",
      styles: {
        transform:
          "translate(" +
          oxo.utils.getRandomNumber(0, window.innerWidth) +
          "px, " +
          oxo.utils.getRandomNumber(0, window.innerHeight) +
          "px)"
      },
      appendTo: ".contain"
    });

    badboys.push(this);
    console.log(badboys);

    //Movement//

    //initialize the direction, then randomize
    this.direction = "none";
    this.changeDirection();

    //move every 100ms
    this.moveInterval = setInterval(() => {
      this.move();
    }, 100);

    //change the direction every 2000ms
    this.changeDirectionInterval = setInterval(() => {
      this.changeDirection();
    }, 2000);

    this.shootInterval = setInterval(() => {
      this.shoot();
    }, 4000);

    //cause damage when colliding with hero
    oxo.elements.onCollisionWithElement(
      hero.oxoElement,
      this.oxoElement,
      function() {
        displayLife(--hero.lives);
        if (hero.lives === 0) {
          oxo.screens.loadScreen("end", death);
        }
      }
    );
  }

  //Move the enemy
  move() {
    if (this.direction != "none") { //security
      oxo.animation.move(this.oxoElement, this.direction, 5); // Move 5px
    }
  }

  // Change the direction
  changeDirection() {
    const array = ["up", "down", "left", "right"];
    this.direction = array[oxo.utils.getRandomNumber(0, array.length - 1)];
  }

  // shoot randomly
  shoot() {
    let oxo_position = oxo.animation.getPosition(this.oxoElement); //initial position
    const array = ["up", "down", "left", "right"];
    let dir = array[oxo.utils.getRandomNumber(0, array.length - 1)];
    new Bullet(oxo_position.x, oxo_position.y, dir, true);
  }
}

//BULLET CLASS - FIREBALL OR WATERBALL//
class Bullet {
  constructor(posx, posy, direction, isFire) {
    this.oxoElement = oxo.elements.createElement({
      type: "div",
      class: isFire ? "fireball" : "waterball",
      styles: {
        transform: "translate(" + posx + "px, " + posy + "px)"
      },
      appendTo: ".contain"
    });

    this.direction = direction;
    this.isFire = isFire;

    //Target of the bullet
    //Hero is touched
    if (isFire) {
      oxo.elements.onCollisionWithElement(
        this.oxoElement,
        hero.oxoElement,
        function() {
          displayLife(--hero.lives);
          if (hero.lives === 0) {
            oxo.screens.loadScreen("end", death);
          }
        }
      );
      //Badboy is dead
    } else {
      badboys.forEach(badboy => {
        oxo.elements.onCollisionWithElement(
          this.oxoElement,
          badboy.oxoElement,
          function() {
            oxo.player.addToScore(100);
            console.log("Game Over");
            badboy.oxoElement.remove();
            clearInterval(badboy.moveInterval); //do not forget to clear all intervals when destroying an object
            clearInterval(badboy.changeDirectionInterval);
            clearInterval(badboy.shootInterval);
            badboy.oxoElement.remove(); //remove from HTML
            destroyObj(this); //set it to null (end of code)
          }
        );
      });
    }

    // Prevent infinite travel distance
    this.traveldistance = 0;

    this.moveInterval = setInterval(() => {this.move();}, 50, true); //50ms
  }

  move() {
    // "movement" of the bullet
    this.traveldistance += 10;
    oxo.animation.move(this.oxoElement, this.direction, 10); //10px

    let oxo_position = oxo.animation.getPosition(this.oxoElement);

    if (this.isFire) tilemap.burnTile(oxo_position.x, oxo_position.y);//interaction with the map
    else tilemap.resetTile(oxo_position.x, oxo_position.y);

    if (this.traveldistance > 500) { //max distance is 500 px
      this.killBullet();
    }
  }

  killBullet() {
    clearInterval(this.moveInterval);
    this.oxoElement.remove();
    destroyObj(this);
  }
}

//-----FONCTIONS-----//

// Start the game when pressing enter
oxo.inputs.listenKey("enter", function() {
  if (oxo.screens.getCurrentScreen() === "") {
    oxo.screens.loadScreen("game", startGame);
  }
});

//Game init
function startGame() {
  tilemap = new TileMap();
  hero = new Hero();
  oxo.player.setScore(0);

  setInterval(function() {
    new BadBoy();
  }, 5000); //a wild badboy appears every 5s

  livesEl = document.querySelector(".lives");
  displayLife(hero.lives);

  //go back to menu
  document.querySelector(".menuBtn").addEventListener("click", function() {
    oxo.screens.loadScreen("home", function() {
      setLinks();
    });
  });

  document.querySelector(".endBtn").addEventListener("click", function() {// A SUPPRIMER
    oxo.screens.loadScreen("end", function() {
      setLinks();
    });
  });
}

//life counter
function displayLife(lifeNumber) {
  livesEl.innerHTML = "";
  for (var i = 0; i < lifeNumber; i++) {
    livesEl.innerHTML += '<div class="heart" />';
  }
}

function setLinks() {

}

//lose when the map is burned
var countTiliBurned = 0;

setInterval(function() {
  countTiliBurned = document.querySelectorAll(".tile--burned").length;
  console.log(countTiliBurned);
  if (countTiliBurned > 138) {//20% of the map
    death();
  }
}, 5000);

function death() {
  oxo.screens.loadScreen("end", function() {
  });
  oxo.player.getScore();
  clearInterval(BadBoy.moveInterval);
  clearInterval(BadBoy.changeDirectionInterval);
  clearInterval(BadBoy.shootInterval);
  BadBoy.oxoElement.remove();
  destroyObj(BadBoy);
}

// Music homepage
document.getElementById('element_lecture').onclick = function() {
  document.getElementById('musicHome').setAttribute('autoplay', 'true');
}

//SET objects to null
function destroyObj(obj) {
  obj = null;
}