/**
 * Created by bauke_000 on 11-10-2017.
 */


var camera, scene, renderer;
var controls;

var mesh,mixer,target,geo;
var playerCol = 2.5;
var entityId = 0;
var entityCounter = 0;
var waypointId = 0;
var wallId = 0;
var action = {};
var waypoints = [];
var time = new THREE.Clock;
var player = null;
var damageHandler = new DamageHandler();
var maxentitiesonfield = 20;
var totalentitiesspawned = 0;
var wavesize = 5;
var wavemultiplier = 1.2;
var waveround = 0;
var countdown = new THREE.Clock;
var wavespawned = false;

var waittimer = true;
var randomdmg = null;
var randomhp = null;
var mindmg = 5;
var maxdmg = 15;
var maxmaxdmg = 40;
var maxmindmg = 30;
var minhp = 75;
var maxhp = 125;
var maxminhp = 200;
var maxmaxhp = 400;
var statmultiplier = 1.05;
var spawnlocations = [new THREE.Vector3(0, 0, -44), new THREE.Vector3(0, 0, 57), new THREE.Vector3(-59, 0, 2), new THREE.Vector3(59, 0, 2)];

var playercollision = false;
var startcountdown = true;
var startwave = false;
var positx = 22;
var positz = 1;
var collision = [];
var collisionp = [];
var charactertextures = [];
charactertextures.push('models/CharacterProject.json');
charactertextures.push('models/CharacterProject2.json');
charactertextures.push('models/CharacterProject3.json');
charactertextures.push('models/CharacterProject4.json');
charactertextures.push('models/CharacterProject5.json');
charactertextures.push('models/CharacterProject7.json');

var worldobjecttextures = [];
worldobjecttextures.push('models/digibord.json'); //0
worldobjecttextures.push('models/kast_dicht.json');//1
worldobjecttextures.push('models/kast_open.json');//2
worldobjecttextures.push('models/Wall.json');//3
worldobjecttextures.push('models/poster.json');//4
worldobjecttextures.push('models/prullenbak.json');//5
worldobjecttextures.push('models/Windowframe.json');//6
worldobjecttextures.push('models/tafel_docent.json');//7
worldobjecttextures.push('models/tafel_leerling.json');//8
worldobjecttextures.push('models/Doorframe.json');//9

var worldobjects = [];
var correctobjects = [];
var worldobjectGroup = new THREE.Group();
var worldobjectId = 0;
var nocollision = true;
var cornerx;
var cornerz;
var colliders = [];
var colliderid = 0;
var colliderGroup = new THREE.Group();
var raycaster;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
var entities = [];
var objects = [];
var objectCollisions = new THREE.Group();
var entitiesGroup = new THREE.Group();
var loader = new THREE.JSONLoader();

