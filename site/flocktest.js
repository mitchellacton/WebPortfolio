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

var qTreeShow = document.getElementById("qtreeSwitch").checked,
    nSlider = document.getElementById("boidCount"),
    n = nSlider.value
    separationSlider = document.getElementById("separation"),
    sep = separationSlider.value,
    alignmentSlider = document.getElementById("alignment"),
    aln = alignmentSlider.value,
    cohesionSlider = document.getElementById("cohesion"),
    coh = cohesionSlider.value,
    size = 8,
    cap = 1;
    minimumRadius = 5,
    flying = false,
    stopFlight = false;

runButton = document.getElementById("runBtn");
nSlider.onchange = function(){ //updates array size when user moves slider
    nSlider = document.getElementById("boidCount");
    n = nSlider.value
    clearSky();
}

class Point{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

function stop(){
    if (flying == true) stopFlight = true;
}

function clearSky(){
    ctx.clearRect(0, 0, c.width, c.height);
    flock = [];
    qt.boids = [];
    n = parseInt(document.getElementById("boidCount").value)
    for (i=0;i<n;i++){
        let  boid = new Boid;
        flock.push(boid);
        qt.insert(boid);
    }
    
    for (let boid of flock){
        drawBoid(boid);
    }
    if (qTreeShow) qt.show();
}

class Rectangle{
    constructor(x, y, w, h){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    contains(boid){
        return (boid.position.x >= this.x - this.w &&
                boid.position.x <= this.x + this.w &&
                boid.position.y >= this.y - this.h &&
                boid.position.y <= this.y + this.h);
    }
    intersects(range){
        return !(range.x - range.r > this.x + this.w ||
            range.x + range.r < this.x - this.w ||
            range.y - range.r > this.y + this.h ||
            range.y + range.r < this.y - this.h);
    }

}

class Circle{
    constructor(x, y, r){
        this.x = x;
        this.y = y;
        this.r = r;
        this.rSquared = this.r*this.r;
    }

    inRange(boid){
        let d = Math.pow(boid.position.x - this.x, 2) + Math.pow(boid.position.y - this.y, 2);
        return d <= this.rSquared;
    }
    intersects(range) {
        var xDist = Math.abs(range.x - this.x);
        var yDist = Math.abs(range.y - this.y);
    
        // radius of the circle
        var r = this.r;
    
        var w = range.w;
        var h = range.h;
    
        var edges = Math.pow(xDist - w, 2) + Math.pow(yDist - h, 2);
    
        // no intersection
        if (xDist > r + w || yDist > r + h) return false;
    
        // intersection within the circle
        if (xDist <= w || yDist <= h) return true;
    
        // intersection on the edge of the circle
        return edges <= this.rSquared;
      }
}

class QuadTree{
    constructor(boundary, capacity){
        this.boundary = boundary;
        this.capacity = capacity;
        this.boids = [];
        this.divided = false;
    }

    subdivide(){
        let x = this.boundary.x;
        let y = this.boundary.y;
        let w = this.boundary.w;
        let h = this.boundary.h;

        let nw = new Rectangle(x-w/2, y-h/2, w/2, h/2);
        this.northwest = new QuadTree(nw, this.capacity);
        let ne = new Rectangle(x+w/2, y-h/2, w/2, h/2);
        this.northeast = new QuadTree(ne, this.capacity);
        let sw = new Rectangle(x-w/2, y+h/2, w/2, h/2);
        this.southwest = new QuadTree(sw, this.capacity);
        let se = new Rectangle(x+w/2, y+h/2, w/2, h/2);
        this.southeast = new QuadTree(se, this.capacity);
        this.divided = true;
    }

    

    insert(boid){
        if(!this.boundary.contains(boid)){
           
           return false
        } 

        if (this.boids.length<this.capacity||this.boundary.h*2<minimumRadius){
            this.boids.push(boid);
            return true
        }else{
            if (!this.divided){
                this.subdivide();
                
            }
            if (this.northeast.insert(boid)) {
                return true;
              } else if (this.northwest.insert(boid)) {
                return true;
              } else if (this.southeast.insert(boid)) {
                return true;
              } else if (this.southwest.insert(boid)) {
                return true;
              }


        }
    }

