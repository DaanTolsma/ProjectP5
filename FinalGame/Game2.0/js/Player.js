var attackAllowed = true;
var countG = 0;
var elem = document.getElementById( 'pickup' );
var framecounter = 0;
var dmgdur = 0;
var speeddur = 0;
var hpdur = 0;
var dmgcount = false;
var speedcount = false;
var hpcount = false;
var stopdmgboost = false;
var stopspeedboost = false;
var stophpboost = false;

class Player {
    constructor(object,posx,posz,id,size,health,range,dmg,cooldown,pickuprange,knockback){
        this.object = object;
        this.id = id;
        this.size = size;
        this.object.position.set(posx,5,posz);
        this.object.name = "player";
        this.health = health;
        this.range = range;
        this.basedmg = dmg;
        this.basecooldown = cooldown;
        this.death = false;
        this.raycaster = new THREE.Raycaster();
        this.weapon = null;
        this.pickupRange = pickuprange;
        this.baseknockback = knockback;
        this.maxHealth = health;
        this.dmgboost = 0;
        this.speedboost = 0;
        this.hpboost = 0;
    }

    get getMesh(){
        return this.object;
    }

    get getHealth(){
        return this.health;
    }

    get getMaxHealth(){
        return this.maxHealth;
    }

    get getRange(){
        return this.range;
    }

    get getBasedmg(){
        return this.basedmg;
    }

    get isDeath(){
        return this.death;
    }

    get getWeapon(){
        return this.weapon;
    }

    get getKnockback(){
        return this.baseknockback;
    }

    get getDmgBoost(){
        return this.dmgboost;
    }

    get getSpeedBoost(){
        return this.speedboost;
    }

    get getHpBoost(){
        return this.hpboost;
    }

    setWeapon(weapon){
        this.weapon = weapon;
    }

    kill(){
        this.death = true;
    }

    setHealth(hp){
        this.health = hp;
        let health = document.getElementById("healthbar");
        health.value = this.health;
    }

    setMaxHealth(){
        this.maxHealth += this.hpboost;
        this.health = this.maxHealth;
        let health = document.getElementById("healthbar");
        health.value = this.maxHealth;
        health.max = this.maxHealth;
    }

    setDmgBoost(dmgboost,dur){
        this.dmgboost = dmgboost;
        dmgdur = dur;
    }

    setSpeedBoost(speedboost,dur){
        this.speedboost = speedboost;
        speeddur = dur;
    }

    setHpBoost(hpboost,dur){
        this.hpboost = hpboost;
        hpdur = dur;
        this.setMaxHealth()
    }

    updatePlayer(entitiesGroup,damageHandler,entities,arms){
        framecounter++;
        if(controls.getMouseClick() && attackAllowed){
            var cooldown = this.basecooldown;
            if(this.weapon == null){
                arms.Animation("punch");
                var audio = new Audio('audio/hit-fist.mp3');
                audio.play();
            }
            else{
                arms.Animation("weapon");
                cooldown += this.weapon.getSpeed;
                if(this.weapon.name == "Globe"){
                    var audio = new Audio('audio/hit-globe.mp3');
                    audio.play();
                }
                if(this.weapon.name == "Keyboard"){
                    var audio = new Audio('audio/hit-keyboard.mp3');
                    audio.play();
                }
                if(this.weapon.name == "Laptop"){
                    var audio = new Audio('audio/hit-laptop.mp3');
                    audio.play();
                }
                if(this.weapon.name == "Map"){
                    var audio = new Audio('audio/hit-map.mp3');
                    audio.play();
                }
                if(this.weapon.name == "Monitor"){
                    var audio = new Audio('audio/hit-monitor.mp3');
                    audio.play();
                }
                if(this.weapon.name == "Pointer"){
                    var audio = new Audio('audio/hit-pointer.mp3');
                    audio.play();
                }
                if(this.weapon.name == "Trashbin"){
                    var audio = new Audio('audio/hit-trashbin.mp3');
                    audio.play();
                }
                if(this.weapon.name == "Tablet"){
                    var audio = new Audio('audio/hit-tablet.mp3');
                    audio.play();
                }
                if(this.weapon.name == "Watercanteen"){
                    var audio = new Audio('audio/hit-water.mp3');
                    audio.play();
                }
                if(this.weapon.name == "Mathematics Book"){
                    var audio = new Audio('audio/hit-book.mp3');
                    audio.play();
                }
                if(this.weapon.name == "Broomstick"){
                    var audio = new Audio('audio/hit-broom.mp3');
                    audio.play();
                }
            }
            attackAllowed = false;
            setTimeout(function(){
                attackAllowed = true;
            }, cooldown);
            this.attack(entitiesGroup,damageHandler,entities);
        }
        else{
            controls.setMouseClick(false);
        }

        if(this.weapon != null){
            if(this.weapon.isDestroyed){
                arms.removeWeapon(this.weapon.getMesh);
                scene.remove(this.weapon);
                weaponsGroup.remove(this.weapon.getMesh);
                this.weapon = null;
            }
            //drop wapen
            if(Key.isDown(Key.G)){
                countG++;
                var drop = this.weapon;
                arms.removeWeapon(this.weapon.getMesh);
                scene.remove(this.weapon);
                weaponsGroup.remove(this.weapon.getMesh);
                this.weapon = null;
                drop.getMesh.position.set(this.object.position.x,1,this.object.position.z);
                weaponsGroup.add(drop.getMesh);
                drop.setDecay(true,countG);
            }
        }

        if(this.dmgboost > 0 && !dmgcount){
            dmgcount = true;
            setTimeout(function(){
                stopdmgboost = true;
                dmgcount = false;
            }, dmgdur);
        }
        if(this.speedboost > 0 && !speedcount){
            speedcount = true;
            setTimeout(function(){
                stopspeedboost = true;
                speedcount = false;
            }, speeddur);
        }
        if(this.hpboost > 0 && !hpcount){
            hpcount = true;
            setTimeout(function(){
                stophpboost = true;
                hpcount = false;
            }, hpdur);
        }

        if(stopdmgboost){
            this.dmgboost = 0;
            stopdmgboost = false;
            var showbuff = document.getElementById('damageboost');
            showbuff.style.display = 'none';
        }
        if(stopspeedboost){
            this.speedboost = 0;
            stopspeedboost = false;
            var showbuff = document.getElementById('speedboost');
            showbuff.style.display = 'none';
        }
        if(stophpboost){
            this.maxHealth -= this.hpboost;
            if(this.health > this.maxHealth){
                this.health = this.maxHealth;
            }

            this.hpboost = 0;
            stophpboost = false;
            var showbuff = document.getElementById('healthboost');
            showbuff.style.display = 'none';
        }
        this.checkPickupWeapon();
    }

