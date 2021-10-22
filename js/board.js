var canvas = document.getElementById("tetrisgame");
canvas.height = 600;
canvas.width = 400;

var c = canvas.getContext("2d");
var nextcanvas = document.getElementById("nextpiece");
var nc = nextcanvas.getContext("2d");
var nch = nextcanvas.height;
var ncw = nextcanvas.width;
var ncu = ncw / 4;

const h = canvas.height;
const w = canvas.width;
var boardsize = 10;
const u = w / boardsize;
const gridheight = h / u;
var gameover = false;
var blocks = [];
var gamespeed = 400;
var boardstate = [];
var gameover = false;
var score = 0;
var savedpiece;

function endGame() {
  gameover = true;
  c.fillStyle = "black";
  c.fillRect(0, 0, w, h);
  c.fillStyle = "black";
  c.fillRect(0, 0, w, h);

  c.fillStyle = "red";
  c.font = "40px Arial";
  c.fillText("Game Over", u * 2.5, u * 6);

  c.fillText("Score: " + JSON.stringify(score), u * 2.8, u * 8);
}

function initializeBoardState() {
  for (let i = 0; i < boardsize; i++) {
    boardstate.push([]);
    for (let j = 0; j < gridheight; j++) {
      boardstate[i].push(0);
    }
  }
}
initializeBoardState();

while (shapequeue.length < 3) {
  shapequeue.push(new Block("random", "shapeque"));
}

blocks.push(new Block("random", "game"));
var currentblock = blocks[blocks.length - 1];

function tick() {
  if (gameover == false) {
    updateGame();
    drawGame();
    setTimeout(tick, gamespeed);
  }
}

function lineCompletion() {
  for (let j = 0; j < gridheight; j++) {
    var linecomplete = true;
    for (let i = 0; i < boardsize; i++) {
      if (boardstate[i][j] == 0) {
        var linecomplete = false;
      }
    }
    if (linecomplete == true) {
      score++;
      for (let k = j; k >= 0; k--) {
        if (k > 0) {
          for (let p = 0; p < boardsize; p++) {
            boardstate[p][k] = boardstate[p][k - 1];
          }
        } else {
          for (let m = 0; m < boardsize; m++) {
            boardstate[m][k] = 0;
          }
        }
      }
    }
  }
}

function drawBoard() {
  if (gameover == false) {
    c.fillStyle = "black";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "blue";
    c.beginPath();
    for (let i = 1; i < boardsize; i++) {
      c.moveTo(u * i, 0);
      c.lineTo(u * i, h);
    }
    for (let i = 1; i < gridheight; i++) {
      c.moveTo(0, u * i);
      c.lineTo(w, u * i);
    }
    c.stroke();
  }
}
drawBoard();

function updateGame() {
  console.log(currentblock);
  currentblock.updateBlock();
}
function drawGame() {
  if (gameover == false) {
    drawBoard();
    drawNextPieces();
    drawSavePiece();

    for (let i = 0; i < boardsize; i++) {
      for (let j = 0; j < gridheight; j++) {
        if (boardstate[i][j] != 0) {
          c.fillStyle = boardstate[i][j];
          c.fillRect(i * u, j * u, u, u);
        }
      }
    }
    currentblock.render();
    c.stroke();
  }
}

tick();

function drawNextPieces() {
  nc.fillStyle = "black";
  nc.fillRect(0, 0, ncw, nch);
  for (let i = 0; i < shapequeue.length; i++) {
    shapequeue[i].renderAsNextPiece(i);
  }
}
function drawSavePiece() {
  sc.fillStyle = "black";
  sc.fillRect(0, 0, savecanvas.width, savecanvas.height);
  if (savedpiece != undefined) {
    savedpiece.renderAsSavedPiece();
  }
}
