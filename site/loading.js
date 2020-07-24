var tick = 0,
    speed = 1,
    xMod = 30,
    yMod = 20,
    rMod = 50,
    r = 15,
    pulse = 0,
    rPulse = 1;
    n = 2;


function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255,50);
  stroke(rPulse,rPulse,rPulse)
  strokeWeight(r/2);
  noFill()
  
  if (abs(sin(tick/xMod))<=0.2 && abs(sin(tick/yMod+PI/n))<=0.2){
    pulse = 1;
  }
  if (pulse == 1){
    rPulse +=4.6;
    
    circle(width/2,height/2,rPulse);
    if (rPulse>= 3*(rMod*2+r)){
      pulse = 0;
      rPulse = 1;
    }
    
  }
  
  noStroke()
  fill(0);
  circle((width/2-rMod*sin(tick/xMod)),height/2+rMod*sin(tick/yMod+PI/n),r)
  circle((width/2+rMod*sin(tick/xMod)),height/2-rMod*sin(tick/yMod+PI/n),r)
  circle((width/2-rMod*sin(tick/xMod)),height/2-rMod*sin(tick/yMod+PI/n),r)
  circle((width/2+rMod*sin(tick/xMod)),height/2+rMod*sin(tick/yMod+PI/n),r)
  tick++
}