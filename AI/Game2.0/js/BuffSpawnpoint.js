var spawnBuff = true;
var stopcount = false;
var framecounter = 0;
class BuffSpawnpoint {
    constructor(posx,posy,posz,cooldown){
        this.pos = new THREE.Vector3(posx,posy,posz);
        this.cooldown = cooldown;
        this.buff = null;
    }

    get getPos(){
        return this.pos;
    }

    get getBuff(){
        return this.buff;
    }

    get isAllowed(){
        return spawnBuff;
    }

    setBuff(buff){
        this.buff = buff;
    }

    updateSpawn(){
        framecounter++;
        if(this.buff != null){
            spawnBuff = false;
            this.buff.getMesh.rotation.y += 0.02;

            var pos = new THREE.Vector3(this.pos.x,0,this.pos.z);
            var playerpos = new THREE.Vector3(player.getMesh.position.x,0,player.getMesh.position.z);
            if(pos.distanceTo(playerpos) <= 1.5 && player.getHealth < player.getMaxHealth && framecounter > 5){
                var finalhealth = player.getHealth + this.buff.getHealth;
                if(finalhealth > 100){
                    finalhealth = 100;
                }
                player.setHealth(finalhealth);
                this.buff.removeBuff();
                this.buff = null;
                framecounter = 0;
            }
        }
        if(this.buff == null && !stopcount && !spawnBuff){
            stopcount = true;
            setTimeout(function(){
                spawnBuff = true;
                stopcount = false;
            }, this.cooldown);
        }
    }
}