if ( havePointerLock ) {

    var element = document.body;

    var pointerlockchange = function ( event ) {

        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

            controlsEnabled = true;
            controls.enabled = true;

            blocker.style.display = 'none';

        } else {

            controls.enabled = false;

            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';

            instructions.style.display = '';

        }

    };

    var pointerlockerror = function ( event ) {

        instructions.style.display = '';

    };

    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

    document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

    instructions.addEventListener( 'click', function ( event ) {

        instructions.style.display = 'none';

        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();

    }, false );

} else {

    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

init();
setTimeout(function(){
    render();
}, 2000);

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();

function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    scene = new THREE.Scene();

    controls = new THREE.PointerLockControls( camera );
    player = new Player(controls.getObject(),30,0,1,2.5,100,5,20,800);
    scene.add(objectCollisions);
    scene.add(entitiesGroup);
    scene.add(worldobjectGroup);
    scene.add(colliderGroup);
    colliderGroup.add(player.getMesh);
    createScene();
    var onKeyDown = function ( event ) {

        switch ( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true; break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 32: // space
                //if ( canJump === true ) velocity.y += 150;
                //canJump = false;
                break;

            case 69: // e
                //addEntity(controls.getObject().position.x,controls.getObject().position.z,200,10,3.5);
                break;
        }
    };

    var onKeyUp = function ( event ) {

        switch( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

        }

    };

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    raycaster = new THREE.Raycaster();



    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function render() {

    requestAnimationFrame( render );
    if ( controlsEnabled ) {

        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;
        calcnextMovement(delta);
        if(nocollision) {
            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;

            velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

            if (moveForward && !playercollision) velocity.z -= 200.0 * delta;
            if (moveForward && playercollision) velocity.z -= 10.0 * delta;
            if (moveBackward && !playercollision) velocity.z += 200.0 * delta;
            if (moveBackward && playercollision) velocity.z += 10.0 * delta;

            if (moveLeft && !playercollision) velocity.x -= 200.0 * delta;
            if (moveLeft && playercollision) velocity.x -= 10.0 * delta;
            if (moveRight && !playercollision) velocity.x += 200.0 * delta;
            if (moveRight && playercollision) velocity.x += 10.0 * delta;

            controls.getObject().translateX(velocity.x * delta);
            controls.getObject().translateY(velocity.y * delta);
            controls.getObject().translateZ(velocity.z * delta);
        }

        if ( controls.getObject().position.y < 5 ) {

            velocity.y = 0;
            controls.getObject().position.y = 5;

            canJump = true;
        }

        for(var a = 0; a < entities.length; a++) {
            for(var b = a + 1; b < entities.length; b++) {
                collision = entities[a].entitycollisionCheck(entities[b]);
                if(collision){
                    entities[a].entitycollision(entities[b]);
                }
                if(entities[a].isDeath){
                    entities[b].speed = 10;
                }
                if(entities[b].isDeath){
                    entities[a].speed = 10;
                }
            }
        }

        for(var i = 0; i < entities.length; i++){
            collisionp = player.playerCollisionCheck(entities[i]);
            if(collisionp){
                playercollision = true;
            }
            if(!collisionp){
                playercollision = false;
            }
        }

        prevTime = time;

    }
    window.onkeydown = function(e) {
        return !(e.keyCode == 32);
    };

    if(!player.isDeath){
        player.updatePlayer(entitiesGroup,damageHandler,entities);
    }

    AIMovement();
    updateSpeed();

    if(totalentitiesspawned == wavesize && entityCounter == 0 && startcountdown || waveround == 0){
        startwave = false;
        countdown.start();
        waveround++;
        var elem = document.getElementById('waveAmount');
        elem.innerHTML = "Wave: " + waveround;
        totalentitiesspawned = 0;
        wavesize = Math.ceil(wavesize * wavemultiplier);
        mindmg = Math.ceil(mindmg * statmultiplier);
        maxdmg = Math.ceil(maxdmg * statmultiplier);
        minhp = Math.ceil(minhp * statmultiplier);
        maxhp = Math.ceil(maxhp * statmultiplier);
        if(maxhp > maxmaxhp){
            maxhp = maxmaxhp;
        }
        if(minhp > maxminhp){
            minhp = maxminhp;
        }
        if(maxdmg > maxmaxdmg){
            maxdmg = maxmaxdmg;
        }
        if(mindmg > maxmindmg){
            mindmg = maxmindmg;
        }
        startcountdown = false;
    }

    if(startwave && waittimer){
        waittimer = false;
        setTimeout(function(){
            if(startwave){
                setWavesize();
                startcountdown = true;
            }
            waittimer = true;
        }, 1000);
    }

    if(countdown.getElapsedTime() <= 10){
        var elem = document.getElementById("waveCountDown");
        elem.style.display = 'block';
        elem.innerHTML = "Wave starts in: " + (10 - countdown.getElapsedTime());
    }
    if(countdown.getElapsedTime() >= 10){
        countdown.stop();
        startwave = true;
        var elem = document.getElementById("waveCountDown");
        elem.style.display = 'none';
    }

    renderer.render( scene, camera );

}

function createScene(){

    scene.background = new THREE.Color( 0x0099ff );

    var light = new THREE.SpotLight(0xfff0b3, 1, 0, Math.PI / 2);
    light.position.set(0, 50, -60);
    scene.add( light );
    var light1 = new THREE.SpotLight(0xfff0b3, 1, 0, Math.PI / 2);
    light1.position.set(0, 50, 60);
    scene.add( light1 );
    var light2 = new THREE.SpotLight(0xfff0b3, 1, 0, Math.PI / 2);
    light2.position.set(-60, 50, 0);
    scene.add( light2 );
    var light3 = new THREE.SpotLight(0xfff0b3, 1, 0, Math.PI / 2);
    light3.position.set(60, 50, 0);
    scene.add( light3 );

    var texture = new THREE.TextureLoader().load("textures/Redcarpet.png");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20);
    var floorMaterial = new THREE.MeshPhongMaterial( { map: texture } );
    floorMaterial.shininess = 0.1;
    var floor = new THREE.Mesh( new THREE.PlaneBufferGeometry( 300,
        300, 2, 2), floorMaterial);
    floor.position.y = 0;
    floor.rotation.x = - Math.PI / 2;
    scene.add(floor);

    //0 digibord
    //1 kast dicht
    //2 kast open
    //3 muur
    //4 poster
    //5 prullenbak
    //6 raam
    //7 tafel docent
    //8 tafel leerling
    //9 doorframe
    //Z is de hoogte!
    //addWall(10,30,10,-30,5,0);
    //addWall(10,10,30,0,5,0);
   // addWall(30,10,10,40,5,-30);
    addObject(3,-70,0,5,0,0,0,1.5,1.5,5);//wall
    addObject(3,0,0,-50,0,90,0,1.5,1.5,7.2);//wall
    addObject(3,0,0,60.5,0,90,0,1.5,1.5,7.2);//wall
    addObject(3,70,0,5,0,0,0,1.5,1.5,5);//wall

    addObject(6,-70,0,-40,0,0,0,1.5,1.5,1.7);//window
    addObject(6,-60,0,-50,0,90,0,1.5,1.5,1.7);//window
    addObject(6,60,0,-50,0,90,0,1.5,1.5,1.7);//window
    addObject(6,70,0,-40,0,0,0,1.5,1.5,1.7);//window
    addObject(6,-70,0,50,0,0,0,1.5,1.5,1.7);//window
    addObject(6,-60,0,60.5,0,90,0,1.5,1.5,1.7);//window
    addObject(6,60,0,60.5,0,90,0,1.5,1.5,1.7);//window
    addObject(6,70,0,50,0,0,0,1.5,1.5,1.7);//window

    addObject(2,45.9,0,44.5,0,0,0,2.5,2.5,7);//kast open
    addObject(2,-41.9,0,47,0,90,0,2.5,2.5,7);//kast open
    addObject(2,-41.9,0,29.9,0,-90,0,2.5,2.5,7);//kast open
    addObject(2,0.3,0,8.1,0,90,0,2.5,2.5,7);//kast open
    addObject(2,0.3,0,-18.2,0,-90,0,2.5,2.5,7);//kast open
    addObject(2,-43,0,-36.8,0,180,0,2.5,2.5,7);//kast open
    addObject(2,-16.9,0,44.5,0,180,0,2.5,2.5,7);//kast open
    addObject(2,13.1,0,44.5,0,0,0,2.5,2.5,7);//kast open

    addObject(1,56.5,0,-20.7,0,-90,0,2.5,2.5,2.5);//kast dicht
    addObject(1,42,0,-20.7,0,-90,0,2.5,2.5,2.5);//kast dicht
    addObject(1,-57.3,0,-20.7,0,-90,0,2.5,2.5,2.5);//kast dicht
    addObject(1,-39.3,0,-20.7,0,-90,0,2.5,2.5,2.5);//kast dicht

    addObject(7,34.3,0,44.5,0,0,0,4,4,4);//tafel docent
    addObject(7,20.8,0,24.2,0,90,0,4,4,4);//tafel docent
    addObject(7,-0.2,0,24.2,0,90,0,4,4,4);//tafel docent
    addObject(7,-21.2,0,24.2,0,90,0,4,4,4);//tafel docent
    addObject(7,-21.2,0,-28.8,0,-90,0,4,4,4);//tafel docent
    addObject(7,20.8,0,-29.7,0,-90,0,4,4,4);//tafel docent
    addObject(7,53.3,0,-35.9,0,0,0,4,4,4);//tafel docent

    addObject(0,69.1,2,2.4,0,0,0,3.7,3.7,3.7);//digibord
    addObject(0,-68.9,2,2.4,0,180,0,3.7,3.7,3.7);//digibord

    addObject(8,50.4,0,2.4,0,0,0,4,4,4);//tafel leerling
    addObject(8,36.5,0,2.4,0,0,0,4,4,4);//tafel leerling
    addObject(8,-48,0,2.4,0,180,0,4,4,4);//tafel leerling
    addObject(8,-34,0,2.4,0,180,0,4,4,4);//tafel leerling

    addObject(4,-0.3,3,-49.5,0,-90,0,2.5,2.5,2.5);//poster
    addObject(4,-0.3,3,60,0,90,0,2.5,2.5,2.5);//poster
}

