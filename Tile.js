import {grid, pacman, pacDirection} from './index.js';


var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var score = document.getElementById("score");


const SIZE = 25; //20 squares in each row
const DIMENSIONS = 20; 

var sc = 0;

var offset = -10; // for animating pacman
var pctOpen = 100; // dir will be added to this at every interval


export class Tile {
    constructor(x, y, type) 
    {
        this.x = x;
        this.y = y;
        this.type = type;

        this.newX = 0; //new pos 
        this.newY = 0; //for pacman
        this.moving = false;
        this.speed = 0.6;
        this.life = 1;

        this.neighbors = [];
        this.path = [];

    }

    update()
    {
        /* PACMAN MOVEMENT AND GHOST AI*/

        if(this.type == "BLINKY" || this.type == "PINKY" ||
        this.type == "INKY")
        {
            this.speed = 0.25;
        }
        if(this.type == "CLYDE")
        {
            this.speed = 0.35;
        }
        
        if(this.moving)
        {
            this.x += (this.newX - this.x) * this.speed; //lerping
            this.y += (this.newY - this.y) * this.speed;

            if(Math.abs(this.x - this.newX) < 0.005 && Math.abs(this.y - this.newY) < 0.005)
            {
                this.x = this.newX;
                this.y = this.newY;
                this.moving = false;
            }
        }
        
        


        /*COLLISION CHECK*/
        if(this.type == "PACMAN")
        {
            pacman.eatPoints(grid[this.newY * DIMENSIONS + this.newX]);
        }
        

          
    }

    move(dx, dy)
    {
        var newX = this.x + dx;
        var newY = this.y + dy;

        if(this.moving)
            return;

        var destinationTile = grid[newY * DIMENSIONS + newX];
        var type = destinationTile.type;


        if((type == "WALL" && this.type != "WALL") || (type == "GHOSTLAIR" && (this.type == "PACMAN" || this.type == "ANGRYPACMAN")))
        {
            //console.log("you cant move");
            //don't move pacman
            return;
        }



        this.moving = true;
        this.newX = newX;
        this.newY = newY;
    }

    eatPoints(destinationTile)
    {
        if(destinationTile.type == "DOT" && this.type == "PACMAN")
        {
            grid[destinationTile.y * DIMENSIONS + destinationTile.x].type = "BLANK"; 
            sc++;
        }
        else if(destinationTile.type == "PILL" && this.type == "PACMAN")
        {
            grid[destinationTile.y * DIMENSIONS + destinationTile.x].type = "BLANK"; 
            //wait till the ghosts are created.
            pacman.type = "ANGRYPACMAN";
            setTimeout(function(){pacman.type = "PACMAN";}, 10000);
            sc += 10;    
            
        }
    }

