CanvasRenderingContext2D.prototype.roundedRectangle = function(x, y, width, height, rounded) {
    const radiansInCircle = 2 * Math.PI
    const halfRadians = (2 * Math.PI)/2
    const quarterRadians = (2 * Math.PI)/4  
    
    // top left arc
    this.arc(rounded + x, rounded + y, rounded, -quarterRadians, halfRadians, true)
    
    // line from top left to bottom left
    this.lineTo(x, y + height - rounded)
  
    // bottom left arc  
    this.arc(rounded + x, height - rounded + y, rounded, halfRadians, quarterRadians, true)  
    
    // line from bottom left to bottom right
    this.lineTo(x + width - rounded, y + height)
  
    // bottom right arc
    this.arc(x + width - rounded, y + height - rounded, rounded, quarterRadians, 0, true)  
    
    // line from bottom right to top right
    this.lineTo(x + width, y + rounded)  
  
    // top right arc
    this.arc(x + width - rounded, y + rounded, rounded, 0, -quarterRadians, true)  
    
    // line from top right to top left
    this.lineTo(x + rounded, y)  
  }

var arr = [],
    slider = document.getElementById('arraySize'), //rect count
    count = slider.value,
    slider2 = document.getElementById('sortSpeed'), //sort speed
    slow = 51-slider2.value,
    sortable = document.getElementById("sortBtn"), //sort button
    speedable = document.getElementById("speedSwitch"),
    w = 0,
    bbl_i = 0,
    bbl_j = 0,
    tick = 0,
    stopSort = false, //prevents initializing sort function while already sorting
    c = document.getElementById('c'),
    instant = document.getElementById('speedSwitch').checked,    
    ctx = c.getContext('2d');
    

slider.onchange = function(){ //updates array size when user moves slider
    stopSort=true;
    slider = document.getElementById("arraySize");
    count=slider.value;
    randomize();
    }
slider2.onchange = function(){ //updates sort speed when user moves slider
    
    slider2 = document.getElementById("sortSpeed");
    slow=51-slider2.value;
    
    }
var colors = {
    grey: '#555555',
    violet: "#c085ff",
    blue: '#007ab3'  
}

function resize() { //resizes canvas to fit browser window
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    w = c.width / count;
}

resize();
window.addEventListener("resize", resize); //detects when browser window changes size and reacts to change canvas size

function Rect (h, col) { //creates a rect object with height and colour
    this.h = h;
    this.col = col;
}

for(var i=0; i<count; i++) { //generates initial array of rectangles upon loading web page
    var h = Math.round(.75*c.height*(Math.random()+0.25)),
        col = colors.grey;
    arr.push(new Rect(h, col));
}


function drawRects () { //updates the displayed rectangles according to the current state of the array
    for(var i=0; i<count; i++) {
        var rect = arr[i];
        
        ctx.fillStyle = rect.col;
        ctx.beginPath();
        ctx.roundedRectangle(i*w+w*0.1, c.height - rect.h , w*0.8, rect.h,w*.4);
        ctx.fill()
    }
}

drawRects(); //displays initial array of rectangles upon loading web page

function swap(arr, i, j){ //swaps the position of two rectangles in the array
  var temp_h = arr[i].h;
  arr[i].h = arr[j].h;
  arr[j].h = temp_h;
}

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

function update(){              //sorting algorithm: bubble sort
  instant = document.getElementById('speedSwitch').checked;
  if (sortable.disabled == true){ // prevents user from running sorting algorithm while it is already running
      if (stopSort==true){
          sortable.disabled = false;
          speedable.disabled = false;
          stopSort = false;
          return
      }
  }else{
    stopSort = false;
  }
  sortable.disabled = true;
  speedable.disabled = true;
  if (instant == false){  
    if (bbl_j == 0 && bbl_i!=count){
      arr[0].col = colors.violet;
    }  
    if (tick % slow == 0) { // determines display speed
      if (bbl_i < count) { // start of algorithm
        if (bbl_j<count-bbl_i-1){
          if (arr[bbl_j].h>arr[bbl_j+1].h){
            swap(arr, bbl_j,bbl_j+1);
          }
          arr[bbl_j].col = colors.grey;
          arr[bbl_j+1].col = colors.violet;
          bbl_j++;
        }else{
          arr[bbl_j].col = colors.blue
          bbl_j = 0;
          bbl_i++;
        }
      }
    } //end of algorithm

    tick++;
    ctx.clearRect(0, 0, c.width, c.height); //clears previously drawn rectangles
    drawRects();                            //draws next frame of rectangles
    if (bbl_i<count){
      window.requestAnimFrame(update);
    }      
    if (bbl_i==count){
      sortable.disabled = false;
      speedable.disabled = false;
    }
  }else{
    
    for (i=0;i<count-bbl_i-1;i++){
      if (arr[i].col==colors.violet){
        arr[i].col=colors.grey;
      }
      if (arr[i].h>arr[i+1].h){
        swap(arr,i,i+1)        
      }
    }
    for (i=0;i<count-bbl_i;i++){
      if (i==count-bbl_i-1){
        arr[i].col=colors.blue}
    }
    bbl_i+=1
    ctx.clearRect(0, 0, c.width, c.height); 
    drawRects();
    window.requestAnimFrame(update);
  }
}

function randomize(){ //generates a new random array of rectangles
  stopSort=true;      //halts sorting if currently in progress
  bbl_i = 0;
  bbl_j = 0;
  arr = [];
    
  for(var i=0; i<count; i++) {
    var h = Math.round(Math.random() * (.75*c.height - .15*c.height) + .15*c.height),
        col = colors.grey;
    arr.push(new Rect(h, col));}
    resize();
    bbl_i=0;
    drawRects();
}
