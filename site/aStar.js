var c = document.getElementById('c'),
    ctx = c.getContext('2d'),
    aspectRatio = 1;
    


function resize() { //resizes canvas to fit browser window
    c.width = window.innerWidth;
    c.height = window.innerHeight;  
}

resize();
window.addEventListener("resize", resize); //detects when browser window changes size and reacts to change canvas size

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           window.oRequestAnimationFrame      ||
           window.msRequestAnimationFrame     ||
           function(callback) {
               window.setTimeout(callback, 1000/60);
           };
})();

var colors = {
    grey: '#555555',
    violet: "#c085ff",
    blue: '#007ab3',
    cyan: '#56e6ff'   
}

function line(x1,y1,x2,y2){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

var slider = document.getElementById('tileSize'),
    w = 100/parseInt(slider.value),
    startButton = document.getElementById("startButton");

if (parseInt(slider.value) == 3) w = 25;
var col = Math.floor(c.width*0.98/w),
    row = Math.floor(c.height*0.86/w),
    start = 0,
    target = 0,
    grid = [],
    stack = [],
    total = 0,
    mazePresent = false,
    interrupt = false,
    finished = true;

if (col%2 == 0) col--;
if (row%2 == 0) row--;
    
slider.onchange = function(){ //updates array size when user moves slider
    //stopSort=true;
    slider = document.getElementById("tileSize");
    w = 100/parseInt(slider.value);
    if (parseInt(slider.value) == 3) w = 25
    col = Math.floor(c.width*0.98/w);//Math.floor(c.width*0.99/w);
    row = Math.floor(c.height*0.86/w);//Math.floor(c.height*0.88/w);
    if (col%2 == 0) col--;
    if (row%2 == 0) row--;
    
    if (mazePresent == true){
        generateMaze();
    }else newGrid();
}

function newGrid(){
    if (running == true) interrupt = true;
    grid = [];
    stack = [];
    openArr = undefined;
    path = [];
    mazePresent = false;
    closedArr = [];
    current = undefined;
    lastOpen = 1;
    for (j=0;j<row;j++){
        for (i=0;i<col;i++){
            var cell = new Cell(i,j);
            grid.push(cell)
        }
    }
    currentMaze = grid[0];
    start = Math.floor((row-1)*col/2+col/4)
    
    target = Math.floor((row-1)*col/2+3*col/4)
    drawGrid();
}

function index(i,j){
    if (i<0 || j<0 || i>col-1 || j>row-1) return -1
    return i+j*col;
}

function Cell(i,j){
    this.i = i;
    this.j = j;
    this.wall = false; 
    this.visited = false;
    this.col = false;
    this.fcost = 0,
    this.hcost = 0,
    this.w = w;
    this.parent;
    this.checkNeighbors = function(){
        var neighbors = [];
        
        if (grid[index(i,j-2)] && !grid[index(i,j-2)].visited) neighbors.push(grid[index(i,j-2)])
        if (grid[index(i+2,j)] && !grid[index(i+2,j)].visited) neighbors.push(grid[index(i+2,j)])
        if (grid[index(i,j+2)] && !grid[index(i,j+2)].visited) neighbors.push(grid[index(i,j+2)])
        if (grid[index(i-2,j)] && !grid[index(i-2,j)].visited) neighbors.push(grid[index(i-2,j)])
    
        if (neighbors.length>0){
            var r = Math.floor(Math.random()*neighbors.length)
            return neighbors[r]
        } else return undefined
    }
}

function drawGrid(){
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = '#777777';
    
    for (i=0;i<grid.length;i++){
        var cell = grid[i],
            x=cell.i*w,
            y=cell.j*w;

        if (cell.j == 0) cell.wall = true, cell.w = w; //top
        if (cell.i == 0)  cell.wall = true, cell.w = w; //left
        if (cell.i == col-1) cell.wall = true, cell.w = w; //right
        if (cell.j == row-1) cell.wall = true, cell.w = w; //bottom

        if (cell.wall == true) cell.col = colors.grey;
        if (cell.col != false || i == start || i == target && cell.col!=colors.cyan){
            if (i == start){
                ctx.fillStyle = colors.violet;
            }else if (i == target){
                ctx.fillStyle = colors.violet;
                ctx.beginPath();
                ctx.rect(x, y, w, w);
                ctx.fill();

                ctx.fillStyle = colors.blue;
                ctx.strokeStyle = colors.violet;
                ctx.lineWidth = w/10;
                ctx.beginPath();
                ctx.arc(x+w/2, y+w/2, w/2.5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x+w/2, y+w/2, w/4, 0, 2 * Math.PI);
                ctx.stroke();
                continue
            }else ctx.fillStyle = cell.col;
            
            ctx.beginPath();
            ctx.rect(x+(w/2)-cell.w/2, y+(w/2)-cell.w/2, cell.w, cell.w);
            ctx.fill();
        }
        if (cell.col == colors.cyan){
            ctx.fillStyle = colors.blue
            ctx.beginPath();
            ctx.rect(x, y, w, w);
            ctx.fill();
            
            ctx.fillStyle = colors.cyan
            ctx.beginPath();
            ctx.rect(x+(w/2)-cell.w/2, y+(w/2)-cell.w/2, cell.w, cell.w);
            ctx.fill();
        }
        if(cell.w<w){
            cell.w++
        }else cell.w = w;
    }
}

async function growTile(){
    for (i=0; i<grid.length;i++){
        var cell = grid[i];
        if(cell.w<w){
            cell.w+=w/25
        }else cell.w = w;  
    }
    drawGrid();
    setTimeout(growTile,50)
}


newGrid();
growTile();

function removeWalls(a, b){
    var x = a.i - b.i
    a.wall = false;
    a.col = false;
    b.wall = false;
    b.col = false;
    if (x == 2){
        grid[a.j*col+a.i-1].wall = false;
        grid[a.j*col+a.i-1].col = false;
    }else if (x == -2){
        grid[a.j*col+a.i+1].wall = false;
        grid[a.j*col+a.i+1].col = false;
    }
    var y = a.j - b.j
    if (y == 2){
        grid[(a.j-1)*col+a.i].wall = false;
        grid[(a.j-1)*col+a.i].col = false;
        
    }else if (y == -2){
        grid[(a.j+1)*col+a.i].wall = false;
        grid[(a.j+1)*col+a.i].col = false;
    }
}

var maze = false;
function generateMaze(){
    if (maze == false){
        newGrid();
        mazePresent = true;
        for (i=0;i<grid.length;i++){
            var cell = grid[i];
            cell.wall = true;
            cell.col = colors.grey;
            cell.visited = false;
            if (cell.i==0 || cell.i == col-1 || cell.j == 0 || cell.j == row-1) cell.visited = true;
        }
        maze = true;
        currentMaze = grid[col+1];
    }
    
    finished = false
    if (currentMaze == undefined) finished = true;
    if (finished == true) {
        maze = false;
        start = col+1;
        target = grid.length-col-2;
        drawGrid();
        finished = false;
        return
    }
    currentMaze.visited = true;
    total++
    var next = currentMaze.checkNeighbors();
    
    if (next){
        
        next.visited = true;
        stack.push(currentMaze);
        removeWalls(currentMaze, next);
        
        currentMaze = next
    }else currentMaze = stack.pop()
    
    if (finished == false) generateMaze(); 
}

function highlight(){
    if (running == true) return;
    clearPath();
    var rect = c.getBoundingClientRect();
    var x = event.clientX - rect.left - c.width*0.01;
    if (x < 0 || x > w*col) return;
    var y = event.clientY - rect.top - c.height*0.02;
    if (y < 0 || y> w*row) return;
    var i = Math.floor((x)/w);
    var j = Math.floor((y)/w);
    cell = grid[j*col+i];

    if (j*col+i != start && j*col+i != target){
        if (document.getElementById('barrier').checked){
            if (cell.col == false){
                cell.wall = true;
                cell.col = colors.grey
            }else{
                cell.wall = false;
                cell.col = false;  
            }
        }else if (document.getElementById('start').checked){
            start = j*col+i;
            if (cell.col == colors.grey){
                cell.col = false;
                cell.wall = false;     
            }
        }else if (document.getElementById('target').checked){
            target = j*col+i;
            if (cell.col == colors.grey){
                cell.col = false;
                cell.wall = false;  
            }
        }
    }
 
    
    drawGrid();
}

function clearPath(){
    if (running == true) return
    for (i=0;i<grid.length;i++){
        if (grid[i].col != colors.grey && grid[i].col != colors.violet){
            grid[i].col = false;
        }
    }
}

//algorithm start
var openArr = undefined;
var path = [];
var closedArr = [];
var current = undefined;
var lastOpen = 1;
var running = false;

async function pathFind(){
    startButton.disabled = true;
    if (running == false) clearPath();
    running = true;
    if (interrupt == true){
        interrupt = false;
        openArr = undefined;
        path = [];
        closedArr = [];
        current = undefined;
        lastOpen = 1;
        startButton.disabled = false;
        running = false;
        return
    }
    var targetCell = grid[target];
    var startCell = grid[start];
    var neighborsArr = [];

    if (openArr == undefined){
        openArr = [startCell];
        openArr[0].fCost = hCost(openArr[0]);
        openArr[0].gCost = 0;
    }

    if (current == undefined) current = openArr[0];
    if (openArr.length == 0){
        openArr = undefined;
        path = [];
        closedArr = [];
        current = undefined;
        lastOpen = 1;
        running = false;
        startButton.disabled = false;
        return //no solution
    }
    function neighbors(cell){
        if (cell.j!=0) neighborsArr.push(grid[index(cell.i, cell.j-1)]); //top
        if (cell.i!=col-1) neighborsArr.push(grid[index(cell.i+1, cell.j)]); //right
        if (cell.j!=row-1) neighborsArr.push(grid[index(cell.i, cell.j+1)]); //bottom
        if (cell.i!=0) neighborsArr.push(grid[index(cell.i-1, cell.j)]); //left
    }

    function obstructed(a,b){
        if (b.wall == true) return true;
        return false;
    }

    function hCost(cell){
        return Math.abs(targetCell.i-cell.i)+Math.abs(targetCell.j-cell.j)
    }

    var removeIndex = 0;
    for (i=0;i<openArr.length;i++){ //set current to node in open with lowest f cost
        if (openArr[i].fCost<openArr[removeIndex].fCost){
            removeIndex = i;
        }else if (openArr[i].fCost==openArr[removeIndex].fCost && hCost(openArr[i])<hCost(openArr[removeIndex])){
            removeIndex = i;
        }
    }

    current = openArr[removeIndex];

    if (current == targetCell){
        var temp = current;
        path.push(temp)
        while (temp.parent){
           
            path.push(temp.parent)
            temp = temp.parent;
        }
        for (k=path.length-2;k>=1;k--){
            var cell = path[k];
            grid[cell.j*col+cell.i].col = colors.cyan;
            grid[cell.j*col+cell.i].w = w/2
            await drawGrid();
            await sleep(w/4);
        }
        openArr = undefined;
        path = [];
        closedArr = [];
        current = undefined;
        lastOpen = 1;
        running = false;
        startButton.disabled = false;
        return
    }
    
    closedArr.push(current); //add current to closed set
    openArr.splice(removeIndex,1); //remove current from open set

    neighbors(current); //find all cells adjacent to current cell
    for (i=0;i<neighborsArr.length;i++){
        if (obstructed(current, neighborsArr[i]) || closedArr.includes(neighborsArr[i])){
            continue //skip neighbor if it is a wall or in closed set
        }
        var tempG = current.gCost + 1;
        if(tempG<neighborsArr[i].gCost || !openArr.includes(neighborsArr[i])) neighborsArr[i].parent = current;
        if (openArr.includes(neighborsArr[i])){
            if (tempG<neighborsArr[i].gCost) neighborsArr[i].gCost = tempG;
            neighborsArr[i].fCost = neighborsArr[i].gCost + hCost(neighborsArr[i]);
        }else{
            neighborsArr[i].gCost = tempG;
            neighborsArr[i].fCost = neighborsArr[i].gCost + hCost(neighborsArr[i]);
            openArr.push(neighborsArr[i]);
        }
    }
    for (k=lastOpen; k<closedArr.length;k++){
        grid[index(closedArr[k].i, closedArr[k].j)].col = colors.blue
        grid[index(closedArr[k].i, closedArr[k].j)].w = w/1.5
        drawGrid();
    }
    lastOpen = closedArr.length; 
    window.requestAnimFrame(pathFind)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}