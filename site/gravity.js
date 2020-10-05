var c = document.getElementById('c'),
    ctx = c.getContext('2d');

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

var ceiling = 20,
    right = c.width - 20,
    bottom = c.height - 150,
    left = 20,
    screenHeight = bottom-ceiling,
    screenWidth = right-left;

var density = 1,
    g = 0.001,
    mouseIsDown = false,
    maxSpeed = 30,
    deadStars = [],
    space = [];

var colors = {
    grey: '#555555',
    violet: "#c085ff",
    blue: '#007ab3',
    cyan: '#56e6ff'   
}

//Vector functions
function createVector(x,y){
    let output = {
        x: x,
        y: y
      }
      return output
}
function dist(a,b){
    return Math.sqrt(Math.pow((b.pos.x-a.pos.x),2)+Math.pow((b.pos.y-a.pos.y),2))
}

function vectorMag(vector){
    return Math.sqrt(vector.x*vector.x+vector.y*vector.y)
}

function divMag(vector, mag){
    oldMag = vectorMag(vector);
    newMag = oldMag/mag;
    setMag(vector, newMag);
}

function diffMag(vectorA, vectorB){
    let diffVect = createVector(vectorB.x-vectorA.x, vectorB.y-vectorA.y)
    return vectorMag(diffVect);
}

function setMag(vector,mag){
    oldx = vector.x
    oldy = vector.y
    if (oldy!=0&&oldx!=0){
        vector.y = Math.sqrt(mag*mag/(1+((oldx*oldx)/(oldy*oldy))));
        if (oldy<0) vector.y = vector.y*-1
        vector.x = oldx*vector.y/oldy;
    }else{
        vector.x = Math.random()-0.5;
        vector.y =Math.random()-0.5;
        setMag(vector, mag)
    }
}

function subMag(vector1, vector2){
    vector1.x=vector1.x-vector2.x;
    vector1.y=vector1.y-vector2.y;
}

function addMag(vector1,vector2){
    vector1.x=vector1.x+vector2.x;
    vector1.y=vector1.y+vector2.y;
}
function multMag(vector, mag){
    oldMag = vectorMag(vector);
    newMag = oldMag*mag;
    setMag(vector, newMag);
}
function limit(vector,mag){
    oldMag = Math.sqrt(vector.x*vector.x+vector.y*vector.y)
    if (oldMag>mag){
        setMag(vector, mag)
    }
}
//End of Vector functions

