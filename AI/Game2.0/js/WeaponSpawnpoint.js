var spawnWeapon = true;
var stopcount = false;
class WeaponSpawnpoint {
    constructor(posx,posy,posz,cooldown){
        this.pos = new THREE.Vector3(posx,posy,posz);
        this.cooldown = cooldown;
        this.weapon = null;
    }

    get getPos(){
        return this.pos;
    }

    get getWeapon(){
        return this.weapon;
    }

    get isAllowed(){
        return spawnWeapon;
    }

    setWeapon(weapon){
        this.weapon = weapon;
    }

    updateSpawn(){
        if(this.weapon != null){
            spawnWeapon = false;
        }
        if(this.weapon == null && !stopcount && !spawnWeapon){
            stopcount = true;
            setTimeout(function(){
                spawnWeapon = true;
                stopcount = false;
            }, this.cooldown);
        }
    }
}