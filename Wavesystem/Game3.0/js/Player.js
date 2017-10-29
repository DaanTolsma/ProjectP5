var attackAllowed = true;
class Player {
    constructor(object,posx,posz,id,size,health,range,dmg,cooldown){
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
        this.direction = new THREE.Vector3(0,0,0);
        this.direction.normalize();
    }

    get getMesh(){
        return this.object;
    }

    get getHealth(){
        return this.health;
    }

    get getRange(){
        return this.range;
    }

    get getBasedmg(){
        return this.basedmg;
    }

    get getBasecooldown(){
        return this.basecooldown;
    }

    get isDeath(){
        return this.death;
    }

    kill(){
        this.death = true;
    }

    setHealth(hp){
        this.health = hp;
        let health = document.getElementById("healthbar");
        health.value = this.health;
    }

    setRange(range){
        this.range = range;
    }

    updatePlayer(entitiesGroup,damageHandler,entities){
        if(Key.isDown(Key.F) && attackAllowed){
            attackAllowed = false;
            setTimeout(function(){
                attackAllowed = true;
            }, this.basecooldown);
            this.attack(entitiesGroup,damageHandler,entities);
        }
        if(Key.isDown(Key.Q)){
            console.log(this.object.position);
        }
        for(var i = 0; i < worldobjects.length; i++) {
            this.objectCollisionCheck(worldobjects[i]);
        }
    }

    attack(entitiesGroup,damageHandler,entities){
        var vector = new THREE.Vector3(0, 0, 0);
        var newvector = new THREE.Vector3().copy(controls.getDirection(vector));
        this.raycaster.set(this.object.position,newvector);
        var intersections = this.raycaster.intersectObjects(entitiesGroup.children);
        if(intersections.length > 0) {
            var intersection = intersections[0].object;
            var entity = entities[parseInt(intersection.userData.ID) - 1];
            var entpos = new THREE.Vector3(intersection.position.x,0,intersection.position.z);
            var thispos = new THREE.Vector3(this.object.position.x,0,this.object.position.z);
            if(thispos.distanceTo(entpos) <= this.range){
                damageHandler.dealDamageTo(this,entity);
            }
        }
    }

    playerCollisionCheck(entity){
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

    objectCollisionCheck(worldobject){
        /*var direction = new THREE.Vector3().copy(this.object.position);
        this.raycaster.set(this.object.position, direction);
        var intersections = this.raycaster.intersectObjects(lvlobject.children);
        if(intersections.length > 0) {
            console.log("collision1");
            var intersection = intersections[0];
            if(intersection.distance < 10){
                console.log("collision");
                this.speed = 0;
            }
        }*/
    }
}