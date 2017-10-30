var material;
var geometry;

class Collider{
    constructor(id,xsize,zsize,rotation,positionx,positiony,positionz){
        this.id = id;
        material = new THREE.MeshPhongMaterial({color: 0x0000ff});
        geometry = new THREE.BoxGeometry(xsize,20,zsize);
        this.mesh = new THREE.Mesh(geometry,material);
        this.mesh.rotation.set(0,rotation,0);
        this.mesh.position.set(positionx,positiony,positionz);
        this.mesh.visible = false;
    }

    get colliderMesh(){
        return this.mesh;
    }

    get colliderId(){
        return this.id;
    }

    get collidermeshPosition(){
        return this.mesh.position;
    }
}