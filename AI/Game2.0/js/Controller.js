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
var waypoints = [];
var timer = new THREE.Clock;
var player = null;
var arms = null;
var testobj = null;
var damageHandler = new DamageHandler();
var entitiesCounter = 0;
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
var weaponSpawnpoints = [new WeaponSpawnpoint(25,1,0,30000),new WeaponSpawnpoint(30,1,0,30000),new WeaponSpawnpoint(35,1,0,30000)];
var buffSpawnpoints = [new BuffSpawnpoint(40,1,0,45000),new BuffSpawnpoint(45,1,0,45000),new BuffSpawnpoint(50,1,0,45000)];
var weaponMeshes = [];
var buffMeshes = [];
var weaponmeshcounter = 0;
var buffmeshcounter = 0;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );
var gameover = document.getElementById("text");
    gameover.style.display = 'none';
    gameover = document.getElementById("ul");
    gameover.style.display = 'none';

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
var entities = [];
var objects = [];
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
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    scene = new THREE.Scene();

    controls = new THREE.PointerLockControls( camera );
    player = new Player(controls.getObject(), 20, 10, 1, 2.5, 100, 6, 20, 800,4,4);
    createScene();
    instantiateModels();
    scene.add(objectCollisions);
    scene.add(entitiesGroup);
    scene.add(weaponsGroup);
    scene.add(buffGroup);
    objectCollisions.add(player.getMesh);
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
                addEntity(controls.getObject().position.x, controls.getObject().position.z, 200, 10, 3.5);
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

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        if ( moveForward ) velocity.z -= (200.0 * speedboost) * delta;
        if ( moveBackward ) velocity.z += (200.0 * speedboost) * delta;

        if ( moveLeft ) velocity.x -= (200.0 * speedboost) * delta;
        if ( moveRight ) velocity.x += (200.0 * speedboost) * delta;

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
    renderer.render( scene, camera );
    }
    else{
        document.exitPointerLock();
        elem = document.getElementById("GameOver");
        elem.style.display = 'block';
        elem = document.getElementById("cursor");
        elem.style.display = 'none';
        elem = document.getElementById("HP");
        elem.style.display = 'none';
        elem = document.getElementById("healthbar");
        elem.style.display = 'none';
        elem = document.getElementById("amountOfEntities");
        elem.style.display = 'none';
        elem = document.getElementById("Instructions");
        elem.style.display = 'none';
        gameover = document.getElementById("text");
        gameover.style.display = 'block';
        gameover = document.getElementById("ul");
        gameover.style.display = 'block';
        elem = document.getElementById("score").style.marginTop = "17%"; 
        score.style.marginLeft = "46%";
        score.style.fontSize = "xx-large";
        elem.style.display = 'block';
    }
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

    var ceilingTexture = new THREE.TextureLoader().load("textures/Ceiling.png");
    ceilingTexture.wrapS = THREE.RepeatWrapping;
    ceilingTexture.wrapT = THREE.RepeatWrapping;
    ceilingTexture.repeat.set(40, 40);
    var ceilingMaterial = new THREE.MeshPhongMaterial( { map: ceilingTexture } );
    ceilingMaterial.shininess = 0.1;
    var ceiling = new THREE.Mesh( new THREE.PlaneBufferGeometry( 300,
        300, 2, 2), ceilingMaterial);
    ceiling.position.y = 60;
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

    //Z is de hoogte!
    addWall(10,30,10,-30,5,0);
    addWall(10,10,30,0,5,0);
    addWall(30,10,10,40,5,-30);
    addWall(10,30,10,0,5,50);
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
        onDone(posx,posz,health,dmg,range);
    }
    loader.load('models/CharacterProject1.json', addCharacter);
}

function onDone(posx,posz,health,dmg,range){
    entityId++;
    entitiesCounter++;
    entities.push(new Entity(1,entityId,10,posx,0,posz,mesh,geo,mixer,health,dmg,range,800));
    entitiesGroup.add(entities[entities.length - 1].getMesh);
    var elem = document.getElementById('amountOfEntities');
    elem.innerHTML = "Entities: " + entitiesCounter;
    var object = entities[entities.length - 1].getMesh;
    object.userData = {
        ID: entityId.toString()
    };
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
    };
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

function updateEntityCounter(){
    entitiesCounter--;
    var elem = document.getElementById('amountOfEntities');
    elem.innerHTML = "Entities: " + entitiesCounter;
}

//laden van mesh, 1 keer doen!!!!
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

//deze aanroepen voor een nieuwe wapen, bij 2 of meer dezelfde wapens, elk dezelfde mesh meegeven
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

