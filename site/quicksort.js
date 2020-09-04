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
    time = 825-slider2.value,
    sortable = document.getElementById("sortBtn"), //sort button
    speedable = document.getElementById("speedSwitch"),
    w = 0,
    sortEnd = -1,
    sortStart = 0,
    sorted = false,
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
    if (instant == false) time = 825-slider2.value;
  }
  
  var colors = {
    grey: '#555555',
    violet: "#c085ff",
    blue: '#007ab3',
    cyan: '#56e6ff'  
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
    var h = Math.round(Math.random() * (.85*c.height - .2*c.height) + .2*c.height),
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

async function swap(arr, i, j){

    await sleep(time);
    let temp = arr[i];
    arr[i]=arr[j];  
    arr[j]=temp;
    
}
async function partition(arr, start, end){
    for (i = start; i < end+1; i++) {
      if (instant == false) arr[i].col = colors.cyan;
      }
    let pivotValue = arr[end].h,
        pivotIndex = start;
        if (instant == false) arr[pivotIndex].col = colors.violet;
    for (i=start;i<end;i++){
        if (stopSort == true) return
        if (arr[i].h<pivotValue){
            await swap(arr,i,pivotIndex);
            if (instant == false) arr[pivotIndex].col = colors.grey;
            
            if (i>pivotIndex && instant == false) arr[i].col = colors.cyan;
            pivotIndex+=1
            if (instant == false) arr[pivotIndex].col = colors.violet;
        }
    }
     await swap(arr, end, pivotIndex);
    
    for (let i = start; i < end+1; i++) {
        if (i != pivotIndex) {
          if (instant == false) arr[i].col = colors.grey;
        }
        
    }

    return pivotIndex
}
async function quickSort(arr, start, end){
    if (stopSort == true) return
    instant = document.getElementById('speedSwitch').checked;
    if (start >= end){
        sortEnd = Math.max(start,end);
        if (sortEnd<count){
            for (i=sortStart;i<sortEnd+1;i++){
                await sleep(time)
                if (instant == false) arr[i].col = colors.blue;
                
                
            }
        sortStart = sortEnd+1    
        }
        
        
        return;
    }
    let index = await partition(arr, start, end);
    if (stopSort == true) return
    if (instant == false) arr[index].col = colors.grey;
    
    if (instant == true){
        await Promise.all([
            quickSort(arr, start, index-1),
            quickSort(arr, index+1, end)
        ]);
    
    }else{
        await quickSort(arr, start, index-1);
        await quickSort(arr, index+1, end);
    }
}

    
  
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  function sortTest(arr){
  sorted = true
  for (i=0;i<arr.length-1;i++){
    if (arr[i].h>arr[i+1].h){
      sorted = false;
    } 
  }
  return sorted;
  }
  
 async function update(){ 
  instant = document.getElementById('speedSwitch').checked;
  if (instant == true) time = 100  
    sortStart = 0;
    sortEnd = -1;
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
    await quickSort(arr,0,arr.length-1);
    if (stopSort == false) arr[count-1].col = colors.blue;
    stopSort = true;
    
  }
  
  
  function randomize(){ //generates a new random array of rectangles
  stopSort=true;
  sortStart = 0;
  sortEnd = -1;
  arr = [];
    
  for(var i=0; i<count; i++) {
    var h = Math.round(Math.random() * (.85*c.height - .2*c.height) + .2*c.height),
        col = colors.grey;
    arr.push(new Rect(h, col));}
    resize();
    bbl_i=0;
    drawRects();

  }
  
function draw (){
    noStroke();
    
    if (sorted == true || stopSort == true){
        sortable.disabled = false;
        speedable.disabled = false;
    }
    if (sorted == true){
        for (i=0;i<count;i++){
        arr[i].col = colors.blue;   
        }
    }
 
    ctx.clearRect(0, 0, c.width, c.height);
    drawRects(); 

}