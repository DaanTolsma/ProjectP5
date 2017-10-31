//deze class was voor het testen van waypoint generator en AI movement
class Wall {
    constructor(sizex,sizez,sizey,id,posx,posy,posz){
        this.sizex = sizex;
        this.sizez = sizez;
        this.sizey = sizey;
        this.id = id;
        var box = new THREE.BoxGeometry(this.sizex,this.sizey,this.sizez);
        var material = new THREE.MeshPhongMaterial({color: 0x66ff66 });
        material.shininess = 0.1;
        this.mesh = new THREE.Mesh(box,material);
        this.mesh.position.set(posx,posy,posz);
        this.waypoints = [];
    }

    setWaypoints(list){
        this.waypoints = list;
    }

    get getWaypoints(){
        return this.waypoints;
    }

    get getMesh(){
        return this.mesh;
    }

    get sizeX(){
        return this.sizex;
    }

    get sizeZ(){
        return this.sizez;
    }

    get sizeY(){
        return this.sizey;
    }

    get getId(){
        return this.id;
    }
}