var material;
var geometry;

class Waypoint {
    constructor(posx,posz,id){
        this.id = id;
        material = new THREE.LineBasicMaterial({color: 0x0000ff});
        geometry = new THREE.SphereGeometry(3, 32, 32);
        this.mesh = new THREE.Mesh(geometry,material);
        this.mesh.position.set(posx,0,posz);
        this.positionvar = new THREE.Vector3(posx,0,posz);
        this.raycaster = new THREE.Raycaster();
    }

    get getMesh(){
        return this.mesh;
    }

    get getPosition(){
        return this.positionvar;
    }

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