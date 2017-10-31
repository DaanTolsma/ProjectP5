/**
 * Created by bauke_000 on 11-10-2017.
 */


var camera, scene, renderer;
var controls;

var mesh,mixer,target,geo;
var playerCol = 2.5;
var entityId = 0;
var waypointId = 0;
var waypoints = [];
var timer = new THREE.Clock;
var player = null;
var arms = null;
var testobj = null;
var damageHandler = new DamageHandler();
var entityCounter = 0;
var modelsReady = false;
var startbuffs = true;
var weapons = [];
var buffs = [];
var weaponId = 0;
var buffId = 0;
var healthbuffindex = 0;
var scorecounter = 0;
var weaponPaths = ['models/Book.json','models/Monitor.json','models/Keyboard.json','models/Pointer.json','models/Laptop.json',
    'models/Map.json','models/Broomstick.json','models/Watercanteen.json','models/Trashbin.json','models/Globe.json','models/Tablet.json'];
var buffPaths = ['models/Sodacan.json','models/Snack.json','models/Beer.json','models/Coffee.json'];
var weaponSpawnpoints = [new WeaponSpawnpoint(60,1,48,30000),new WeaponSpawnpoint(-2,1,34,30000),new WeaponSpawnpoint(-43,1,19,30000),new WeaponSpawnpoint(-57,1,-41,30000),new WeaponSpawnpoint(40,1,-31,30000)];
var buffSpawnpoints = [new BuffSpawnpoint(-41,1,0.5,45000),new BuffSpawnpoint(41,1,3,45000),new BuffSpawnpoint(-27,1,46,45000),new BuffSpawnpoint(21,1,-43,45000)];
var weaponMeshes = [];
var buffMeshes = [];
var weaponmeshcounter = 0;
var buffmeshcounter = 0;

