var canvas = document.getElementById("tetrisgame");
var c = canvas.getContext("2d");
var nextcanvas = document.getElementById("nextpiece");
var nc = nextcanvas.getContext("2d");
var savecanvas = document.getElementById("savecanvas");
var sc = savecanvas.getContext("2d");

var shapequeue = [];
var placeholder;

const shapes = [
  "box",
  "line",
  "l-left",
  "l-right",
  "bolt-left",
  "bolt-right",
  "t"
];
const colors = [
  "green",
  "lightblue",
  "yellow",
  "red",
  "orange",
  "violet",
  "magenta"
];
function Block(shape, realm) {
  this.shape = shape;
  if (this.shape == "random") {
    this.shape = shapes[Math.floor(Math.random() * shapes.length)];
  }
  this.color = colors[shapes.indexOf(this.shape)];
  this.rotation = 0;
  this.volume = [];

  if (realm == "game") {
    this.falling = true;
    this.x = 4;
    this.y = -1;
  }
  if (realm == "save") {
    this.x = 1;
    this.y = 4;
  }

  if (realm == "shownext") {
    this.x = 1;
  }

  this.move = dir => {
    if (this.x + dir >= 0 && this.x + dir <= boardsize - 1) {
      for (let i = 0; i < this.volume.length; i++) {
        if (this.volume[i][1] > -1)
          if (boardstate[this.volume[i][0] + dir][this.volume[i][1]] != 0) {
            return null;
          }
      }
      this.x += dir;
      this.setVolume();
      drawGame();
    }
  };

  this.replaceShape = () => {
    if (savedpiece != null) {
      const shapeholder = savedpiece.shape;
      savedpiece = new Block(this.shape, "save");
      this.shape = shapeholder;
    } else {
      savedpiece = new Block(this.shape, "save");
      this.shape = shapes[Math.floor(Math.random() * shapes.length)];
    }
    this.color = colors[shapes.indexOf(this.shape)];
    this.rotation = 0;
    this.falling = true;
    this.x = 4;
    this.y = -1;
  };

  this.checkFallCollision = vol => {
    for (let i = 0; i < vol.length; i++) {
      if (vol[i][1] > -1)
        if (
          boardstate[vol[i][0]][vol[i][1] + 1] != 0 ||
          vol[i][1] == gridheight - 1
        ) {
          return true;
        }
    }
  };

  this.land = () => {
    this.falling = false;
    for (let v = 0; v < this.volume.length; v++) {
      if (this.volume[v][1] < -1) {
        endGame();
      }
      boardstate[this.volume[v][0]][this.volume[v][1]] = this.color;
    }
    lineCompletion();
  };

  this.checkRotCollision = (rot, oldrot) => {
    this.rotation = rot;
    this.setVolume();
    for (let r = 0; r < this.volume.length; r++) {
      if (boardstate[this.volume[r][0]][this.volume[r][1]] != 0) {
        this.rotation = oldrot;
        this.setVolume();

        return true;
      }
    }
    this.rotation = oldrot;
    this.setVolume();
    return false;
  };

  this.updateBlock = () => {
    if (gameover == false) {
      if (this.falling == true) {
        if (this.checkFallCollision(this.volume) == true) {
          this.land();
          if (gameover == false) {
            blocks.push(new Block(shapequeue[0].shape, "game"));
            shapequeue.shift();
            shapequeue.push(new Block("random", "shownext"));
            currentblock = blocks[blocks.length - 1];
          }
        } else {
          this.y++;
        }
        this.setVolume();
      }
    }
  };

  this.render = () => {
    for (i = 0; i < this.volume.length; i++) {
      c.fillStyle = this.color;
      c.fillRect(this.volume[i][0] * u, this.volume[i][1] * u, u, u);
    }
  };

  this.renderAsNextPiece = queuepos => {
    this.x = 1;
    this.y = 5 * queuepos + 3;
    this.setVolume();
    for (i = 0; i < this.volume.length; i++) {
      nc.fillStyle = this.color;
      nc.fillRect(this.volume[i][0] * ncu, this.volume[i][1] * ncu, ncu, ncu);
    }
  };
  this.renderAsSavedPiece = () => {
    this.setVolume();
    for (i = 0; i < this.volume.length; i++) {
      sc.fillStyle = this.color;
      sc.fillRect(this.volume[i][0] * ncu, this.volume[i][1] * ncu, ncu, ncu);
    }
  };

  this.setVolume = () => {
    if (this.shape == "box") {
      this.volume = [
        [this.x, this.y],
        [this.x + 1, this.y],
        [this.x, this.y - 1],
        [this.x + 1, this.y - 1]
      ];
    } else if (this.shape == "line") {
      if (this.rotation == 0 || this.rotation == 2) {
        this.volume = [
          [this.x, this.y + 1],
          [this.x, this.y],
          [this.x, this.y - 1],
          [this.x, this.y - 2]
        ];
      } else {
        this.volume = [
          [this.x - 1, this.y],
          [this.x, this.y],
          [this.x + 1, this.y],
          [this.x + 2, this.y]
        ];
      }
    } else if (this.shape == "l-right") {
      if (this.rotation == 0) {
        this.volume = [
          [this.x, this.y],
          [this.x, this.y - 1],
          [this.x, this.y - 2],
          [this.x + 1, this.y]
        ];
      } else if (this.rotation == 1) {
        this.volume = [
          [this.x, this.y],
          [this.x, this.y - 1],
          [this.x + 1, this.y - 1],
          [this.x + 2, this.y - 1]
        ];
      } else if (this.rotation == 2) {
        this.volume = [
          [this.x, this.y - 1],
          [this.x + 1, this.y - 1],
          [this.x + 1, this.y],
          [this.x + 1, this.y + 1]
        ];
      } else if (this.rotation == 3) {
        this.volume = [
          [this.x, this.y],
          [this.x + 1, this.y],
          [this.x + 1, this.y - 1],
          [this.x - 1, this.y]
        ];
      }
    } else if (this.shape == "l-left") {
      if (this.rotation == 0) {
        this.volume = [
          [this.x, this.y],
          [this.x + 1, this.y],
          [this.x + 1, this.y - 1],
          [this.x + 1, this.y - 2]
        ];
      } else if (this.rotation == 1) {
        this.volume = [
          [this.x, this.y - 1],
          [this.x, this.y],
          [this.x + 1, this.y],
          [this.x + 2, this.y]
        ];
      } else if (this.rotation == 2) {
        this.volume = [
          [this.x, this.y - 1],
          [this.x + 1, this.y - 1],
          [this.x, this.y],
          [this.x, this.y + 1]
        ];
      } else if (this.rotation == 3) {
        this.volume = [
          [this.x + 1, this.y - 1],
          [this.x, this.y - 1],
          [this.x - 1, this.y - 1],
          [this.x + 1, this.y]
        ];
      }
    } else if (this.shape == "bolt-left") {
      if (this.rotation == 0) {
        this.volume = [
          [this.x, this.y],
          [this.x, this.y - 1],
          [this.x + 1, this.y - 1],
          [this.x + 1, this.y - 2]
        ];
      } else if (this.rotation == 1) {
        this.volume = [
          [this.x, this.y - 1],
          [this.x + 1, this.y - 1],
          [this.x + 1, this.y],
          [this.x + 2, this.y]
        ];
      } else if (this.rotation == 2) {
        this.volume = [
          [this.x + 1, this.y - 1],
          [this.x + 1, this.y],
          [this.x, this.y + 1],
          [this.x, this.y]
        ];
      } else if (this.rotation == 3) {
        this.volume = [
          [this.x, this.y],
          [this.x, this.y - 1],
          [this.x - 1, this.y - 1],
          [this.x + 1, this.y]
        ];
      }
    } else if (this.shape == "bolt-right") {
      if (this.rotation == 0) {
        this.volume = [
          [this.x + 1, this.y],
          [this.x + 1, this.y - 1],
          [this.x, this.y - 1],
          [this.x, this.y - 2]
        ];
      } else if (this.rotation == 1) {
        this.volume = [
          [this.x, this.y],
          [this.x + 1, this.y - 1],
          [this.x + 1, this.y],
          [this.x + 2, this.y - 1]
        ];
      } else if (this.rotation == 2) {
        this.volume = [
          [this.x, this.y - 1],
          [this.x + 1, this.y],
          [this.x + 1, this.y + 1],
          [this.x, this.y]
        ];
      } else if (this.rotation == 3) {
        this.volume = [
          [this.x, this.y],
          [this.x, this.y - 1],
          [this.x - 1, this.y],
          [this.x + 1, this.y - 1]
        ];
      }
    } else if (this.shape == "t") {
      if (this.rotation == 0) {
        this.volume = [
          [this.x, this.y],
          [this.x + 1, this.y],
          [this.x - 1, this.y],
          [this.x, this.y - 1]
        ];
      } else if (this.rotation == 1) {
        this.volume = [
          [this.x, this.y],
          [this.x + 1, this.y],
          [this.x, this.y + 1],
          [this.x, this.y - 1]
        ];
      } else if (this.rotation == 2) {
        this.volume = [
          [this.x, this.y],
          [this.x + 1, this.y],
          [this.x, this.y + 1],
          [this.x - 1, this.y]
        ];
      } else if (this.rotation == 3) {
        this.volume = [
          [this.x, this.y],
          [this.x, this.y - 1],
          [this.x, this.y + 1],
          [this.x - 1, this.y]
        ];
      }
    }
  };
}
document.body.addEventListener("keydown", function(e) {
  if (e.keyCode == 68) {
    currentblock.move(1);
  } else if (e.keyCode == 65) {
    currentblock.move(-1);
  } else if (e.keyCode == 69) {
    if (currentblock.rotation < 3) {
      if (
        currentblock.checkRotCollision(
          currentblock.rotation + 1,
          currentblock.rotation
        ) == false
      ) {
        currentblock.rotation++;
      }
    } else {
      if (currentblock.checkRotCollision(0, 3) == false) {
        currentblock.rotation = 0;
      }
    }
    currentblock.setVolume();
    drawGame();
  } else if (e.keyCode == 81) {
    if (currentblock.rotation > 0) {
      if (
        currentblock.checkRotCollision(
          currentblock.rotation - 1,
          currentblock.rotation
        ) == false
      ) {
        currentblock.rotation--;
      }
    } else {
      if (currentblock.checkRotCollision(3, 0) == false) {
        currentblock.rotation = 3;
      }
    }
    currentblock.setVolume();
    drawGame();
  } else if (e.keyCode == 83) {
    gamespeed = 100;
  } else if (e.keyCode == 70) {
    currentblock.replaceShape();
  }
});
document.body.addEventListener("keyup", function(e) {
  if (e.keyCode == 83) {
    gamespeed = 400;
  }
});