function addObject(indexnr,posx,posy,posz,rotationx,rotationy,rotationz,scalex,scaley,scalez){
    function addWorldObject(geometry, materials) {
        materials.forEach( function ( material ) {
            material.shininess = 0.1;
        } );
        var cube = null;
        mesh = new THREE.Mesh(geometry, materials);
        mesh.scale.set(scalex,scaley,scalez);
        var rotationradx = (rotationx * Math.PI)/180;
        var rotationrady = (rotationy * Math.PI)/180;
        var rotationradz = (rotationz * Math.PI)/180;
        mesh.rotation.set(rotationradx,rotationrady,rotationradz);
        worldobjectId++;
        if(indexnr == 7){
            var material2 = new THREE.MeshPhongMaterial({color: 0x0000ff, opacity: 0, transparent: true});
            var geometry2 = new THREE.BoxGeometry(4.8,20,9.6);
            cube = new THREE.Mesh(geometry2,material2);
            cube.rotation.set(0,rotationrady,0);
            cube.position.set(posx,posy,posz);
        }
        if(indexnr == 8){
            var material2 = new THREE.MeshPhongMaterial({color: 0x0000ff, opacity: 0, transparent: true});
            var geometry2 = new THREE.BoxGeometry(4.7,20,10.9);
            cube = new THREE.Mesh(geometry2,material2);
            cube.rotation.set(0,rotationrady,0);
            cube.position.set(posx,posy,posz);
        }
        if(indexnr == 1){
            var material2 = new THREE.MeshPhongMaterial({color: 0x0000ff, opacity: 0, transparent: true});
            var geometry2 = new THREE.BoxGeometry(4.01,20,6.36);
            cube = new THREE.Mesh(geometry2,material2);
            cube.rotation.set(0,rotationrady,0);
            cube.position.set(posx,posy,posz);
        }
        if(indexnr == 2){
            var material2 = new THREE.MeshPhongMaterial({color: 0x0000ff, opacity: 0, transparent: true});
            var geometry2 = new THREE.BoxGeometry(2.17,20,13.7);
            cube = new THREE.Mesh(geometry2,material2);
            cube.rotation.set(0,rotationrady,0);
            cube.position.set(posx,posy,posz);
        }
        worldobjects.push(new WorldObject(worldobjectId, posx, posy, posz, mesh, indexnr, rotationy,cube));
        worldobjectGroup.add(worldobjects[worldobjects.length - 1].objectMesh);
        if(indexnr == 7 || indexnr == 8 || indexnr == 1 || indexnr == 2){
            colliderGroup.add(worldobjects[worldobjects.length - 1].CubeMesh);
            var obj = worldobjects[worldobjects.length - 1].CubeMesh;
            obj.userData = {
                ID: worldobjectId.toString()
            }
        }
        else{
            colliderGroup.add(worldobjects[worldobjects.length - 1].objectMesh);
        }
        generateWaypoints(worldobjects.length - 1);
        var object = worldobjects[worldobjects.length - 1].objectMesh;
        object.userData = {
            ID: worldobjectId.toString()
        }
    }
    loader.load(worldobjecttextures[indexnr], addWorldObject);
}