    collisionCheck(destinationTile)
    {
        if(this.type == "BLINKY" || this.type == "PINKY" ||
        this.type == "INKY" || this.type == "CLYDE")
        {
            if(destinationTile.x == pacman.x && destinationTile.y == pacman.y && pacman.type == "PACMAN")
            {
                pacman.life--;
                console.log("eaten by " + this.type);
                
            }

            if(Math.abs(this.x - pacman.x) < 0.5 && Math.abs(this.y - pacman.y) < 0.5 && pacman.type == "ANGRYPACMAN")
            {
                pacman.life = 50;
                console.log("GHOST GOT EATEN");  
                sc += 400;
            }
        }


        
        
        score.innerHTML = sc;    
        
    }


    
    handleGhosts()
    {
        var left = {x: -1, y: 0};
        var right = {x: 1, y: 0};
        var up = {x: 0, y: -1};
        var down = {x: 0, y: 1};
        const directions = [left, right, up, down];
        let direction = directions[Math.floor(Math.random() * directions.length)];
        
        if(this.moving)
            return;

        var newX = this.x + direction.x;
        var newY = this.y + direction.y;
        var destinationTile = grid[newY * DIMENSIONS + newX];
        
        if(destinationTile.type != "WALL")
        {
            var currentDistance;
            var newDistance;
            
            if(this.type == "BLINKY")
            {
                // BLINKY: target = pacman
                currentDistance = this.calcDist(this.x, this.y, pacman.x, pacman.y);
                newDistance = this.calcDist(newX, newY, pacman.x, pacman.y);

            }

            if(this.type == "PINKY")
            {
                // PINKY: target = 4 cells to the left of pacman
                if(pacman.x - 1 > 0){
                    currentDistance = this.calcDist(this.x, this.y, pacman.x - 1, pacman.y);
                    newDistance = this.calcDist(newX, newY, pacman.x - 1, pacman.y);
                }
                else{
                    currentDistance = this.calcDist(this.x, this.y, pacman.x, pacman.y);
                    newDistance = this.calcDist(newX, newY, pacman.x, pacman.y);
                }

            }
            if(this.type == "INKY")
            {
                // PINKY: target = 2 cells to the right of pacman
                if(pacman.x + 1 < DIMENSIONS){
                    currentDistance = this.calcDist(this.x, this.y, pacman.x + 1, pacman.y);
                    newDistance = this.calcDist(newX, newY, pacman.x + 1, pacman.y);
                }
                else{
                    currentDistance = this.calcDist(this.x, this.y, pacman.x, pacman.y);
                    newDistance = this.calcDist(newX, newY, pacman.x, pacman.y);
                }
            }
            if(this.type == "CLYDE")
            {
               // CLYDE: target = pacman with faster speed
               currentDistance = this.calcDist(this.x, this.y, pacman.x, pacman.y);
               newDistance = this.calcDist(newX, newY, pacman.x, pacman.y);
            }
            
            direction = directions[Math.floor(Math.random() * directions.length)];
            
            if(pacman.type == "PACMAN")
            {
                // new dist should be less than current dist for PACMAN
                if(newDistance < currentDistance)// || (this.x != pacman.x && this.y != pacman.y))
                {
                    this.moving = true;
                    this.newX = newX;
                    this.newY = newY;
                    //console.log("moving");
                }
            }
            else if(pacman.type == "ANGRYPACMAN")
            {
                // new dist should be MORE than current dist for PACMAN
                if(newDistance > currentDistance)// || (this.x != pacman.x && this.y != pacman.y))
                {
                    this.moving = true;
                    this.newX = newX;
                    this.newY = newY;
                    //console.log("moving");
                }
            }

              
            
        }

        this.collisionCheck(destinationTile);

               
        
    }

    calcDist(x1, y1, x2, y2)
    {
        var x = x1 - x2;
        var y = y1 - y2;
        var d = Math.sqrt(x*x + y*y);
        return d;
    }
    

    


   


    drawWall()
    {
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.fillStyle = "blue";
        context.beginPath();
        context.rect(this.x * SIZE, this.y * SIZE, SIZE, SIZE);
        context.closePath();
        context.fill();
        context.stroke();
    }

