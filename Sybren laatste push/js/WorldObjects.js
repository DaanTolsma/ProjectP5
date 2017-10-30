class WorldObject {
    constructor(id, posx, posy, posz, objectmodel, index, rotation,cubemesh) {
        this.id = id;
        this.mesh = objectmodel;
        this.mesh.position.set(posx, posy, posz);
        this.indexnmr = index;
        this.rotation = rotation;
        this.waypoints = [];
        this.cubemesh = cubemesh;
        if(cubemesh != null){
            this.cubemesh.position.set(posx, posy, posz);
        }
    }

    get objectId(){
        return this.id;
    }

    get objectMesh(){
        return this.mesh;
    }

    get getPosition(){
        return this.mesh.position;
    }

    get Index(){
        return this.indexnmr;
    }

    get Rotation(){
        return this.rotation;
    }

    get CubeMesh(){
        return this.cubemesh;
    }

    setobjectWaypoints(list){
        this.waypoints = list;
    }

    get getWaypoints(){
        return this.waypoints;
    }
}