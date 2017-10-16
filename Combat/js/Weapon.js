var geometry;
var material;

class Weapon{
    constructor(length, dmg, id){
        geometry = new THREE.CubeGeometry(0.5, length, 0.5);
        material = new THREE.MeshPhongMaterial({color: 0xff0000});
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(15, 9, 0);
        this.weaponlength = length;
        this.damage = dmg;
        this.id = id;
        this.mesh.rotation.z += Math.PI / 2;
        this.cooldown = 0;
    }

    get WeaponLength(){
        return this.weaponlength;
    }

    get Damage(){
        return this.damage;
    }

    get WeaponId(){
        return this.id;
    }

    get WeaponMesh(){
        return this.mesh;
    }

    get WeaponPosition(){
        return this.mesh.position;
    }

    Weaponspeed(){
        this.mesh.position.x -= 3;
    }
}