function drawStar(x, y, r){
    ctx.fillStyle = colors.blue;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

function drawTrail(trail){
    ctx.strokeStyle = colors.violet;
    ctx.beginPath();
    for (i=0;i<trail.length-1;i++){
        ctx.moveTo(trail[i].x, trail[i].y);
        ctx.lineTo(trail[i+1].x, trail[i+1].y);
    }
    ctx.stroke();
}

function line(x1,y1,x2,y2){
    ctx.strokeStyle = colors.violet;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function clearSpace(){
    space = [];
}
class Trail{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}

function randomStars(){
    for (i=0;i<200;i++){
        space.push(new Star(Math.random()*c.width,Math.random()*(c.height-185),3));
    }

}

function meteors(){
    n=30;
    p = (c.height-150)/n;
    for (i=0;i<n;i++){

        space.push(new Star(0,p+i*p,2));
        space[space.length-1].v.x = 1
    }

}

function single(){
    let d = (c.height-185)/4
    let r = (c.height-185)/40;
    let vx = 1.5;
    let m2 =(4/3)*Math.PI*Math.pow(r*2, 3)*density;
    
    space.push(new Star(c.width/2,(c.height-185)/2-d,r));
    space[space.length-1].v = createVector(vx,0);
    space.push(new Star(c.width/2,(c.height-185)/2,r*2));
    vx = space[space.length-2].v.x*space[space.length-2].mass/m2
    space[space.length-1].v = createVector(-vx,0);
}

function double(){
    let d = (c.height-185)/1.5
    let r = (c.height-185)/40;
    let vx = 3.946;
    
    space.push(new Star(c.width/2,(c.height-185)/2,r*4));
    space[space.length-1].v = createVector(0,0);

    space.push(new Star(c.width/2,(c.height-185)/2-d/2,r/2));
    space[space.length-1].v = createVector(vx,0);

    space.push(new Star(c.width/2,(c.height-185)/2+d/2,r/2));
    space[space.length-1].v = createVector(-vx,0);
}
function binary(){
    let d = (c.height-185)/2
    let r = (c.height-185)/40;
    let m =(4/3)*Math.PI*Math.pow(r, 3)*density;
    let vx = Math.sqrt((g*2*m)/(4*d));

    space.push(new Star(c.width/2,(c.height-185)/2-d/4,r));
    space[space.length-1].v = createVector(vx,0);
    space.push(new Star(c.width/2,(c.height-185)/2+d/2,r));
    space[space.length-1].v = createVector(-vx,0);
}
function threeBody(){
    let d = 620
    let r = 30.4;
    let v = 0.266;
    let s = 1
    
    let x = c.width/2;
    let y = (c.height-185)/2;

    
    space.push(new Star(x-d/2,y-d/8,r));
    space[space.length-1].v = createVector(s*v,-s*v);

    space.push(new Star(x,y,r));
    space[space.length-1].v = createVector(-2*v,2*v);

    space.push(new Star(x+d/2,y+d/8,r));
    space[space.length-1].v = createVector(s*v,-s*v);
}

class Star {
    constructor(x, y, r){
        this.pos = createVector(x,y);
        this.v = createVector(0,0);
        this.acc = createVector(0,0);
        this.r = r
        this.mass = (4/3)*Math.PI*Math.pow(this.r, 3)*density; //spherical
        //this.mass = Math.PI*this.r*this.r*density //2D
        this.trail = [];

    }
    index(){
        let killIndex = space.findIndex(x => x.pos === this.pos)
        return killIndex
    }
    gravity(){
        let total = 0;
        let force = createVector(0,0);
        this.acc = createVector(0,0)
        for (let other of space){
            if (this == other) continue
            let d = dist(this, other);
            let forceMag = g*this.mass*other.mass/Math.pow(d,2);
            let diff = createVector(other.pos.x, other.pos.y);
            subMag(diff, this.pos)
            setMag(diff, forceMag)
            addMag(force, diff)
            total++
        }
        if (total>0){
            //divMag(force, total);
            divMag(force, this.mass)
            this.acc = force;
        }
    }
    collide(){
        if (deadStars.includes(this.index())) return

        for (let other of space){
            if (this == other) continue
            if (deadStars.includes(other.index())) continue
            let d = dist(this, other);
            if (d > Math.max(this.r, other.r)) continue
            if (this.r > other.r){
                deadStars.push(other.index());
                multMag(other.v, other.mass)
                multMag(this.v, this.mass)
                addMag(this.v, other.v)
                divMag(this.v, this.mass+other.mass)
                this.mass = this.mass + other.mass;
                this.r = Math.cbrt((0.75*this.mass/density)/Math.PI)
                break
            }else{
                deadStars.push(this.index());
                multMag(other.v, other.mass)
                multMag(this.v, this.mass)
                addMag(other.v, this.v)
                divMag(other.v, this.mass+other.mass)
                other.mass = this.mass + other.mass;
                other.r = Math.cbrt((0.75*other.mass/density)/Math.PI)
                break
            }
        }
    }
    update(){
        addMag(this.v, this.acc);
        limit(this.v, maxSpeed)
        addMag(this.pos, this.v);
        let trail_x = this.pos.x;
        let trail_y = this.pos.y;
        let trailpoint = createVector(trail_x, trail_y);
        if (this.trail.length==0){
            this.trail.push(new Trail(this.pos.x, this.pos.y));
        }else if (diffMag(this.trail[this.trail.length-1], trailpoint)>2) this.trail.push(new Trail(trail_x, trail_y));       
        
        
    }
}
var temp_x,
    temp_y,
    temp_r,
    vx,
    vy;


function mouseDown(){
    mouseIsDown = true;
    var rect = c.getBoundingClientRect();
    temp_x = event.clientX - rect.left + 4
    temp_y = event.clientY - rect.top + 3
    temp_r = 1;

}

function mouseUp(){
    mouseIsDown = false;
    
    space.push(new Star(temp_x,temp_y,temp_r));
    vx = (mouse_x-space[space.length-1].pos.x)/100;
    vy = (mouse_y-space[space.length-1].pos.y)/100;
    space[space.length-1].v = createVector(vx,vy);
    
}
var rect = c.getBoundingClientRect();
var mouse_x = null;
var mouse_y = null;
    
document.addEventListener('mousemove', onMouseUpdate, false);
document.addEventListener('mouseenter', onMouseUpdate, false);
    
function onMouseUpdate(e) {
    mouse_x = e.pageX - rect.left + 4;
    mouse_y = e.pageY - rect.top + 3;
}

function getMouseX() {
  return mouse_x;
}

function getMouseY() {
  return mouse_y;
}

function spaceTime(){
    showTrails = document.getElementById("trailSwitch").checked
    if(!showTrails){
        for (let star of space) star.trail = [];
    }
    ctx.clearRect(0, 0, c.width, c.height);
    deadStars = [];
    if (mouseIsDown){
        line(temp_x, temp_y, getMouseX(), getMouseY())

        drawStar(temp_x, temp_y, temp_r);
        temp_r+=0.2
    }
    for (let star of space){
        star.gravity();
        star.update();
        if (space.length>1) star.collide();
    }
    if (deadStars.length>0){
        for (i=0;i<space.length;i++){
            if (deadStars.includes(i)){
                console.log('test')
                space.splice(i, 1);
                let removeIndex = deadStars.findIndex(x => x === i)
                deadStars.splice(removeIndex, 1)
                i--;
            }   
        }
    }
    if (showTrails){   
        for (let star of space){
            drawTrail(star.trail);
        }
    }
    for (let star of space){
        drawStar(star.pos.x, star.pos.y, star.r);  
    }

    window.requestAnimFrame(spaceTime)
}

spaceTime();