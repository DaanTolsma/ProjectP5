/**
 * Created by bauke_000 on 11-10-2017.
 */


var camera, scene, renderer;
var controls;

var mesh,mixer,target,geo;
var playerCol = 2.5;
var entityId = 0;
var waypointId = 0;
var wallId = 0;
var action = {};
var waypoints = [];
var time = new THREE.Clock;
var player = null;

var raycaster;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
var entities = [];
var objects = [];
var objectCollisions = new THREE.Group();
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
    player = controls.getObject();
    player.position.x = 20;
    player.name = "player";
    scene.add(objectCollisions);
    objectCollisions.add(player);
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
                if ( canJump === true ) velocity.y += 150;
                canJump = false;
                break;

            case 69: // e
                addEntity(controls.getObject().position.x,controls.getObject().position.z);
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

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        if ( moveForward ) velocity.z -= 400.0 * delta;
        if ( moveBackward ) velocity.z += 400.0 * delta;

        if ( moveLeft ) velocity.x -= 400.0 * delta;
        if ( moveRight ) velocity.x += 400.0 * delta;

        controls.getObject().translateX( velocity.x * delta );
        controls.getObject().translateY( velocity.y * delta );
        controls.getObject().translateZ( velocity.z * delta );

        if ( controls.getObject().position.y < 5 ) {

            velocity.y = 0;
            controls.getObject().position.y = 5;

            canJump = true;

        }

        prevTime = time;

    }
    window.onkeydown = function(e) {
        return !(e.keyCode == 32);
    };
    AIMovement();
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

    /*
    var box = new THREE.BoxGeometry(boxsize,boxsize,boxsize);
    var material = new THREE.MeshPhongMaterial({color: 0x66ff66 });
    material.shininess = 0.1;
    target = new THREE.Mesh(box,material);
    target.position.set(40,5,0);
    target.name = "player";
    objectCollisions.add(target);*/

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

    //Z is de hoogte!
    addWall(10,30,10,-30,5,0);
    addWall(10,10,30,0,5,0);
    addWall(30,10,10,40,5,-30);
}

function addEntity(posx,posz){
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
        onDone(posx,posz);
    }
    loader.load('models/CharacterProject.json', addCharacter);
}

function onDone(posx,posz){
    entityId++;
    entities.push(new Entity(1,entityId,10,posx,0,posz,mesh,geo,mixer,true));
    scene.add(entities[entities.length - 1].getMesh);
    var elem = document.getElementById('amountOfEntities');
    elem.innerHTML = "Entities: " + entityId;
}

function AIMovement(){
    var delta = time.getDelta();
    if(entities[0] != null && waypoints[0] != null){
        for(let i = 0; i < entities.length; i++){
            if(entities[i].inScene){
                var targetPosition = new THREE.Vector3(player.position.x,0,player.position.z);
                var currentPosition = new THREE.Vector3(entities[i].getMesh.position.x,0,entities[i].getMesh.position.z);
                if(currentPosition.distanceTo(targetPosition) > playerCol){
                    entities[i].updateEntity(delta,objectCollisions,targetPosition,objects);
                    entities[i].Animation(true);
                }
                else{
                    entities[i].Animation(false);
                }
            }
        }
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

