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
    slider2 = document.getElementById('sortSpeed'),
    slow = 51-slider2.value,
    w = 0,
    bbl_i = 0,
    bbl_j = 0,
    tick = 0,
    stopSort = false,
    c = document.getElementById('c'),
    ctx = c.getContext('2d');
    var sortable = document.getElementById("sortBtn");

slider.onchange = function(){
    stopSort=true;
    slider = document.getElementById("arraySize");
    count=slider.value;
    randomize();
    }
slider2.onchange = function(){
    
    slider2 = document.getElementById("sortSpeed");
    slow=51-slider2.value;
    
    }
var colors = {
    black: '#555555',
    red: "#c085ff",
    blue: '#0000FF',
    green: '#007ab3'
  
}

function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    w = c.width / count;
}
resize();
window.addEventListener("resize", resize);

function Rect (h, col) {
    this.h = h;
    this.col = col;
}

for(var i=0; i<count; i++) {
    var h = Math.round(.75*c.height*(Math.random()+0.2)),
        col = colors.black;
    arr.push(new Rect(h, col));
}


function drawRects () {
    for(var i=0; i<count; i++) {
        var rect = arr[i];
        
        ctx.fillStyle = rect.col;
        ctx.beginPath();
        ctx.roundedRectangle(i*w+w*0.1, c.height - rect.h , w*0.8, rect.h,w*.4);
        ctx.fill()
        
        
        
    }
}
drawRects();

function swap(arr, i, j){
  var temp_h = arr[i].h
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

function update(){
if (sortable.disabled == true){
    if (stopSort==true){
        sortable.disabled = false;
        stopSort = false;
        return
    }
}else{stopSort = false;}
  sortable.disabled = true;
  if (bbl_j == 0 && bbl_i!=count){
    arr[0].col = colors.red;
  }
  
  if (tick % slow == 0) {
    if (bbl_i < count) {
    if (bbl_j<count-bbl_i-1){
      if (arr[bbl_j].h>arr[bbl_j+1].h){
        swap(arr, bbl_j,bbl_j+1);
      }
        arr[bbl_j].col = colors.black;
        arr[bbl_j+1].col = colors.red;
        bbl_j++;
    }else{
      arr[bbl_j].col = colors.green
      bbl_j = 0;
      bbl_i++;
    }
  }
  }

    tick++;
    
    ctx.clearRect(0, 0, c.width, c.height);
    drawRects();
    if (bbl_i<count){
        window.requestAnimFrame(update);}
    
    if (bbl_i==count){
        sortable.disabled = false;
    }
}
  function randomize(){
    stopSort=true;
    bbl_i = 0;
    bbl_j = 0;
    arr = [];
    
    for(var i=0; i<count; i++) {
        var h = Math.round(.75*c.height*(Math.random()+0.2)),
            col = colors.black;
        arr.push(new Rect(h, col));}
    resize();
    bbl_i=0;
    drawRects();
    


  }
