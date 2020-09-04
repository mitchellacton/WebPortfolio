var c = document.getElementById('c'),
    ctx = c.getContext('2d');

function resize() { //resizes canvas to fit browser window
    c.width = window.innerWidth;
    c.height = window.innerHeight-125;
    
}

resize();
window.addEventListener("resize", resize); //detects when browser window changes size and reacts to change canvas size

var herbCountSlider = document.getElementById("herbCount");
    herbCount=herbCountSlider.value;
    plantSlider = document.getElementById("plantCount"),
    plantCount=plantSlider.value,
    carnCountSlider = document.getElementById("carnCount");
    carnCount=carnCountSlider.value;
    animRadius = 7,
    plantRadius = 60
    herbFOV = 75,
    carnFOV = 40,
    herbs = [],
    carns = [],
    plants = [],
    objects = [],
    border = plantRadius,
    ceiling = border,
    bottom = c.height-border,
    left = border,
    right = c.width - border,
    gap = 5,
    plantGrowthSlider = document.getElementById("plantGrowth");
    plantGrowthRate=Math.abs(plantGrowthSlider.value-1000);
    mutationChanceSlider = document.getElementById("mutationChance");
    mutationChance=mutationChanceSlider.value;
    mutationStrengthSlider = document.getElementById("mutationStrength");
    mutationSignificance=mutationStrengthSlider.value;
    stopSim = false,
    simRunning = false,
    runButton = document.getElementById("runBtn"),
    tick = 1;
    
plantSlider.onchange = function(){ //updates array size when user moves slider
    if (simRunning == true) stopSim=true;
    slider = document.getElementById("plantCount");
    plantCount=plantSlider.value;
    populate();
}
plantGrowthSlider.onchange = function(){ //updates array size when user moves slider
    plantGrowthSlider = document.getElementById("plantGrowth");
    plantGrowthRate=Math.abs(plantGrowthSlider.value-1000);
}
herbCountSlider.onchange = function(){ //updates array size when user moves slider
    if (simRunning == true) stopSim=true;
    herbCountSlider = document.getElementById("herbCount");
    herbCount=herbCountSlider.value;
    populate();
}
carnCountSlider.onchange = function(){ //updates array size when user moves slider
    if (simRunning == true) stopSim=true;
    carnCountSlider = document.getElementById("carnCount");
    carnCount=carnCountSlider.value;
    populate();
}
mutationChanceSlider.onchange = function(){ //updates array size when user moves slider
    mutationChanceSlider = document.getElementById("mutationChance");
    mutationChance=mutationChanceSlider.value;
}
mutationStrengthSlider.onchange = function(){ //updates array size when user moves slider
    mutationStrengthSlider = document.getElementById("mutationStrength");
    mutationSignificance=mutationStrengthSlider.value;
}

