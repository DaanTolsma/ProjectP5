var objectId = null;
class Entity {
    constructor(size,id,speed,posx,posy,posz,model,geometry,mixer,inscene){
        this.size = size;
        this.id = id;
        this.speed = speed;
        this.mesh = model;
        this.mixer = mixer;
        this.idle = this.mixer.clipAction(geometry.animations[0]);
        this.run = this.mixer.clipAction(geometry.animations[1]);
        this.mesh.position.set(posx,posy,posz);
        this.currentSpeed = new THREE.Vector3();
        this.direction = new THREE.Vector3(0,0,0);
        this.direction.normalize();
        this.raycaster = new THREE.Raycaster();
        this.checkPlayerRaycaster = new THREE.Raycaster();
        this.inscene = inscene;
        this.route = [];
        this.routeStart = 0;
        this.calc = false;
        this.endRoute = false;
        this.objectWaypoints = [];
    }

    setEntityDirection(direction){
        this.direction = direction;
        this.direction.normalize();
    }

    Animation(play){
        if(play){
            //this.idle.stop();
            this.run.play();
        }
        else{
            this.run.stop();
            //this.idle.play();
        }
    }

    Route(route){
        this.route = route;
    }

    get getMesh(){
        return this.mesh;
    }

    get inScene(){
        return this.inscene;
    }

    updateSpeed(delta){
        this.currentSpeed.copy(this.direction).multiplyScalar(delta * this.speed);
    }

    updateEntity(delta, oGroup, targetPosition, objectGroup){
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
        this.mixer.update(delta, targetPosition);
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