    drawDot()
    {
        context.lineWidth = 0.5;
        context.fillStyle = "white";
        context.beginPath();
        context.arc(this.x * SIZE + SIZE/2, this.y * SIZE + SIZE/2, 3, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
    }

    drawPill()
    {
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = "yellow";
        context.fillStyle = "white";
        context.arc(this.x * SIZE + SIZE/2, this.y * SIZE + SIZE/2, 5, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.stroke();
    }

    drawPacman(pct)
    {
        // 0 < pct < 100
        var mouthOpen = pct /100; 
        // An arc which goes from 36 degrees to 324 degrees to draw Pacman's head
        context.beginPath();
        context.lineWidth = 1.5;
        if(pacDirection == 'R')
            context.arc(this.x * SIZE + SIZE/2, this.y * SIZE + SIZE/2, 10.5, mouthOpen * 0.2 * Math.PI, (2 - mouthOpen * 0.2) * Math.PI);
        else if(pacDirection == 'L')
            context.arc(this.x * SIZE + SIZE/2, this.y * SIZE + SIZE/2, 10.5, (1 + mouthOpen * 0.2) * Math.PI, (1 - mouthOpen * 0.2) * Math.PI);
        else if(pacDirection == 'U') 
            context.arc(this.x * SIZE + SIZE/2, this.y * SIZE + SIZE/2, 10.5, (1.5 + mouthOpen * 0.3) * Math.PI, (1.5 - mouthOpen * 0.3) * Math.PI);
        else if(pacDirection == 'D')
            context.arc(this.x * SIZE + SIZE/2, this.y * SIZE + SIZE/2, 10.5, (0.5 + mouthOpen * 0.3) * Math.PI, (0.5 - mouthOpen * 0.3) * Math.PI);
        else
            context.arc(this.x * SIZE + SIZE/2, this.y * SIZE + SIZE/2, 10.5, mouthOpen * 0.2 * Math.PI, (2 - mouthOpen * 0.2) * Math.PI);

        // The line leading back to the center and then closing the path to finish the
        // open mouth
        context.lineTo(this.x * SIZE + SIZE/2, this.y * SIZE + SIZE/2);
        context.closePath();
        context.fill();
        context.stroke();
        
        
    }
    drawGhosts()
    {
        context.beginPath();
        context.lineWidth = 1;
        context.ellipse(this.x * SIZE + SIZE/2, this.y * SIZE + SIZE/1.3, 10.5, 15.5, Math.PI, 0, Math.PI);
        context.rect(this.x * SIZE + SIZE/2 - 7.5, this.y * SIZE + SIZE/2 + 2 , 3, 8);
        context.rect(this.x * SIZE + SIZE/2 - 1.5, this.y * SIZE + SIZE/2 + 2 , 3, 8);
        context.rect(this.x * SIZE + SIZE/2 + 5.5, this.y * SIZE + SIZE/2 + 2 , 3, 8);
        context.closePath();
        context.fill();
        context.stroke();
        context.beginPath();
        context.lineWidth = 2;
        context.fillStyle = "#243cf0";
        context.strokeStyle = "white";
        context.arc(this.x * SIZE + SIZE/2 - 4, this.y * SIZE + SIZE/2, 3, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.stroke();
        context.beginPath();
        context.arc(this.x * SIZE + SIZE/2 + 4, this.y * SIZE + SIZE/2, 3, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.stroke(); 
    }

    draw()
    {
        switch(this.type)
        {
            case "WALL":
                this.drawWall();
                break;
            
            case "BLANK":
                break;
            
            case "DOT":
                this.drawDot();
                break;
            
            case "PILL":
                this.drawPill();
                break;
            
            case "PACMAN":
                context.strokeStyle = "black";
                context.fillStyle = "yellow";
                this.drawPacman(pctOpen += offset);
                // when mouth closes completely, reverse direction
                if(pctOpen % 100 == 0)
                {
                    offset = -offset;
                }
                break;
            
            case "BLINKY":
                context.strokeStyle = "red";
                context.fillStyle = "red";
                this.drawGhosts();
                break;
            
            case "PINKY":
                context.strokeStyle = "#ffa3f0";
                context.fillStyle = "#ffa3f0";
                this.drawGhosts();
                break;

            case "INKY":
                context.strokeStyle = "#7debff";
                context.fillStyle = "#7debff";
                this.drawGhosts();
                break;

            case "CLYDE":
                context.strokeStyle = "#fbff96";
                context.fillStyle = "#fbff96";
                this.drawGhosts();
                break;
            
            case "GHOSTLAIR":
                break;

            case "ANGRYPACMAN":
                context.strokeStyle = "red";
                context.fillStyle = "orange";
                this.drawPacman(pctOpen += offset);
                // when mouth closes completely, reverse direction
                if(pctOpen % 100 == 0)
                {
                    offset = -offset;
                }
                break;
        }
    }

}