    query(range, found){
        if (!found){
            found = [];
        }
        if (!range.intersects(this.boundary)){
            return found;
        }
        for (let b of this.boids){
            if (range.inRange(b)){
                if (b.position.x == range.x && b.position.y == range.y) continue
                found.push(b);
            }
        }
        if (this.divided){
            this.northwest.query(range, found);
            this.northeast.query(range, found);
            this.southwest.query(range, found);
            this.southeast.query(range, found);
        }
        return found;   
    }

    show(){
        
        ctx.strokeStyle = "#c085ff";
        ctx.beginPath();
        ctx.rect(this.boundary.x-this.boundary.w, this.boundary.y-this.boundary.h, this.boundary.w*2, this.boundary.h*2);
        ctx.stroke();
        if (this.divided){
            this.northwest.show();
            this.northeast.show();
            this.southwest.show();
            this.southeast.show();
        }
    }
}

//Set up
let boundary = new Rectangle(left+screenWidth/2, ceiling+screenHeight/2, screenWidth/2, screenHeight/2);
let qt = new QuadTree(boundary, cap);

function dot(){
    var rect = c.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    // for (i=0;i<100;i++){
    //     let p = new Point( x+(Math.round(Math.random())*2-1)*Math.random()*150, y + (Math.round(Math.random())*2-1)*Math.random()*150)
    //     qt.insert(p);
    
        
    // }
    
    let p = new Point(x,y);
    qt.insert(p)
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.rect(left, ceiling, screenWidth, screenHeight);
    ctx.fill();

 

    if (qTreeShow) qt.show();

    //let points = []
    //qt.query(redRange, points);
    //console.log(points); 

    // ctx.lineWidth = 4;
    // ctx.strokeStyle = '#ff0000';
    // ctx.beginPath();
    // ctx.rect(redRange.x-redRange.w,redRange.y-redRange.h,redRange.w*2,redRange.h*2);
    // ctx.stroke();
    // ctx.lineWidth = 1;

    for (let p of points){
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.rect(p.x,p.y,1,1);
        ctx.stroke();
        ctx.lineWidth = 1;
    }
        
}

function drawBoid(bird){
    let x = bird.position.x;
    let y = bird.position.y;
    let toX = bird.velocity.x;
    let toY = bird.velocity.y;
    

    ctx.fillStyle = bird.col;
    ctx.beginPath();

	let angle = Math.atan2(toY, toX)
	let x2 = size * Math.cos(angle) + x;
	let y2 = size * Math.sin(angle) + y;

	ctx.moveTo(x2, y2);

	angle += (1.0/3.0) * (2 * Math.PI)
	x2 = 0.5*size * Math.cos(angle) + x;
	y2 = 0.5*size * Math.sin(angle) + y;

	ctx.lineTo(x2, y2);

	angle += (1.0/3.0) * (2 * Math.PI)
	x2 = 0.5*size *Math.cos(angle) + x;
	y2 = 0.5*size *Math.sin(angle) + y;

	ctx.lineTo(x2, y2);

	ctx.closePath();
    
	ctx.fill();

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
    return Math.sqrt(Math.pow((b.position.x-a.position.x),2)+Math.pow((b.position.y-a.position.y),2))
}

function vectorMag(vector){
    return Math.sqrt(vector.x*vector.x+vector.y*vector.y)
}

function divMag(vector, mag){
    oldMag = vectorMag(vector);
    newMag = oldMag/mag;
    setMag(vector, newMag);
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

class Boid {
    constructor(){
        this.position = createVector(Math.random()*screenWidth+left,Math.random()*screenHeight+ceiling);
        this.velocity = createVector(Math.random()-0.5, Math.random()-0.5);
        setMag(this.velocity, Math.random()*2+2);
        this.acceleration = createVector(0,0);
        this.maxForce = 0.1;
        this.maxSpeed = 3;
        this.col = '#007ab3';
      }

    edges(){
        if (this.position.x > right){
            this.position.x = left;
        } else if (this.position.x < left){
            this.position.x = right;
        }
        if (this.position.y > bottom){
            this.position.y = ceiling;
        } else if (this.position.y < ceiling){
            this.position.y = bottom;
        }
    }


    align(inSight){
        //let perception = 50;
        let steering = createVector(0,0);
        if (inSight.length == 0) return steering;

        for (let nearby of inSight){
            addMag(steering, nearby.velocity);
        }
        if (inSight.length>0){
            divMag(steering, inSight.length);
            setMag(steering, this.maxSpeed);
            subMag(steering, this.velocity);
            limit(steering, this.maxForce);
      
        }
        return steering
      }
    

    cohesion(inSight){
        //let perception = 50;
        let steering = createVector(0,0);
        if (inSight.length == 0) return steering;

        for (let nearby of inSight){
                addMag(steering, nearby.position);
        }
        if (inSight.length>0){
            divMag(steering, inSight.length);
            subMag(steering, this.position);
            setMag(steering, this.maxSpeed);
            subMag(steering, this.velocity);
            limit(steering, this.maxForce);
        }
        return steering
    }

    separation(inSight){
        let perception = 18;
        let steering = createVector(0,0);
        if (inSight.length == 0) return steering;

        for (let nearby of inSight){
            let d = dist(this, nearby);
            if (d>perception) continue
            let diff = createVector(this.position.x, this.position.y);
            subMag(diff, nearby.position)
            divMag(diff, d*d)
            addMag(steering, diff)
            
        }
        if (inSight.length>0){
            divMag(steering, inSight.length);
            setMag(steering, this.maxSpeed);
            subMag(steering, this.velocity);
            limit(steering, this.maxForce);
        }
        return steering
    }

    adjust(inSight, sep, aln, coh){
        this.acceleration = createVector(0,0);
        let alignment = this.align(inSight);
        let cohesion = this.cohesion(inSight);
        let separation = this.separation(inSight);
        
        
        multMag(separation, sep/100);
        multMag(alignment, aln/100);
        multMag(cohesion, coh/100);
       
        addMag(this.acceleration, alignment);
        addMag(this.acceleration, cohesion);
        addMag(this.acceleration, separation);
    }  
    update(){
        
        addMag(this.velocity, this.acceleration);
        limit(this.velocity, this.maxSpeed);
        addMag(this.position, this.velocity);
        
    }

    show(boid){
        drawBoid(boid);
    }
}

let flock = [];
for (i=0;i<n;i++){
    let  boid = new Boid;
    flock.push(boid);
    qt.insert(boid);
    
}

for (let boid of flock){
    //boid.show();
    drawBoid(boid);
}

function fly(){
    flying = true;
    if (stopFlight == true){
        flying = false;
        stopFlight = false;
        runBtn.disabled = false;
        //clearSky();
        return
    }
    runBtn.disabled = true;
    qTreeShow = document.getElementById("qtreeSwitch").checked
    ctx.clearRect(0, 0, c.width, c.height);
    qt.divided = false;
    qt.boids = [];
    
    separationSlider = document.getElementById("separation");
    sep = parseInt(separationSlider.value);
    alignmentSlider = document.getElementById("alignment");
    aln = parseInt(alignmentSlider.value);
    cohesionSlider = document.getElementById("cohesion");
    coh = parseInt(cohesionSlider.value);
    for (let boid of flock){
        qt.insert(boid);
    }

    for (let boid of flock){
        let nearby = [];
        range = new Circle(boid.position.x, boid.position.y, 50)
        nearby = qt.query(range, nearby);
        boid.edges();
        boid.adjust(nearby, sep, aln, coh);
        boid.update();
        drawBoid(boid);
    }
    if (qTreeShow) qt.show();
    window.requestAnimFrame(fly);
}