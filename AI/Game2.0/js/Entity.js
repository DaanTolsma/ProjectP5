var objectId = null;
var listwaypoints = [];
var attack = true;
var knockbackSpeed = 0.5;
class Entity {
    constructor(size,id,speed,posx,posy,posz,model,geometry,mixer,health,dmg,range,cooldown){
        this.size = size;
        this.id = id;
        this.speed = speed;
        this.mesh = model;
        this.mixer = mixer;
        this.idle = this.mixer.clipAction(geometry.animations[0]);
        this.run = this.mixer.clipAction(geometry.animations[2]);
        this.punch = this.mixer.clipAction(geometry.animations[1]);
        this.punch.setLoop(THREE.LoopOnce);
        this.mesh.position.set(posx,posy,posz);
        this.currentSpeed = new THREE.Vector3();
        this.direction = new THREE.Vector3(0,0,0);
        this.direction.normalize();
        this.raycaster = new THREE.Raycaster();
        this.checkPlayerRaycaster = new THREE.Raycaster();
        this.route = [];
        this.routeStart = 0;
        this.calc = false;
        this.endRoute = false;
        this.objectWaypoints = [];
        this.health = health;
        this.basedmg = dmg;
        this.range = range;
        this.basecooldown = cooldown;
        this.death = false;
        this.applyKnockback = 0;
    }

    setEntityDirection(direction){
        this.direction = direction;
        this.direction.normalize();
    }

    setRange(range){
        this.range = range;
    }

    Route(route){
        this.route = route;
    }

    setHealth(hp){
        this.health = hp;
    }

    setKnockback(value){
        this.applyKnockback = value;
    }

    get getMesh(){
        return this.mesh;
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
        updateEntityCounter();
    }


    updateSpeed(delta){
        this.currentSpeed.copy(this.direction).multiplyScalar(delta * this.speed);
    }

    Animation(type){
        if(type == "run"){
            this.run.play();
        }
        else if(type == "punch"){
            this.punch.play();
        }
        if(type == "" && this.run.isRunning()){
            this.run.stop();
        }
    }

    updateEntity(delta, oGroup, player, objectGroup,damageHandler){
        var targetPosition = new THREE.Vector3(player.getMesh.position.x,0,player.getMesh.position.z);
        var currentPosition = new THREE.Vector3(this.mesh.position.x,0,this.mesh.position.z);
        this.mixer.update(delta, targetPosition);

        if(this.applyKnockback > 0){
            this.mesh.translateZ(-knockbackSpeed);
            this.applyKnockback -= knockbackSpeed;
        }

        if(this.applyKnockback <= 0){
            if(currentPosition.distanceTo(targetPosition) > playerCol){
                this.Animation("run");
                this.updateSpeed(delta);
                this.playerCheck(oGroup,targetPosition,objectGroup);
                if(this.route.length > 0){
                    this.executeRoute(oGroup,targetPosition);
                }
                else{
                    var targetnegate = new THREE.Vector3().copy(targetPosition);
                    var direction = new THREE.Vector3().copy(this.mesh.position);
                    direction.add(targetnegate.negate());
                    direction.negate();
                    this.setEntityDirection(direction);
                    var matrix = new THREE.Matrix4().lookAt(direction,new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0));
                    var qt = new THREE.Quaternion().setFromRotationMatrix(matrix);
                    this.mesh.setRotationFromQuaternion(qt);
                }
                this.mesh.position.add(this.currentSpeed);
            }
            else{
                this.Animation("");
            }
        }