function addEntity(spawnposition,health,dmg,range){
    function addCharacter(geometry, materials) {
        materials.forEach( function ( material ) {
            material.skinning = true;
            material.shininess = 0.1;
        } );
        mesh = new THREE.SkinnedMesh(geometry, materials);
        geo = geometry;
        mixer = new THREE.AnimationMixer( mesh );
        onDone(spawnposition,health,dmg,range);
    }
    var randindex = THREE.Math.randInt(0, charactertextures.length - 1);
    loader.load(charactertextures[randindex], addCharacter);
}

function onDone(spawnposition,health,dmg,range){
    entityId++;
    entityCounter++;
    entities.push(new Entity(1,entityId,10,spawnposition,mesh,geo,mixer,health,dmg,range,800));
    entitiesGroup.add(entities[entities.length - 1].getMesh);
    var elem = document.getElementById('amountOfEntities');
    elem.innerHTML = "Entities: " + entityCounter;
    var object = entities[entities.length - 1].getMesh;
    object.userData = {
        ID: entityId.toString()
    }
}

function updateEntityCounter(){
    entityCounter--;
    var elem = document.getElementById('amountOfEntities');
    elem.innerHTML = "Entities: " + entityCounter;
}

function AIMovement(){
    var delta = time.getDelta();
    if(entities.length > 0 && waypoints[0] != null){
        for(let i = 0; i < entities.length; i++){
            if(entities[i] != null){
                if(!entities[i].isDeath){
                    entities[i].updateEntity(delta,colliderGroup,player,worldobjects,damageHandler);
                }
                else{
                    scene.remove(entities[i]);
                    entitiesGroup.remove(entities[i].getMesh);
                }
            }
        }
    }
}

function updateSpeed(){
    for(var a = 0; a < entities.length; a++){
        entities[a].speedUpdater();
    }
}

function addWaypoint(posx,posz){
    waypointId++;
    waypoints.push(new Waypoint(posx,posz,waypointId));
    scene.add(waypoints[waypoints.length - 1].getMesh);
}

