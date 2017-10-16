var geometry;
var material;

class Dummy{
    constructor(hp, posx, posy, posz, id){
        geometry = new THREE.CubeGeometry(10, 10, 10);
        material = new THREE.MeshPhongMaterial({color: 0x330cf7});
        this.model = new THREE.Mesh(geometry, material);
        this.model.position.set(posx,posy,posz);
        this.id = id;
        this.hitpoints = hp;
        this.raycaster = new THREE.Raycaster();
    }

    get DummyMesh(){
        return this.model;
    }

    get DummyId(){
        return this.id;
    }

    get Dummyposition(){
        return this.model.position;
    }

    get Hitpoints(){
        return this.hitpoints;
    }

    setHP(hp){
        this.hitpoints = hp;
        console.log(this.hitpoints);
    }

    CheckHit(weapon) {
        var weaponposition = new THREE.Vector3().copy(weapon.mesh.position);
        var dummyposition = new THREE.Vector3().copy(this.model.position);
        var distance = weaponposition.distanceTo(dummyposition);

        if(distance <= weapon.weaponlength){
            return true;
        }
        return false;
    }

    DamageTaken(weapon){
        var weapondmg = weapon.damage;
        var dummyhp = this.hitpoints;

        var hpafterhit = dummyhp - weapondmg;
        this.setHP(hpafterhit);
    }
}