    attack(entitiesGroup,damageHandler,entities){
        var vector = new THREE.Vector3(0, 0, 0);
        var newvector = new THREE.Vector3().copy(controls.getDirection(vector));
        var rangeModifier = 0;

        this.raycaster.set(this.object.position,newvector);
        var intersections = this.raycaster.intersectObjects(entitiesGroup.children);
        if(intersections.length > 0) {
            var intersection = intersections[0].object;
            var entity = entities[parseInt(intersection.userData.ID) - 1];
            var entpos = new THREE.Vector3(intersection.position.x,0,intersection.position.z);
            var thispos = new THREE.Vector3(this.object.position.x,0,this.object.position.z);
            if(this.weapon != null){
                rangeModifier = this.weapon.getRange;
            }
            if(thispos.distanceTo(entpos) <= this.range + rangeModifier){
                damageHandler.dealDamageTo(this,entity);
            }
        }
    }

    checkPickupWeapon(){
        var vector = new THREE.Vector3(0, 0, 0);
        var newvector = new THREE.Vector3().copy(controls.getDirection(vector));

        this.raycaster.set(this.object.position,newvector);
        var intersections = this.raycaster.intersectObjects(weaponsGroup.children);
        if(intersections.length > 0) {
            var intersection = intersections[0].object;
            var weaponpos = new THREE.Vector3(intersection.position.x,intersection.position.y,intersection.position.z);
            var thispos = new THREE.Vector3(this.object.position.x,0,this.object.position.z);
            if(thispos.distanceTo(weaponpos) <= this.pickupRange){
                elem.innerHTML = "[E]Pickup: " + weapons[parseInt(intersection.userData.ID) - 1].name;
                if(Key.isDown(Key.E) && framecounter > 5){
                    if(this.weapon != null){
                        var drop = this.weapon;
                        arms.removeWeapon(this.weapon.getMesh);
                        scene.remove(this.weapon);
                        weaponsGroup.remove(this.weapon.getMesh);
                        this.weapon = null;
                        drop.getMesh.position.set(this.object.position.x,1,this.object.position.z);
                        weaponsGroup.add(drop.getMesh);
                        drop.setDecay(true,-1);
                    }
                    this.weapon = weapons[parseInt(intersection.userData.ID) - 1];
                    scene.remove(weapons[parseInt(intersection.userData.ID) - 1]);
                    weaponsGroup.remove(weapons[parseInt(intersection.userData.ID) - 1].getMesh);
                    this.weapon.getMesh.rotation.y = 0;
                    this.weapon.getMesh.position.set(arms.bone.position.x,arms.bone.position.y,arms.bone.position.z);
                    this.weapon.getMesh.translateZ(1.5);
                    arms.showWeapon(this.weapon.getMesh);
                    if(this.weapon.isDropped){
                        this.weapon.isDropped = false;
                    }
                    for(let i = 0; i < weaponSpawnpoints.length; i++){
                        if(weaponpos.equals(weaponSpawnpoints[i].getPos)){
                            weaponSpawnpoints[i].setWeapon(null);
                        }
                    }
                    var audio = new Audio('audio/pickup-weapon.mp3');
                    audio.play();
                    framecounter = 0;
                }
            }
            else{
                elem.innerHTML = "";
            }
        }
        else{
            elem.innerHTML = "";
        }
    }
    //check voor collision met entity
    playerCollisionCheck(){
        var direction = new THREE.Vector3().copy(this.object.position);
        this.raycaster.set(this.object.position, direction);
        var intersections = this.raycaster.intersectObjects(entitiesGroup.children);
        if(intersections.length > 0) {
            var intersection = intersections[0];
            if(intersection.distance <= 2) {
                return true;
            }
        }
        return false;
    }
}