//Z is de hoogte!
/*function addWall(sizex,sizez,sizey,posx,posy,posz){
    wallId++;
    objects.push(new Wall(sizex,sizey,sizez,wallId,posx,posy,posz));
    objectCollisions.add(objects[objects.length - 1].getMesh);
    generateWaypoints();
    var object = objects[objects.length - 1].getMesh;
    object.userData = {
        ID: wallId.toString()
    }
}*/

function calcnextMovement(delta){
    var clone = controls.getObject().clone();
    clone.visible = false;
    var velo = velocity;
    velo.x -= velocity.x * 10.0 * delta;
    velo.z -= velocity.z * 10.0 * delta;

    //velo.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    if ( moveForward && !playercollision ) velo.z -= 200.0 * delta;
    if ( moveForward && playercollision) velo.z -= 10.0 * delta;
    if ( moveBackward && !playercollision ) velo.z += 200.0 * delta;
    if ( moveBackward && playercollision ) velo.z += 10.0 * delta;

    if ( moveLeft && !playercollision ) velo.x -= 200.0 * delta;
    if ( moveLeft && playercollision ) velo.x -= 10.0 * delta;
    if ( moveRight && !playercollision ) velo.x += 200.0 * delta;
    if ( moveRight && playercollision ) velo.x += 10.0 * delta;

    clone.translateX(velo.x * delta);
    //clone.translateY(velo.y * delta);
    clone.translateZ(velo.z * delta);
    scene.add(clone);
    if(worldobjects.length > 0) {
        if(moveForward || moveBackward || moveLeft || moveRight){
            objectCollisionCheck(clone);
        }
    }
    scene.remove(clone);
}

function objectCollisionCheck(clone){
    var colcounter = 0;
    for(var i = 0; i < worldobjects.length; i++) {
        var playerbox = clone;
        var objectbox = worldobjects[i].objectMesh;
        var playerbb = new THREE.Box3().setFromObject(playerbox);
        var objectbb = new THREE.Box3().setFromObject(objectbox);
        var collision = playerbb.intersectsBox(objectbb);
        if (collision) {
            colcounter++;
            nocollision = false;
            break;
        }
    }
    if(colcounter == 0){
        nocollision = true;
    }
}

function generateWaypoints(id){
    if(worldobjects.length > 0){
        if (worldobjects[id].Index == 1 || worldobjects[id].Index == 2 || worldobjects[id].Index == 7 || worldobjects[id].Index == 8) {
            if (worldobjects[id].Index == 1) {
                cornerx = 4.18;
                cornerz = 4;
            }
            if (worldobjects[id].Index == 2) {
                cornerx = 4.085;
                cornerz = 9.85;
                if (worldobjects[id].Rotation == 90 || worldobjects[id].Rotation == -90) {
                    cornerx = 9.85;
                    cornerz = 4.085;
                }
            }
            if (worldobjects[id].Index == 7) {
                cornerx = 3.4;
                cornerz = 6.8;
                if (worldobjects[id].Rotation == 90 || worldobjects[id].Rotation == -90) {
                    cornerx = 6.8;
                    cornerz = 3.4;
                }
            }
            if (worldobjects[id].Index == 8) {
                cornerx = 3.35;
                cornerz = 7.45;
                if (worldobjects[id].Rotation == 90 || worldobjects[id].Rotation == -90) {
                    cornerx = 7.45;
                    cornerz = 3.35;
                }
            }
            addWaypoint(worldobjects[id].objectMesh.position.x + cornerx, worldobjects[id].objectMesh.position.z + cornerz);
            addWaypoint(worldobjects[id].objectMesh.position.x + cornerx, worldobjects[id].objectMesh.position.z - cornerz);
            addWaypoint(worldobjects[id].objectMesh.position.x - cornerx, worldobjects[id].objectMesh.position.z - cornerz);
            addWaypoint(worldobjects[id].objectMesh.position.x - cornerx, worldobjects[id].objectMesh.position.z + cornerz);
            var objectWaypoints = [waypoints[waypoints.length - 1], waypoints[waypoints.length - 2], waypoints[waypoints.length - 3], waypoints[waypoints.length - 4]];
            worldobjects[id].setobjectWaypoints(objectWaypoints);
        }
    }
}
function setWavesize(){
    if(entityCounter <= maxentitiesonfield && entityCounter < wavesize && totalentitiesspawned < wavesize) {
        var randlocation = THREE.Math.randInt(0, spawnlocations.length - 1);
        addEntity(spawnlocations[randlocation], THREE.Math.randInt(minhp, maxhp), THREE.Math.randInt(mindmg, maxdmg), 3.5);
        totalentitiesspawned++;
        console.log(totalentitiesspawned);
    }
}


