import {Tile} from './Tile.js';

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var message = document.getElementById("message");
document.getElementById("start-button").onclick = playButton;

message.style.visibility = "hidden";
var paused = false;

var pacDirection;

class InputHandler
{
    constructor(pacman)
    {
        document.addEventListener("keydown", event => {
            
            event.preventDefault(); //prevents scrolling 

            switch(event.keyCode)
            {
                case 37: 
                pacman.move(-1, 0); //left
                pacDirection = 'L';
                break;

                case 39: 
                pacman.move(1, 0);  //right
                pacDirection = 'R';
                break;

                case 38: 
                pacman.move(0, -1);  //up
                pacDirection = 'U';
                break;

                case 40: 
                pacman.move(0, 1);  //down
                pacDirection = 'D';
                break;

                case 80:
                window.location.reload(); // P
                break;    
            }
        });

        
    }
}




var level = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1,
    1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1,
    1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1,
    1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
    1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1,
    1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1,
    1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1,
    0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0,
    0, 0, 0, 1, 2, 1, 2, 1, 9, 9, 9, 9, 1, 2, 1, 2, 1, 0, 0, 0,
    1, 1, 1, 1, 2, 1, 2, 1, 9, 9, 9, 9, 1, 2, 1, 2, 1, 1, 1, 1, 
    1, 0, 0, 0, 2, 2, 2, 1, 9, 9, 9, 9, 1, 2, 2, 2, 0, 0, 0, 1, 
    1, 1, 1, 1, 2, 1, 2, 1, 9, 9, 9, 9, 1, 2, 1, 2, 1, 1, 1, 1, 
    0, 0, 0, 1, 2, 1, 2, 1, 1, 0, 0, 1, 1, 2, 1, 2, 1, 0, 0, 0,
    0, 0, 0, 1, 2, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 2, 1, 0, 0, 0,
    1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1,
    1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1,
    1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1,
    1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
    1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1,
    1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1,
    1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

var grid = [];


var TYPES = ["BLANK", "WALL", "DOT", "PILL", "PACMAN", 
            "BLINKY", "PINKY", "INKY", "CLYDE", "GHOSTLAIR"];

var pacman;

var ghosts = [];


function setup()
{
    paused = false;
    grid = generateGrid();
    new InputHandler(pacman);

    // INITIAL SCREEN
    for(var i = 0; i < grid.length; i++)
    {
        //if(grid[i].type != "PACMAN" && grid[i].type != "BLINKY" &&
        //grid[i].type != "PINKY" && grid[i].type != "INKY" && grid[i].type != "CLYDE")
        //{
            //grid[i].update();
            grid[i].draw();
        //}
        
    }

    pacman.draw();

    for(var i = 0; i < 4; i++)
    {
        ghosts[i].handleGhosts();
        if(!paused)
        {
            ghosts[i].update();
        }
        ghosts[i].draw();
    }


}


function generateGrid()
{
    //13 14
    pacman = new Tile(11, 16, "PACMAN");
    ghosts[0] = new Tile(9,10, "BLINKY");
    ghosts[1] = new Tile(10,10, "PINKY");
    ghosts[2] = new Tile(9,11, "INKY");
    ghosts[3] = new Tile(10,11, "CLYDE");
    for(var i = 0; i < level.length; i++)
    {
        grid.push(new Tile(i % 20, Math.floor(i / 20), TYPES[level[i]]));
    }
    return grid;
}

setup();


function drawBoard()
{
    context.clearRect(0, 0, canvas.width, canvas.height);

    //draw tiles
    for(var i = 0; i < grid.length; i++)
    {
        //if(grid[i].type != "PACMAN" && grid[i].type != "BLINKY" &&
        //grid[i].type != "PINKY" && grid[i].type != "INKY" && grid[i].type != "CLYDE")
        //{
            //grid[i].update();
            grid[i].draw();
        //}
        
    }
    
    // check for gameover conditions
    if(pacman.life == 0)
    {
        message.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;You Lose!<br>Press P to Play Again."
        message.style.visibility = "visible";
        paused = true;
    }
    else if(pacman.life == 50)
    {
        message.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;You Win!<br>Press P to Play Again."
        message.style.visibility = "visible";
        paused = true;
    }


    // draw pacman
    if(!paused)
    {
        pacman.update();
    }
    
    pacman.draw();
    
    
    // draw ghosts
    for(var i = 0; i < 4; i++)
    {
        ghosts[i].handleGhosts();
        if(!paused)
        {
            ghosts[i].update();
        }
        ghosts[i].draw();
    }

    
    requestAnimationFrame(drawBoard);

}

function playButton()
{
    requestAnimationFrame(drawBoard);
}




export {grid, pacman, ghosts, pacDirection};