class WorldObject{
    constructor(id,posx,posy,posz,objectmodel,index){
        this.id = id;
        this.mesh = objectmodel;
        this.mesh.position.set(posx,posy,posz);
        this.indexnmr = index;
        this.Bbox = new THREE.BoundingBoxHelper(this.mesh);
        this.Bbox.update();
    }

    getID(){
        return this.id;
    }

    getobjectMesh(){
        return this.mesh;
    }

    getobjectPosition(){
        return this.mesh.position;
    }

    getIndexnmr(){
        return this.indexnmr;
    }

    getBoundbox(){
        return this.Bbox;
    }
}