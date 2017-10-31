var material;
var geometry;

class Waypoint {
    constructor(posx,posz,id){
        this.id = id;
        this.positionvar = new THREE.Vector3(posx,0,posz);
        this.raycaster = new THREE.Raycaster();
    }


    get getPosition(){
        return this.positionvar;
    }
    //check voor direct line of sight met player vanuit deze waypoint
    checkPlayer(oGroup,targetPosition, objectId){
        var targetnegate = new THREE.Vector3().copy(targetPosition);
        var direction = new THREE.Vector3().copy(this.positionvar);
        direction.add(targetnegate.negate());
        direction.negate();
        direction.normalize();
        this.raycaster.set(this.positionvar,direction);
        var intersections = this.raycaster.intersectObjects(oGroup.children);
        if(intersections.length > 0) {
            var intersection = intersections[0].object;
            if(intersection.name == "player"){
                return true;
            }
            else if(parseInt(intersection.userData.ID) != objectId){
                return true;
            }
            else {
                return false;
            }
        }
        else{
            return false;
        }
    }
}