var colors = {
    green: '#27d624',
    red: "#eb1345",
    blue: '#5d9dd9'  
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


function createVector(x,y){
    let output = {
      x: x,
      y: y
    }
    return output
  }

function setMag(vector,mag){
    oldMag = Math.sqrt(vector.x*vector.x+vector.y*vector.y)
    if (oldMag!=0){
        vector.x = vector.x*mag/oldMag
        vector.y = vector.y*mag/oldMag
    }else{
        vector.x = Math.random()-0.5;
        vector.y =Math.random()-0.5;
        limit(vector, mag)
    }
}

function vMag(vector){
    return Math.sqrt(vector.x*vector.x+vector.y*vector.y)
}

function divMag(vector, value){
    vector.x = vector.x/value
    vector.y = vector.y/value

}

function multMag(vector, value){
    vector.x = vector.x*value
    vector.y = vector.y*value
}

function addMag(vector1,vector2){
    vector1.x=vector1.x+vector2.x;
    vector1.y=vector1.y+vector2.y;
}

function subMag(v1,v2){
    v1.x = v1.x-v2.x;
    v1.y = v1.y-v2.y;
}

function limit(vector,mag){
    oldMag = Math.sqrt(vector.x*vector.x+vector.y*vector.y)
    if (oldMag>mag){
        vector.x = vector.x*mag/oldMag
        vector.y = vector.y*mag/oldMag
    }
}

function randn_bm() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function herb (x, y) { //creates a rect object with height and colour
    this.energy = 50;
    this.eating = false;
    this.fov = herbFOV;
    this.v = createVector(Math.random()-0.5,Math.random()-0.5);
    this.maxSpeed = 1;
    //setMag(this.v, Math.random()*this.maxSpeed+0.1);
    this.pos = createVector(x,y)
    this.acc = createVector(0,0);
    this.r = animRadius;
    this.maxForce = 0.025;
    this.decay = 0;
    this.hungry = false;
    this.mating = false;
    this.mateTime = 0
    this.alive = true;
    this.fear = false;
    
}

function carn(x, y){
    this.energy = 50;
    this.eating = false;
    this.fov = carnFOV;
    this.v = createVector(Math.random()-0.5,Math.random()-0.5);
    this.pos = createVector(x,y)
    this.acc = createVector(0,0);
    this.maxSpeed = 1;
    this.maxForce = 0.025;
    this.r = animRadius+3;
    this.decay = 0;
    this.hungry = false;
    this.mating = false;
    this.mateTime = 0

}

function distance(x1,x2,y1,y2){
    return Math.sqrt(Math.pow((x2-x1),2)+Math.pow((y2-y1),2))
}
function plant (x,y,r) { //creates a rect object with height and colour
    this.r = r
    
    if(this.r>plantRadius) this.r=plantRadius;
    if(this.r<5) this.r = 5;
    this.pos = createVector(x,y);

}
function populate(){
    runButton.disabled = false
    if (simRunning == true) stopSim = true
    plants = []
    herbs = []
    carns = []
    objects = []
    //initialize plants
    var protection = 0;
    for(var i=0; i<plantCount; i++) {
        if (protection>10000) break
        plants.push(new plant(Math.random() * ((right) - (left) + 1) + left, Math.random() * ((bottom) - (ceiling) + 1) + ceiling,Math.abs(randn_bm()*plantRadius)/3));
        objects.push(plants[i])
        
        for (j=0;j<plants.length-1;j++){
            if (distance(plants[i].pos.x,plants[j].pos.x,plants[i].pos.y,plants[j].pos.y)<plants[i].r+plants[j].r+gap){
                plants.pop()
                objects.pop()
                i=i-1
                protection++
                break
            }
        }
    }

    //initialize herbivores
    protection = 0;
    for(var i=0; i<herbCount; i++) {
        if (protection>10000) break
        herbs.push(new herb(Math.random() * ((right) - (left) + 1) + left, Math.random() * ((bottom) - (ceiling) + 1) + ceiling));
        objects.push(herbs[i]);
        for (j=0;j<objects.length-1;j++){
            if (distance(herbs[i].pos.x,objects[j].pos.x,herbs[i].pos.y,objects[j].pos.y)<herbs[i].r+objects[j].r+5){          
                herbs.pop()
                objects.pop()
                i=i-1
                protection++
                break
            }
            }
    }

    //initialize carnivores
    protection = 0;
    for(var i=0; i<carnCount; i++) {
        if (protection>10000) break
        carns.push(new carn(Math.random() * ((right) - (left) + 1) + left, Math.random() * ((bottom) - (ceiling) + 1) + ceiling));
        objects.push(carns[i]);
        for (j=0;j<objects.length-1;j++){
            if (distance(carns[i].pos.x,objects[j].pos.x,carns[i].pos.y,objects[j].pos.y)<carns[i].r+objects[j].r+5){          
                carns.pop()
                objects.pop()
                i=i-1
                protection++
                break
            }
            }
    }
    ctx.clearRect(0, 0, c.width, c.height);
    drawSystem();
}
function edges(animals){
    for (i=0;i<animals.length;i++){

        if (animals[i].pos.x > right){
            animals[i].acc.x-= animals[i].maxForce
        } else if (animals[i].pos.x < left){
            animals[i].acc.x+= animals[i].maxForce ;
        }
        if (animals[i].pos.y > bottom){
            animals[i].acc.y-=animals[i].maxForce;
        } else if (animals[i].pos.y < ceiling){
            animals[i].acc.y+=animals[i].maxForce;
        }
        if (animals[i].acc.x != 0 || animals[i].acc.y !=0) setMag(animals[i].acc, animals[i].maxForce*3)
        
    }
    
}

function separation(animals){    
    for (i=0;i<animals.length;i++){
        let total = 0;
        let steering = createVector(0,0);
        for (j=0;j<animals.length;j++){
        let d = distance(animals[i].pos.x, animals[j].pos.x, animals[i].pos.y, animals[j].pos.y)
    
            if (d<2*animals[i].r && i != j){
                let diff = createVector(0,0)
                diff.x = animals[i].pos.x-animals[j].pos.x
                diff.y = animals[i].pos.y-animals[j].pos.y
                //divMag(diff, d*d)
                addMag(steering,diff)
                total++;
            }
        }
        if (total>0){
            divMag(steering, total);
            setMag(steering,animals[i].maxSpeed*3);
            subMag(steering, animals[i].v);
            limit(steering,animals[i].maxForce*3);
            addMag(animals[i].acc, steering);
        }    
    }
}

function refreshPlants(){
    
    for (i=0;i<plants.length;i++){
        
        var eaters = 0;
        for (j=0;j<herbs.length;j++){
            let d = distance(plants[i].pos.x, herbs[j].pos.x, plants[i].pos.y, herbs[j].pos.y);
            if (d<=plants[i].r+herbs[j].r && herbs[j].eating == true) eaters++

        }
        plants[i].r -= (0.1/Math.sqrt(plants[i].r))*eaters
        if (plants[i].r<=0){
            let killIndex = objects.findIndex(x => x.pos ===plants[i].pos)
            objects.splice(killIndex,1);
            plants.splice(i,1)
            i--
        }
        
    }
    if (tick%plantGrowthRate==0){
            let x = Math.random() * ((right) - (left) + 1) + left;
            let y = Math.random() * ((bottom) - (ceiling) + 1) + ceiling; 
            let r = Math.abs(randn_bm()*plantRadius)/3;
            plants.push(new plant(x,y,r));
            objects.push(plants[plants.length-1])
            let protection = 0;
        for (i=0;i<objects.length-1;i++){
            if (protection>30000){
                
                plants.pop()
                objects.pop()
                break;
            } 
            
            if (distance(x,objects[i].pos.x,y,objects[i].pos.y)<objects[i].r+r+gap){
                plants.pop()
                objects.pop()
                let x = Math.random() * ((right) - (left) + 1) + left;
                let y = Math.random() * ((bottom) - (ceiling) + 1) + ceiling; 
                let r = Math.abs(randn_bm()*plantRadius)/3;
                plants.push(new plant(x,y,r));
                objects.push(plants[plants.length-1])
                i=i-1
                protection ++;

            }
}
    }
}

function reproduceHerb(animalA, animalB){
        let x = (animalA.pos.x + animalB.pos.x)/2
        let y = (animalA.pos.y + animalB.pos.y)/2
        
        let fovMutate = Math.random()*100;
        let speedMutate = Math.random()*100;
        let forceMutate = Math.random()*100;
        
        herbs.push(new herb(x,y))
        //child inherits average of parents' traits
        herbs[herbs.length-1].fov = (animalA.fov+animalB.fov)/2
        herbs[herbs.length-1].maxSpeed = (animalA.maxSpeed+animalB.maxSpeed)/2
        herbs[herbs.length-1].maxForce = (animalA.maxForce+animalB.maxForce)/2
        //mutations applied if triggered
        if (fovMutate<=mutationChance) herbs[herbs.length-1].fov = herbs[herbs.length-1].fov*(1+(Math.round(Math.random()) * 2 - 1)*mutationSignificance/100)
        if (speedMutate<=mutationChance) herbs[herbs.length-1].maxSpeed = herbs[herbs.length-1].maxSpeed*(1+(Math.round(Math.random()) * 2 - 1)*mutationSignificance/100)
        if (forceMutate<=mutationChance) herbs[herbs.length-1].maxForce = herbs[herbs.length-1].maxForce*(1+(Math.round(Math.random()) * 2 - 1)*mutationSignificance/100)

        objects.push(herbs[herbs.length-1])        
    }

    function reproduceCarn(animalA, animalB){
        let x = (animalA.pos.x + animalB.pos.x)/2
        let y = (animalA.pos.y + animalB.pos.y)/2
        
        let fovMutate = Math.random()*100;
        let speedMutate = Math.random()*100;
        let forceMutate = Math.random()*100;
        
        carns.push(new carn(x,y))
        //child inherits average of parents' traits
        carns[carns.length-1].fov = (animalA.fov+animalB.fov)/2
        carns[carns.length-1].maxSpeed = (animalA.maxSpeed+animalB.maxSpeed)/2
        carns[carns.length-1].maxForce = (animalA.maxForce+animalB.maxForce)/2
        //mutations applied if triggered
        if (fovMutate<=mutationChance) carns[carns.length-1].fov = carns[carns.length-1].fov*(1+(Math.round(Math.random()) * 2 - 1)*mutationSignificance/100)
        if (speedMutate<=mutationChance) carns[carns.length-1].maxSpeed = carns[carns.length-1].maxSpeed*(1+(Math.round(Math.random()) * 2 - 1)*mutationSignificance/100)
        if (forceMutate<=mutationChance) carns[carns.length-1].maxForce = carns[carns.length-1].maxForce*(1+(Math.round(Math.random()) * 2 - 1)*mutationSignificance/100)

        objects.push(carns[carns.length-1])        
    }

function carnSearch(){
    for (i=0;i<carns.length;i++){
        carns[i].eating = false;

        let herbDistance = 10000;
        let closestHerb = -1
        let steering = createVector(0,0);
        for (j=0;j<herbs.length;j++){

            let d = distance(carns[i].pos.x, herbs[j].pos.x, carns[i].pos.y, herbs[j].pos.y)-herbs[j].r
            if (d<carns[i].fov){
                if (d<herbDistance){
                    herbDistance = d
                    closestHerb = j
                }
            }
        }
        if (closestHerb>-1){
            let diff = createVector(0,0)
            diff.x = herbs[closestHerb].pos.x-carns[i].pos.x
            diff.y = herbs[closestHerb].pos.y-carns[i].pos.y

            if (carns[i].hungry == true){
                addMag(steering,diff)
                setMag(steering,carns[i].maxSpeed);
                subMag(steering, carns[i].v);
                limit(steering,carns[i].maxForce);
                addMag(carns[i].acc, steering);
            }
            if (herbDistance<=herbs[closestHerb].r+carns[i].r-herbs[closestHerb].r){
                if (carns[i].hungry == true){
                    carns[i].eating = true;
                    setMag(carns[i].v,0);
                    carns[i].acc = createVector(0,0);
                }
            }
        
        }
    
        let plantDistance = 10000;
        let closestPlant = -1
        steering = createVector(0,0);
        for (j=0;j<plants.length;j++){
            
            let d = distance(carns[i].pos.x, plants[j].pos.x, carns[i].pos.y, plants[j].pos.y)-plants[j].r
            if (d<carns[i].fov){//+plants[j].r){
                if (d<plantDistance){
                    plantDistance = d
                    closestPlant = j

                    
                }
            }
        }
        if (closestPlant>-1){
            let diff = createVector(0,0)
            diff.x = plants[closestPlant].pos.x-carns[i].pos.x
            diff.y = plants[closestPlant].pos.y-carns[i].pos.y
            
            if (plantDistance<=plants[closestPlant].r+carns[i].r-plants[closestPlant].r){
                addMag(steering,diff)
                setMag(steering,-30*carns[i].maxSpeed*2);
                subMag(steering, carns[i].v);
                limit(steering,carns[i].maxSpeed);
                addMag(carns[i].acc, steering);
                continue
            }
        }

        //mating start
        if (carns[i].hungry==false && carns[i].mating == false && carns[i].energy<95){
            //search through all other herbivores
            let closestCarn = -1;
            let closestDist = 10000;
            let mateSteer = createVector(0,0);
            for (j=0;j<carns.length;j++){
                if (j==i) continue
                if (carns[j].hungry == true || carns[j].mating == true) continue
                //find nearest herbivore who is also not hungry and not mating
                let carnDist = distance(carns[i].pos.x, carns[j].pos.x, carns[i].pos.y, carns[j].pos.y)
                if (carnDist<closestDist && carnDist<=carns[i].fov){
                    closestDist = carnDist;
                    closestCarn = j
                    //index of nearest herbivore could change
                    //different herbivore could move closer, changing which herbivore is nearest
                }
            }
            //steer toward nearest herbivore
            if (closestCarn>-1){
                
                let diff = createVector(0,0)
                diff.x = carns[closestCarn].pos.x-carns[i].pos.x
                diff.y = carns[closestCarn].pos.y-carns[i].pos.y
                addMag(mateSteer,diff)
                setMag(mateSteer,carns[i].maxSpeed);
                subMag(mateSteer, carns[i].v);
                limit(mateSteer,carns[i].maxForce);
                addMag(carns[i].acc, mateSteer);
                limit(carns[i].acc,carns[i].maxForce);
                if (closestDist <= 2*carns[i].r){
                    setMag(carns[i].v,0)
                    setMag(carns[i].acc,0)
                    carns[i].mating = true;
                    carns[closestCarn].mating = true;
                }else{
                    carns[i].mating = false;
                    carns[i].mateTime = 0;
                }

            }
            //stick to nearest herbivore for 200 ticks, mating = true

            //reproduce, set mating to false, make herbivore hungry
            
        }
        if (carns[i].mating == true){
            setMag(carns[i].v,0)
            setMag(carns[i].acc,0)
            carns[i].mateTime+=0.1
            if (carns[i].mateTime>=120){
                
                carns[i].energy = Math.min(49.9,carns[i].energy-30)
                carns[i].hungry = true
                

                let closestCarn = -1;
                let closestDist = 10000;
                for (j=0;j<carns.length;j++){
                    if (j==i) continue
                    if (carns[j].hungry == false) continue
                    
                    let carnDist = distance(carns[i].pos.x, carns[j].pos.x, carns[i].pos.y, carns[j].pos.y)
                    if (carnDist<closestDist && carnDist<=carns[i].fov){
                        closestDist = carnDist;
                        closestCarn = j
                        
                    }
                }
                carns[i].mating = false;
                carns[i].mateTime = 0
                
                if (closestCarn>-1){
                    reproduceCarn(carns[i],carns[closestCarn])
                    carns[closestCarn].mating = false;
                    carns[closestCarn].mateTime = 0
                }
                

            }

        }   
        //mating end

        if (carns[i].eating == false && carns[i].mating == false && vMag(carns[i].acc) == 0){
            steering.x = carns[i].v.x
            steering.y = carns[i].v.y
            setMag(steering,carns[i].maxForce);
            addMag(carns[i].acc,steering)
            limit(carns[i].acc,carns[i].maxForce)
        }
    }
}




function herbSearch(){
    for (i=0;i<herbs.length;i++){
        
        herbs[i].eating = false;
        let plantDistance = 10000;
        let closestPlant = -1
        let steering = createVector(0,0);
        for (j=0;j<plants.length;j++){
            
            let d = distance(herbs[i].pos.x, plants[j].pos.x, herbs[i].pos.y, plants[j].pos.y)-plants[j].r
            if (d<herbs[i].fov){
                if (d<plantDistance){
                    plantDistance = d
                    closestPlant = j
                }

            }
        }
        if (closestPlant>-1){
            let diff = createVector(0,0)
            diff.x = plants[closestPlant].pos.x-herbs[i].pos.x
            diff.y = plants[closestPlant].pos.y-herbs[i].pos.y
            if (herbs[i].hungry == true && herbs[i].fear == false){
                addMag(steering,diff)
                setMag(steering,herbs[i].maxSpeed);
                subMag(steering, herbs[i].v);
                limit(steering,herbs[i].maxForce);
                addMag(herbs[i].acc, steering);
            }
            if (plantDistance<=plants[closestPlant].r+herbs[i].r-plants[closestPlant].r){
                if (herbs[i].hungry == true && herbs[i].fear == false){
                    herbs[i].eating = true;
                    setMag(herbs[i].v,0);
                    herbs[i].acc = createVector(0,0);
                }else{
                    herbs[i].eating = false;
                    addMag(steering,diff)
                    setMag(steering,-30*herbs[i].maxSpeed*2);
                    subMag(steering, herbs[i].v);
                    limit(steering,herbs[i].maxSpeed);
                    addMag(herbs[i].acc, steering);
                }
                
            }
        }else{
            herbs[i].eating = false
        }
        steering = createVector(0,0);
        let total = 0;
        let eaters = 0;
        for (j=0;j<carns.length;j++){
            d = distance(herbs[i].pos.x, carns[j].pos.x, herbs[i].pos.y, carns[j].pos.y)
            if (d<Math.min(100,herbs[i].fov)+carns[j].r){
                let diff = createVector(0,0)
                diff.x = herbs[i].pos.x-carns[j].pos.x
                diff.y = herbs[i].pos.y-carns[j].pos.y
                divMag(diff, d*d)
                addMag(steering,diff)
                total++
            }
            if (d<=herbs[i].r+carns[j].r && carns[j].hungry == true){
                eaters++
            }
        }
        if (eaters>0){
            herbs[i].alive = false;
            herbs[i].r-=0.02*eaters
            if (herbs[i].r<0) herbs[i].r = 0;
            
        }
        if (total>0){
            herbs[i].fear = true;
            herbs[i].mateTime = 0
            herbs[i].mating = false;
            divMag(steering, total);
            setMag(steering,herbs[i].maxSpeed*3);
            subMag(steering, herbs[i].v);
            limit(steering,herbs[i].maxForce);
            addMag(herbs[i].acc, steering);
        } else herbs[i].fear = false;


        if (herbs[i].hungry==false && herbs[i].mating == false && herbs[i].energy<90 && herbs[i].fear == false){
            //search through all other herbivores
            let closestHerb = -1;
            let closestDist = 10000;
            let mateSteer = createVector(0,0);
            for (j=0;j<herbs.length;j++){
                if (j==i) continue
                if (herbs[j].hungry == true || herbs[j].mating == true || herbs[j].fear == true || herbs[j].alive == false) continue
                //find nearest herbivore who is also not hungry and not mating
                let herbDist = distance(herbs[i].pos.x, herbs[j].pos.x, herbs[i].pos.y, herbs[j].pos.y)
                if (herbDist<closestDist && herbDist<=herbs[i].fov){
                    closestDist = herbDist;
                    closestHerb = j
                    //index of nearest herbivore could change
                    //different herbivore could move closer, changing which herbivore is nearest
                }
            }
            //steer toward nearest herbivore
            if (closestHerb>-1){
                
                let diff = createVector(0,0)
                diff.x = herbs[closestHerb].pos.x-herbs[i].pos.x
                diff.y = herbs[closestHerb].pos.y-herbs[i].pos.y
                addMag(mateSteer,diff)
                setMag(mateSteer,herbs[i].maxSpeed);
                subMag(mateSteer, herbs[i].v);
                limit(mateSteer,herbs[i].maxForce);
                addMag(herbs[i].acc, mateSteer);
                limit(herbs[i].acc,herbs[i].maxForce);
                if (closestDist <= 2*herbs[i].r){
                    setMag(herbs[i].v,0)
                    setMag(herbs[i].acc,0)
                    herbs[i].mating = true;
                    herbs[closestHerb].mating = true;
                }else{
                    herbs[i].mating = false;
                    herbs[i].mateTime = 0;
                }

            }
            //stick to nearest herbivore for 200 ticks, mating = true

            //reproduce, set mating to false, make herbivore hungry
            
        }
        if (herbs[i].mating == true && herbs[i].fear == false){
            setMag(herbs[i].v,0)
            setMag(herbs[i].acc,0)
            herbs[i].mateTime+=0.1
            if (herbs[i].mateTime>=60){
                
                herbs[i].energy = Math.min(49.9,herbs[i].energy-30)
                herbs[i].hungry = true
                

                let closestHerb = -1;
                let closestDist = 10000;
                for (j=0;j<herbs.length;j++){
                    if (j==i) continue
                    if (herbs[j].hungry == false) continue
                    
                    let herbDist = distance(herbs[i].pos.x, herbs[j].pos.x, herbs[i].pos.y, herbs[j].pos.y)
                    if (herbDist<closestDist && herbDist<=herbs[i].fov){
                        closestDist = herbDist;
                        closestHerb = j
                        
                    }
                }
                herbs[i].mating = false;
                herbs[i].mateTime = 0
                
                if (closestHerb>-1){
                    reproduceHerb(herbs[i],herbs[closestHerb])
                    herbs[closestHerb].mating = false;
                    herbs[closestHerb].mateTime = 0
                }
                

            }

        }       
            
            
        if (herbs[i].eating == false && herbs[i].mating == false && vMag(herbs[i].acc) == 0){
            steering.x = herbs[i].v.x
            steering.y = herbs[i].v.y
            setMag(steering,herbs[i].maxForce);
            addMag(herbs[i].acc,steering)
            limit(herbs[i].acc,herbs[i].maxForce)
        }
        
    }
    
}

function drawSystem(){
    for (i=0;i<plants.length;i++){
        ctx.fillStyle = colors.green;
        ctx.beginPath();
        ctx.arc(plants[i].pos.x, plants[i].pos.y, plants[i].r, 0, 2 * Math.PI);
        ctx.fill();
    }

    for (i=0;i<herbs.length;i++){
        ctx.fillStyle = colors.blue;
        ctx.beginPath();
        ctx.arc(herbs[i].pos.x, herbs[i].pos.y, herbs[i].r, 0, 2 * Math.PI);
        ctx.fill();
    }

    for (i=0;i<carns.length;i++){
        ctx.fillStyle = colors.red;
        ctx.beginPath();
        ctx.arc(carns[i].pos.x, carns[i].pos.y, carns[i].r, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function refreshCarns(){
    for (i=0;i<carns.length;i++) carns[i].acc = createVector(0,0);
        separation(carns)
        edges(carns);
        carnSearch();

        for (i=0;i<carns.length;i++){
            if (carns[i].energy<50) carns[i].hungry = true;
            if (carns[i].energy>=100) carns[i].hungry = false;
            if (carns[i].mating == true) carns[i].mateTime += 0.1
            
            if (carns[i].energy>0){
                addMag(carns[i].v,carns[i].acc);
                limit(carns[i].v, carns[i].maxSpeed);
                addMag(carns[i].pos,carns[i].v)
            }else{ //death case
                setMag(carns[i].v,Math.max(vMag(carns[i].v)-carns[i].maxSpeed/200,0))
                addMag(carns[i].pos,carns[i].v)
                carns[i].decay++
                if (carns[i].decay >=300){
                    let killIndex = objects.findIndex(x => x.pos ===carns[i].pos)
    
                    objects.splice(killIndex,1);
                    carns.splice(i,1);
                    i--
                }
                continue 
    
            }
            if (carns[i].eating == true){carns[i].energy = Math.min(carns[i].energy+0.7,100);
            }else carns[i].energy-=(3*vMag(carns[i].acc)+(vMag(carns[i].v)/2)*(vMag(carns[i].v)/2)+(carns[i].fov/250))/30
        }
}

function refreshHerbs(){
    for (i=0;i<herbs.length;i++) herbs[i].acc = createVector(0,0);
    separation(herbs)
    edges(herbs);
    herbSearch();
    
    for (i=0;i<herbs.length;i++){
        if (herbs[i].energy<50) herbs[i].hungry = true;
        if (herbs[i].energy>=100) herbs[i].hungry = false;
        if (herbs[i].mating == true) herbs[i].mateTime += 0.1
        
        if (herbs[i].alive == false){
            herbs[i].v = createVector(0,0);
            herbs[i].decay++
            if (herbs[i].decay >=300) herbs[i].r = 0;
            if (herbs[i].r<=0){
                objects.splice(objects.findIndex(x => x.pos ===herbs[i].pos),1)
                herbs.splice(i,1)
                i--
                continue
            }
        }
        
        if (herbs[i].energy>0){
            addMag(herbs[i].v,herbs[i].acc);
            limit(herbs[i].v, herbs[i].maxSpeed);
            addMag(herbs[i].pos,herbs[i].v)
        }else{ //death case
            setMag(herbs[i].v,Math.max(vMag(herbs[i].v)-herbs[i].maxSpeed/200,0))
            addMag(herbs[i].pos,herbs[i].v)
            herbs[i].decay++
            if (herbs[i].decay >=300){
                let killIndex = objects.findIndex(x => x.pos ===herbs[i].pos)

                objects.splice(killIndex,1);
                herbs.splice(i,1);
                i--
            }
            continue 

        }
        if (herbs[i].eating == true){herbs[i].energy = Math.min(herbs[i].energy+0.25,100);
        }else herbs[i].energy-=(3*vMag(herbs[i].acc)+(vMag(herbs[i].v)/2)*(vMag(herbs[i].v)/2)+(herbs[i].fov/250))/30
    }
}


populate();

function update(){
    runButton.disabled = true
    if (stopSim == true){
        runButton.disabled = false
        stopSim = false;
        simRunning = false;
        return
    }
    simRunning = true;
    objects = []
    objects = herbs.concat(plants)
    objects = objects.concat(carns)
    refreshHerbs();
    refreshCarns();
    refreshPlants();
    

    ctx.clearRect(0, 0, c.width, c.height);
    drawSystem()
    tick++
   
    window.requestAnimFrame(update);
}