var collision = [];
var collisionp = [];
var maxentitiesonfield = 10;
var totalentitiesspawned = 0;
var wavesize = 3;
var wavemultiplier = 1.2;
var waveround = 0;
var countdown = new THREE.Clock;
var waittimer = true;
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
var charactertextures = [];
charactertextures.push('models/CharacterProject1.json');
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
var worldobjectGroup = new THREE.Group();
var worldobjectId = 0;
var nocollision = true;
var cornerx;
var cornerz;
var colliderGroup = new THREE.Group();
var listener = new THREE.AudioListener();

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );
var gameover = document.getElementById("text");
    gameover.style.display = 'none';
    gameover = document.getElementById("ul");
    gameover.style.display = 'none';

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
var entities = [];
var objectCollisions = new THREE.Group();
var entitiesGroup = new THREE.Group();
var weaponsGroup = new THREE.Group();
var buffGroup = new THREE.Group();
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

        var elem = document.getElementById("cursor");
        elem.style.display = 'block';
        elem = document.getElementById("HP");
        elem.style.display = 'block';
        elem = document.getElementById("healthbar");
        elem.style.display = 'block';
        elem = document.getElementById("amountOfEntities");
        elem.style.display = 'block';
        elem = document.getElementById("score");
        elem.style.display = 'block';
        instructions.style.display = 'none';
        elem = document.getElementById("GameOver");
        elem.style.display = 'none';
        elem = document.getElementById("waveAmount");
        elem.style.display = 'block';
        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();

    }, false );

} else {

    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

init();

//wacht 2 seconden zodat alle models kan worden geladen, begin daarna met renderen
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
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    scene = new THREE.Scene();
    camera.add( listener );

    controls = new THREE.PointerLockControls( camera );
    player = new Player(controls.getObject(), -1, -4, 1, 2.5, 100, 6, 20, 800,4,4);
    createScene();
    instantiateModels();
    scene.add(objectCollisions);
    scene.add(entitiesGroup);
    scene.add(weaponsGroup);
    scene.add(buffGroup);
    scene.add(worldobjectGroup);
    scene.add(colliderGroup);
    colliderGroup.add(player.getMesh);
    var onKeyDown = function (event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 32: // space
                //if (canJump === true) velocity.y += 150;
                //canJump = false;
                break;

            case 69: // e
                //addEntity(controls.getObject().position.x, controls.getObject().position.z, 200, 10, 3.5);
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

    document.addEventListener( 'keyup', onKeyUp, false );



    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //

    document.addEventListener( 'keydown', onKeyDown, false );
    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function render() {
    if(player.isDeath == false){

        requestAnimationFrame( render );

        if(modelsReady){
            addArms(0,20);
            modelsReady = false;
        }

        var speedboost = 1;
        if(player != null){
            speedboost += player.getSpeedBoost;
        }

        if ( controlsEnabled ) {

            var time = performance.now();
            var delta = ( time - prevTime ) / 1000;
            calcnextMovement(delta);
            if(nocollision) {
                velocity.x -= velocity.x * 10.0 * delta;
                velocity.z -= velocity.z * 10.0 * delta;

                velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

                if (moveForward && !playercollision) velocity.z -= (200.0 * speedboost) * delta;
                if (moveForward && playercollision) velocity.z -= 10.0 * delta;
                if (moveBackward && !playercollision) velocity.z += (200.0 * speedboost) * delta;
                if (moveBackward && playercollision) velocity.z += 10.0 * delta;

                if (moveLeft && !playercollision) velocity.x -= (200.0 * speedboost) * delta;
                if (moveLeft && playercollision) velocity.x -= 10.0 * delta;
                if (moveRight && !playercollision) velocity.x += (200.0 * speedboost) * delta;
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
        var deltaTime = timer.getDelta();
        window.onkeydown = function(e) {
            return !(e.keyCode == 32);
        };
        if(!player.isDeath){
            if(arms != null){
                player.updatePlayer(entitiesGroup,damageHandler,entities,arms);
                arms.updateArms(deltaTime);
            }
        }
        AIMovement(deltaTime);
        if(player != null){
            handleItemSpawnpoints();
        }
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
    else{
        document.exitPointerLock();
        document.getElementById("clicktoplay").innerHTML = " ";
        document.getElementById("instructiontext").innerHTML = " ";
        var elem = document.getElementById("GameOver");
        elem.style.display = 'block';
        elem = document.getElementById("cursor");
        elem.style.display = 'none';
        elem = document.getElementById("HP");
        elem.style.display = 'none';
        elem = document.getElementById("healthbar");
        elem.style.display = 'none';
        elem = document.getElementById("amountOfEntities");
        elem.style.display = 'none';
        elem = document.getElementById('instructions');
        elem.parentNode.removeChild(elem);
        elem = document.getElementById('blocker');
        elem.parentNode.removeChild(elem);
        gameover = document.getElementById("text");
        gameover.style.display = 'block';
        gameover = document.getElementById("ul");
        gameover.style.display = 'block';
        elem = document.getElementById("score").style.marginTop = "17%";
        score.style.marginLeft = "46%";
        score.style.fontSize = "xx-large";
        var audio = new Audio('audio/gameover.mp3');
        audio.play();
    }
}

function createScene(){

    scene.background = new THREE.Color( 0x0099ff );

    var light = new THREE.SpotLight(0xfff0b3, 1, 0, Math.PI / 2);
    light.position.set(0, 6, -60);
    scene.add( light );
    var light1 = new THREE.SpotLight(0xfff0b3, 1, 0, Math.PI / 2);
    light1.position.set(0, 6, 60);
    scene.add( light1 );
    var light2 = new THREE.SpotLight(0xfff0b3, 1, 0, Math.PI / 2);
    light2.position.set(-60, 6, 0);
    scene.add( light2 );
    var light3 = new THREE.SpotLight(0xfff0b3, 1, 0, Math.PI / 2);
    light3.position.set(60, 6, 0);
    scene.add( light3 );

    var ceilingTexture = new THREE.TextureLoader().load("textures/Ceiling.png");
    ceilingTexture.wrapS = THREE.RepeatWrapping;
    ceilingTexture.wrapT = THREE.RepeatWrapping;
    ceilingTexture.repeat.set(40, 40);
    var ceilingMaterial = new THREE.MeshPhongMaterial( { map: ceilingTexture } );
    ceilingMaterial.shininess = 0.1;
    var ceiling = new THREE.Mesh( new THREE.PlaneBufferGeometry( 300,
        300, 2, 2), ceilingMaterial);
    ceiling.position.y = 12;
    ceiling.rotation.x = Math.PI / 2;
    scene.add(ceiling);

    var floorTexture = new THREE.TextureLoader().load("textures/Floor.png");
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(40, 40);
    var floorMaterial = new THREE.MeshPhongMaterial( { map: floorTexture } );
    floorMaterial.shininess = 0.1;
    var floor = new THREE.Mesh( new THREE.PlaneBufferGeometry( 300,
        300, 2, 2), floorMaterial);
    floor.position.y = 0;
    floor.rotation.x = - Math.PI / 2;
    scene.add(floor);

    var material1 = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
    material1.shininess = 0;
    testobj = new THREE.Mesh(new THREE.BoxGeometry( 0.5,
        20, 0.5), material1);

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
        //de indexnr staat voor de models die een hulpmesh nodig hebben voor raycast intersection voor entities
        //deze hulpmesh is onzichtbaar
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

function addArms(posx,posz){
    function addArmsMesh(geometry, materials) {
        materials.forEach( function ( material ) {
            material.skinning = true;
            material.shininess = 0.1;
        } );
        mesh = new THREE.SkinnedMesh(geometry, materials);
        geo = geometry;
        mixer = new THREE.AnimationMixer( mesh );
        var bone = mesh.children[0].children[0].children[0];
        onDoneArms(posx,posz,bone);
    }
    loader.load('models/SingleArm.json', addArmsMesh);
}

function onDoneArms(posx,posz,bone){
    arms = new Arms(posx,posz,mesh,geo,mixer,bone);
    scene.add(arms.getMesh);
}

function AIMovement(delta){
    if(entities[0] != null && waypoints[0] != null){
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
}
//bereken de positie van de speler voor de volgende frame om te checken voor collision met objects
//wanneer dit waar is, wordt elke movement richting die object gecanceled.
function calcnextMovement(delta){
    var clone = controls.getObject().clone();
    clone.visible = false;
    var velo = velocity;
    velo.x -= velocity.x * 10.0 * delta;
    velo.z -= velocity.z * 10.0 * delta;

    if ( moveForward && !playercollision ) velo.z -= 200.0 * delta;
    if ( moveForward && playercollision) velo.z -= 10.0 * delta;
    if ( moveBackward && !playercollision ) velo.z += 200.0 * delta;
    if ( moveBackward && playercollision ) velo.z += 10.0 * delta;

    if ( moveLeft && !playercollision ) velo.x -= 200.0 * delta;
    if ( moveLeft && playercollision ) velo.x -= 10.0 * delta;
    if ( moveRight && !playercollision ) velo.x += 200.0 * delta;
    if ( moveRight && playercollision ) velo.x += 10.0 * delta;

    clone.translateX(velo.x * delta);
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
//hier staat de index weer voor het nummer van de mesh
//hier worden de hoeken bepaald voor elke mesh/object
//en vervolgens worden de waypoints gemaakt voor deze object
//en toegevoegd aan de object
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

function updateEntityCounter(){
    entityCounter--;
    var elem = document.getElementById('amountOfEntities');
    elem.innerHTML = "Entities: " + entityCounter;
}

//hier wordt het laden van de mesh 1 keer gedaan
//daarna wordt bij elke nieuwe wapen de mesh gekopieerd
function addWeaponModels(path,dmg,dur,range,speed,knockback,name,decay){
    function addWeaponMesh(geometry, materials) {
        materials.forEach( function ( material ) {
            material.skinning = true;
            material.shininess = 0.1;
        } );
        mesh = new THREE.Mesh(geometry, materials);
        mesh.userData = {
            DMG: dmg,
            DUR: dur,
            RANGE: range,
            SPEED: speed,
            KB: knockback,
            NAME: name,
            DECAY: decay,
            MESH: weaponmeshcounter,
        };
        weaponMeshes.push(mesh);
        weaponmeshcounter++;
    }
    loader.load(weaponPaths[path], addWeaponMesh);
}

function addNewWeapon(dmg,dur,range,speed,knockback,name,decay,mesh,pos,i){
    weaponId++;
    var model = weaponMeshes[mesh];
    weapons.push(new Weapon(dmg,dur,range,speed,knockback,model.clone(),name,decay));
    var obj = weapons[weapons.length - 1].getMesh;
    obj.position.set(pos.x,pos.y,pos.z)
    obj.userData = {
        ID: weaponId.toString()
    };
    weaponsGroup.add(obj);
    weaponSpawnpoints[i].setWeapon(weapons[weapons.length - 1]);
}

function addBuffModels(path,health,name,dmgboost,speedboost,hpboost,dur){
    function addBuffMesh(geometry, materials) {
        materials.forEach( function ( material ) {
            material.skinning = true;
            material.shininess = 0.1;
        } );
        mesh = new THREE.Mesh(geometry, materials);
        mesh.userData = {
            HEALTH: health,
            DMG: dmgboost,
            SPD: speedboost,
            HP: hpboost,
            DUR: dur,
            NAME: name,
            MESH: buffmeshcounter,
        };
        buffMeshes.push(mesh);
        buffmeshcounter++;
    }
    loader.load(buffPaths[path], addBuffMesh);
}

function addNewBuff(health,name,mesh,pos,i,dmgboost,speedboost,hpboost,dur){
    buffId++;
    var model = buffMeshes[mesh];
    buffs.push(new Buff(health,name,model.clone(),dmgboost,speedboost,hpboost,dur));
    var obj = buffs[buffs.length - 1].getMesh;
    obj.position.set(pos.x,pos.y,pos.z)
    obj.userData = {
        ID: buffId.toString()
    };
    buffGroup.add(obj);
    buffSpawnpoints[i].setBuff(buffs[buffs.length - 1]);
}

//laadt wapens eerste keer on startup.
function instantiateModels(){
    addWeaponModels(0,15,20,0.2,0,0.3,"Mathematics Book",60000);  //mesh 0
    addWeaponModels(1,50,15,0.5,400,1.4,"Monitor",60000);         //mesh 1
    addWeaponModels(2,30,17,0.2,0,0.5,"Keyboard",60000);          //mesh 2
    addWeaponModels(3,20,15,1,200,0.5,"Pointer",60000);           //mesh 3
    addWeaponModels(4,40,25,0.4,200,0.7,"Laptop",60000);          //mesh 4
    addWeaponModels(5,15,20,0.2,0,0.2,"Map",60000);               //mesh 5
    addWeaponModels(6,30,25,1,200,0.8,"Broomstick",60000);        //mesh 6
    addWeaponModels(7,20,30,0.2,0,0.2,"Watercanteen",60000);      //mesh 7
    addWeaponModels(8,45,30,0.5,350,1,"Trashbin",60000);          //mesh 8
    addWeaponModels(9,70,10,0.8,500,1.5,"Globe",60000);           //mesh 9
    addWeaponModels(10,25,25,0.3,100,0.4,"Tablet",60000);         //mesh 10

    addBuffModels(0,40,"Energy Drink",0,0,0,0);                   //mesh 0
    addBuffModels(1,0,"Snack",0.5,0,0,15000);                     //mesh 1
    addBuffModels(2,0,"Beer",0,0.5,0,15000);                      //mesh 2
    addBuffModels(3,0,"Coffee",0,0,50,15000);                     //mesh 3
    modelsReady = true;
}
//regel het spawnen van buffs en wapens
function handleItemSpawnpoints(){
    if(weaponMeshes.length > 0){
        for(let i = 0; i < weaponSpawnpoints.length; i++){
            if(weaponSpawnpoints[i].getWeapon == null && weaponSpawnpoints[i].isAllowed){
                var num = Math.floor((Math.random() * ((weaponMeshes.length - 1) - 0)) + 0);
                var mod = weaponMeshes[num];
                addNewWeapon(mod.userData.DMG,mod.userData.DUR,mod.userData.RANGE,mod.userData.SPEED,mod.userData.KB,
                    mod.userData.NAME,mod.userData.DECAY,mod.userData.MESH,weaponSpawnpoints[i].getPos,i);
            }
        }
    }

    if(startbuffs){
        for(let i = 0; i < buffMeshes.length; i++){
            if(buffMeshes[i].userData.HEALTH > 0){
                console.log("test");
                healthbuffindex = i;
            }
        }
    }

    if(buffMeshes.length > 0){
        var healthcounter = 0;
        for(let j = 0; j < buffSpawnpoints.length; j++){
            if(buffSpawnpoints[j].getBuff != null && healthcounter == 0){
                var buff = buffSpawnpoints[j].getBuff;
                if(buff.getHealth > 0){
                    healthcounter++;
                }
            }
        }
        for(let i = 0; i < buffSpawnpoints.length; i++){
            if(buffSpawnpoints[i].getBuff == null && buffSpawnpoints[i].isAllowed){
                var num = Math.floor((Math.random() * ((buffMeshes.length - 1) - 0)) + 0);
                var mod = buffMeshes[num];
                if(healthcounter == 0 || startbuffs){
                    healthcounter++;
                    mod = buffMeshes[healthbuffindex];
                    startbuffs = false;
                }
                addNewBuff(mod.userData.HEALTH,mod.userData.NAME,mod.userData.MESH,buffSpawnpoints[i].getPos,i,mod.userData.DMG
                    ,mod.userData.SPD,mod.userData.HP,mod.userData.DUR);
            }
        }
    }
    for(let i = 0; i < weapons.length; i++){
        weapons[i].updateWeapon();
    }
    for(let i = 0; i < weaponSpawnpoints.length; i++){
        weaponSpawnpoints[i].updateSpawn();
    }
    for(let i = 0; i < buffSpawnpoints.length; i++){
        buffSpawnpoints[i].updateSpawn();
    }
}

