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
var wavesize = 0;
var waveround = 0;
var wavespawned = false;
var entityspawned = false;
var randomdmg = null;
var randomhp = null;
var playercollision = false;
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
var worldobjectGroup = new THREE.Group();
var worldobjectId = null;
var indexnmr;
var nocollision = true;
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
render();

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
    player = new Player(controls.getObject(),30,0,1,2.5,100,5,100,800);
    scene.add(objectCollisions);
    scene.add(entitiesGroup);
    scene.add(worldobjectGroup);
    objectCollisions.add(player.getMesh);
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

        if(player.isDeath){
           // wavesize = 0;
           // waveround = 0;
           // entities = [];
        }
        var deadentities = [];
        for(var i = 0; i < entities.length; i++){
            if(entities[i].isDeath) {
                deadentities.push(entities[i]);
            }
        }
        if(deadentities.length == entities.length){
            entities = [];
            wavespawned = false;
            entityId = 0;
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

    if(entities.length == wavesize){
        entityspawned = false;
    }

    if(entities.length == 0 && !wavespawned) {
        wavespawned = true;
        setWavesize(positx, positz);
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
    addObject(3,-70,0,-10,0,0,0,1.5,1.5,1.5);//wall
    addObject(3,-33,0,-40,0,90,0,1.5,1.5,2.5);//wall
    addObject(3,-63,0,20,0,90,0,1.5,1.5,1);//wall
    addObject(3,-25,0,20,0,90,0,1.5,1.5,1.5);//wall
    addObject(3,4.4,0,-5,0,0,0,1.5,1.5,0.8);//wall
    addObject(3,0,0,12,0,0,0,1.5,1.5,1.8);//wall
    addObject(3,-15.1,0,30,0,0,0,1.5,1.5,1.5);//wall
    addObject(3,12,0,39.9,0,90,0,1.5,1.5,1);//wall
    addObject(3,9.2,0,25,0,90,0,1.5,1.5,1.4);//wall
    addObject(3,60.4,0,8,0,0,0,1.5,1.5,1.5);//wall
    addObject(3,60.4,0,-39,0,0,0,1.5,1.5,1.5);//wall
    addObject(3,19,0,2,0,0,0,1.5,1.5,2.5);//wall
    addObject(3,19,0,-58,0,0,0,1.5,1.5,2.7);//wall
    addObject(3,25.5,0,-77,0,90,0,1.5,1.5,1);//wall
    addObject(3,54,0,-77,0,90,0,1.5,1.5,1);//wall
    addObject(3,19,0,-88,0,0,0,1.5,1.5,1.5);//wall
    addObject(3,60.4,0,-88,0,0,0,1.5,1.5,1.5);//wall
    addObject(3,40,0,-99,0,90,0,1.5,1.5,3);//wall
    addObject(3,-15.1,0,50,0,0,0,1.5,1.5,1.5);//wall
    addObject(3,19,0,50,0,0,0,1.5,1.5,1.5);//wall
    addObject(3,2,0,60,0,90,0,1.5,1.5,2.5);//wall
    addObject(3,-80,0,-12,0,90,0,1.5,1.5,1.5);//wall
    addObject(3,-80,0,20,0,90,0,1.5,1.5,1.5);//wall
    addObject(3,-90,0,4,0,0,0,1.5,1.5,2.3);//wall
    addObject(3,4.4,0,-51,0,0,0,1.5,1.5,1.5);//wall
    addObject(3,-20,0,-51,0,0,0,1.5,1.5,1.5);//wall
    addObject(3,-8,0,-61,0,90,0,1.5,1.5,1.7);//wall

    addObject(6,-70,0,-30,0,0,0,1.5,1.5,1.7);//window
    addObject(6,-60,0,-40,0,90,0,1.5,1.5,1.7);//window
    addObject(6,4.4,0,-25,0,0,0,1.5,1.5,2.4);//window
    addObject(6,-42,0,20,0,90,0,1.5,1.5,2.5);//window
    addObject(6,-20,0,10,0,0,0,1.5,1.5,1.7);//window
    addObject(6,40,0,46,0,90,0,1.5,1.5,3.5);//window
    addObject(6,60.4,0,32,0,0,0,1.5,1.5,2.3);//window
    addObject(6,60.4,0,-16,0,0,0,1.5,1.5,2.3);//window
    addObject(6,60.4,0,-63,0,0,0,1.5,1.5,2.3);//window
    addObject(6,19,0,-25,0,0,0,1.5,1.5,2.4);//window

    addObject(9,-60,0,-12,0,90,0,1.5,1.5,2);//doorframe
    addObject(9,-46.6,0,-26,0,0,0,1.5,1.5,2);//doorframe
    addObject(9,-6.6,0,0,0,90,0,1.5,1.5,2);//doorframe
    addObject(9,19,0,32.6,0,0,0,1.5,1.5,2);//doorframe
    addObject(9,39.65,0,-77,0,90,0,1.5,1.5,2);//doorframe
    addObject(9,-1.7,0,39.9,0,90,0,1.5,1.5,2);//doorframe
    addObject(9,-70,0,6,0,0,0,1.5,1.5,2);//doorframe
    addObject(9,-9,0,-40,0,90,0,1.5,1.5,2);//doorframe

    addObject(7,-63,0,-34,0,0,0,4,4,4);//tafel docent
    addObject(7,-59,0,-33.8,0,180,0,4,4,4);//tafel docent
    addObject(7,-26.7,0,10.1,0,180,0,4,4,4);//tafel docent
    addObject(7,-30.7,0,9.9,0,0,0,4,4,4);//tafel docent
    addObject(7,-40.5,0,10.1,0,180,0,4,4,4);//tafel docent
    addObject(7,-44.4,0,9.9,0,0,0,4,4,4);//tafel docent
    addObject(7,49.2,0,36.7,0,90,0,4,4,4);//tafel docent
    addObject(7,49.4,0,32.9,0,-90,0,4,4,4);//tafel docent
    addObject(7,27.6,0,20.9,0,90,0,4,4,4);//tafel docent
    addObject(7,27.8,0,16.9,0,-90,0,4,4,4);//tafel docent
    addObject(7,48.2,0,8.8,0,90,0,4,4,4);//tafel docent
    addObject(7,48.4,0,4.9,0,-90,0,4,4,4);//tafel docent
    addObject(7,27.6,0,-5.5,0,90,0,4,4,4);//tafel docent
    addObject(7,27.8,0,-9.3,0,-90,0,4,4,4);//tafel docent
    addObject(7,51.8,0,-20.7,0,90,0,4,4,4);//tafel docent
    addObject(7,52,0,-24.7,0,-90,0,4,4,4);//tafel docent
    addObject(7,52,0,-10,0,-90,0,4,4,4);//tafel docent
    addObject(7,27.6,0,-21.5,0,90,0,4,4,4);//tafel docent
    addObject(7,27.8,0,-25.5,0,-90,0,4,4,4);//tafel docent
    addObject(7,22,0,-45.3,0,180,0,4,4,4);//tafel docent
    addObject(7,22,0,-54.8,0,180,0,4,4,4);//tafel docent
    addObject(7,22,0,-64.3,0,180,0,4,4,4);//tafel docent
    addObject(7,57.5,0,-45.3,0,0,0,4,4,4);//tafel docent
    addObject(7,57.5,0,-54.8,0,0,0,4,4,4);//tafel docent
    addObject(7,57.5,0,-64.3,0,0,0,4,4,4);//tafel docent

    addObject(1,-49.5,0,-14.5,0,130,0,2.5,2.5,2.5);//kast dicht
    addObject(1,1.7,0,-37.4,0,220,0,2.5,2.5,2.5);//kast dicht
    addObject(1,-10.9,0,38.7,0,90,0,2.5,2.5,2.5);//kast dicht

    addObject(4,-69.4,3,-18,0,0,0,2.5,2.5,2.5);//poster
    addObject(4,-0.5,3,14.2,0,180,0,2.5,2.5,2.5);//poster
    addObject(4,9.1,3,25.5,0,-90,0,2.5,2.5,2.5);//poster

    addObject(0,-27,2,-39.2,0,90,0,3.7,3.7,3.7);//digibord
    addObject(8,-45,0,84,0,0,0,4,4,4);//tafel leerling

    addObject(8,-27.1,0,-29.7,0,90,0,4,4,4);//tafel leerling
    addObject(8,-27.1,0,-22.4,0,90,0,4,4,4);//tafel leerling
    addObject(8,-27.1,0,-15.2,0,90,0,4,4,4);//tafel leerling

    addObject(2,3.2,0,-9,0,180,0,2.5,2.5,7);//kast open
    addObject(2,-60,0,18.9,0,90,0,2.5,2.5,5);//kast open
    addObject(2,-14.7,0,1.1,0,-90,0,2.5,2.5,4);//kast open
    addObject(2,51.5,0,-8,0,-90,0,2.5,2.5,8);//kast open
    addObject(2,27.8,0,-38.2,0,-90,0,2.5,2.5,8);//kast open

    addObject(5,-67.5,0,-18,0,0,0,2.5,2.5,2.5);//prullenbak
    addObject(5,-44.6,0,-38,0,0,0,2.5,2.5,2.5);//prullenbak
    addObject(5,21.4,0,-74.7,0,0,0,2.5,2.5,2.5);//prullenbak
    addObject(5,58,0,-74.7,0,0,0,2.5,2.5,2.5);//prullenbak
    addObject(5,21.4,0,43.2,0,0,0,2.5,2.5,2.5);//prullenbak
}

function addObject(indexnr,posx,posy,posz,rotationx,rotationy,rotationz,scalex,scaley,scalez){
    indexnmr = indexnr;
    function addWorldObject(geometry, materials) {
        materials.forEach( function ( material ) {
            material.shininess = 0.1;
        } );
        mesh = new THREE.Mesh(geometry, materials);
        mesh.scale.set(scalex,scaley,scalez);
        rotationx = (rotationx * Math.PI)/180;
        rotationy = (rotationy * Math.PI)/180;
        rotationz = (rotationz * Math.PI)/180;
        mesh.rotation.set(rotationx,rotationy,rotationz);
        worldobjectId++;
        worldobjects.push(new WorldObject(worldobjectId, posx, posy, posz, mesh, indexnr));
        worldobjectGroup.add(worldobjects[worldobjects.length - 1].objectMesh);
    }
    loader.load(worldobjecttextures[indexnr], addWorldObject);
}

function addEntity(posx,posz,health,dmg,range){
    function addCharacter(geometry, materials) {
        materials.forEach( function ( material ) {
            material.skinning = true;
            material.shininess = 0.1;
        } );
        mesh = new THREE.SkinnedMesh(geometry, materials);
        geo = geometry;
        mixer = new THREE.AnimationMixer( mesh );
        action.Idle = mixer.clipAction(geometry.animations[0]);
        action.Run = mixer.clipAction(geometry.animations[1]);
        onDone(posx,posz,health,dmg,range);
    }
    if(waveround == 10){
        loader.load('models/CharacterProject6.json', addCharacter);
    }
    else {
        var randindex = THREE.Math.randInt(0, charactertextures.length - 1);
        loader.load(charactertextures[randindex], addCharacter);
    }
}

function onDone(posx,posz,health,dmg,range){
    entityId++;
    entityCounter++;
    entities.push(new Entity(1,entityId,10,posx,0,posz,mesh,geo,mixer,health,dmg,range,800));
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
                    entities[i].updateEntity(delta,objectCollisions,player,objects,damageHandler);
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
function addWall(sizex,sizez,sizey,posx,posy,posz){
    wallId++;
    objects.push(new Wall(sizex,sizey,sizez,wallId,posx,posy,posz));
    objectCollisions.add(objects[objects.length - 1].getMesh);
    generateWaypoints();
    var object = objects[objects.length - 1].getMesh;
    object.userData = {
        ID: wallId.toString()
    }
}

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

function generateWaypoints(){
    if(objects[0] != null){
        for(let i = 0; i < objects.length; i++){
            addWaypoint(objects[i].getMesh.position.x + objects[i].sizeX/2 + 2.5,objects[i].getMesh.position.z + objects[i].sizeZ/2 + 2.5);
            addWaypoint(objects[i].getMesh.position.x + objects[i].sizeX/2 + 2.5,objects[i].getMesh.position.z - objects[i].sizeZ/2 - 2.5);
            addWaypoint(objects[i].getMesh.position.x - objects[i].sizeX/2 - 2.5,objects[i].getMesh.position.z - objects[i].sizeZ/2 - 2.5);
            addWaypoint(objects[i].getMesh.position.x - objects[i].sizeX/2 - 2.5,objects[i].getMesh.position.z + objects[i].sizeZ/2 + 2.5);
            var objectWaypoints = [waypoints[waypoints.length - 1],waypoints[waypoints.length - 2],waypoints[waypoints.length - 3],waypoints[waypoints.length - 4]];
            objects[i].setWaypoints(objectWaypoints);
        }
    }
}
function setWavesize(posx, posz){
    if(!entityspawned) {
        wavesize = 1;
        waveround++;
        var elem = document.getElementById('waveAmount');
        elem.innerHTML = "Wave: " + waveround;
        for (let i = 1; i <= wavesize; i++) {
            posx = posx + 6;
            posz = posz + 3;
            if(waveround <= 3) {
                randomdmg = THREE.Math.randInt(5,15);
                randomhp = THREE.Math.randInt(75,125 );
                addEntity(posx, posz, randomhp, randomdmg, 3.5);
                entityspawned = true;
            }
            if(waveround <= 6 && waveround > 3) {
                randomdmg = THREE.Math.randInt(7.5,20);
                randomhp = THREE.Math.randInt(100,150 );

                addEntity(posx, posz, randomhp, randomdmg, 3.5);
                entityspawned = true;
            }
            if(waveround <= 9 && waveround > 6) {
                randomdmg = THREE.Math.randInt(10,22.5);
                randomhp = THREE.Math.randInt(125,175);
                addEntity(posx, posz, randomhp, randomdmg, 3.5);
                entityspawned = true;
            }
            if(waveround == 10){
                wavesize = 1;
                addEntity(posx, posz, 300, 33, 3.5);
                entityspawned = true;
            }
            if(waveround == 11){
                wavesize = 20;
                randomdmg = THREE.Math.randInt(10,22.5);
                randomhp = THREE.Math.randInt(125,175);
                addEntity(posx, posz, randomhp, randomdmg, 3.5);
                entityspawned = true;
            }

        }
    }
}