        if(currentPosition.distanceTo(targetPosition) <= this.range && attack){
            this.punch.reset();
            damageHandler.dealDamageTo(this,player);
            this.Animation("punch");
            attack = false;
            setTimeout(function(){
                attack = true;
            }, this.basecooldown);
        }
    }

    checkObjectCollision(oGroup, targetPosition, objectGroup){
        if(this.route.length <= 0){
            this.raycaster.set(this.mesh.position, this.direction);
            var intersections = this.raycaster.intersectObjects(oGroup.children);
            if(intersections.length > 0) {
                var intersection = intersections[0].object;
                if(intersection.name != "player"){
                    var list = objectGroup[parseInt(intersection.userData.ID) - 1].getWaypoints;
                    objectId = parseInt(intersection.userData.ID);
                    listwaypoints = list;
                    var previousDistance = null;
                    var closestWaypoint = null;
                    var closestObject = null;
                    var route = [];
                    for(let i = 0; i < list.length; i++){
                        var distance = this.mesh.position.distanceTo(list[i].getPosition);
                        if(previousDistance == null){
                            previousDistance = distance;
                            closestObject = list[i];
                            closestWaypoint = new THREE.Vector3().copy(list[i].getPosition);
                        }
                        else if(distance <= previousDistance){
                            previousDistance = distance;
                            closestObject = list[i];
                            closestWaypoint = new THREE.Vector3().copy(list[i].getPosition);
                        }
                    }
                    this.objectWaypoints.push(closestObject);
                    route.push(closestWaypoint);
                    var closestWaypointPlayer = null;
                    var nextWaypoint = null;
                    var objectPlayer = null;
                    var nextObject = null;
                    var previousDistanceNext = null;
                    previousDistance = null;
                    for(let i = 0; i < list.length; i++){
                        distance = list[i].getPosition.distanceTo(targetPosition);
                        var distanceNext = null;
                        if(!list[i].getPosition.equals(closestWaypoint)){
                            distanceNext = closestWaypoint.distanceTo(list[i].getPosition);
                        }
                        if(previousDistance == null){
                            previousDistance = distance;
                            objectPlayer = list[i];
                            closestWaypointPlayer = new THREE.Vector3().copy(list[i].getPosition);
                        }
                        else if(distance <= previousDistance){
                            previousDistance = distance;
                            objectPlayer = list[i];
                            closestWaypointPlayer = new THREE.Vector3().copy(list[i].getPosition);
                        }

                        if(previousDistanceNext == null && distanceNext != null){
                            previousDistanceNext = distanceNext;
                            nextObject = list[i];
                            nextWaypoint = new THREE.Vector3().copy(list[i].getPosition);
                        }
                        else if(distanceNext <= previousDistanceNext && distanceNext != null){
                            previousDistanceNext = distanceNext;
                            nextObject = list[i];
                            nextWaypoint = new THREE.Vector3().copy(list[i].getPosition);
                        }
                    }
                    if(closestWaypoint.equals(closestWaypointPlayer)){
                        this.Route(route);
                    }
                    else if(nextWaypoint.equals(closestWaypointPlayer)){
                        this.objectWaypoints.push(nextObject);
                        route.push(nextWaypoint);
                        this.Route(route);
                    }
                    else {
                        this.objectWaypoints.push(nextObject);
                        this.objectWaypoints.push(objectPlayer);
                        route.push(nextWaypoint);
                        route.push(closestWaypointPlayer);
                        this.Route(route);
                    }
                }
            }
        }
    }

    executeRoute(oGroup,targetPosition){
        if(!this.calc){
            var waypointnegate = new THREE.Vector3().copy(this.route[this.routeStart]);
            var direction = new THREE.Vector3().copy(this.mesh.position);
            direction.add(waypointnegate.negate());
            direction.negate();
            this.setEntityDirection(direction);
            var matrix = new THREE.Matrix4().lookAt(direction,new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0));
            var qt = new THREE.Quaternion().setFromRotationMatrix(matrix);
            this.mesh.setRotationFromQuaternion(qt);
            this.calc = true;
            this.checkDirectLineOfSight(oGroup,targetPosition);
        }
        var waypoint = new THREE.Vector3().copy(this.route[this.routeStart]);
        var waypointObject = this.objectWaypoints[this.routeStart];
        if(this.routeStart + 1 < this.objectWaypoints.length){
            var startIndex = listwaypoints.indexOf(waypointObject);
            var cornerIndex = startIndex + 2;
            if(cornerIndex >= listwaypoints.length){
                cornerIndex = cornerIndex - listwaypoints.length;
            }
            var nextInRouteIndex = listwaypoints.indexOf(this.objectWaypoints[this.routeStart + 1]);
            if(cornerIndex == nextInRouteIndex){
                this.routeStart = 0;
                this.route = [];
                this.calc = false;
                this.endRoute = false;
                this.objectWaypoints = [];
            }
        }
        if(this.mesh.position.distanceTo(waypoint) <= 1){
            if(this.endRoute){
                this.routeStart = 0;
                this.route = [];
                this.calc = false;
                this.endRoute = false;
                this.objectWaypoints = [];
            }
            else if(this.routeStart + 1 < this.route.length){
                this.routeStart += 1;
                this.calc = false;
            }
            else{
                this.routeStart = 0;
                this.route = [];
                this.calc = false;
                this.endRoute = false;
                this.objectWaypoints = [];
            }
        }
    }

    checkDirectLineOfSight(oGroup,targetPosition){
        var check = this.objectWaypoints[this.routeStart].checkPlayer(oGroup,targetPosition,objectId);
        if(check){
            this.endRoute = true;
        }
    }

    playerCheck(oGroup,targetPosition,objectGroup){
        var targetnegate = new THREE.Vector3().copy(targetPosition);
        var direction = new THREE.Vector3().copy(this.mesh.position);
        direction.add(targetnegate.negate());
        direction.negate();
        direction.normalize();
        this.checkPlayerRaycaster.set(this.mesh.position,direction);
        var intersections = this.checkPlayerRaycaster.intersectObjects(oGroup.children);
        if(intersections.length > 0) {
            var intersection = intersections[0].object;
            if(intersection.name == "player"){
                this.routeStart = 0;
                this.route = [];
                this.calc = false;
                this.endRoute = false;
                this.objectWaypoints = [];
            }
            else{
                this.checkObjectCollision(oGroup, targetPosition, objectGroup);
            }
        }
    }
}