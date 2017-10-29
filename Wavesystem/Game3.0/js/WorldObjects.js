class WorldObject {
    constructor(id, posx, posy, posz, objectmodel, index, rotation) {
        this.id = id;
        this.mesh = objectmodel;
        this.mesh.position.set(posx, posy, posz);
        this.indexnmr = index;
        this.rotation = rotation
    }

    get objectId(){
        return this.id;
    }

    get objectMesh(){
        return this.mesh;
    }

    get positionObject(){
        return this.mesh.position;
    }

    get Index(){
        return this.indexnmr;
    }

    get Rotation(){
        return this.rotation;
    }
}