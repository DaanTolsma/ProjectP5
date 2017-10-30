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
            if(pos.distanceTo(playerpos) <= 1.5 && framecounter > 5){
                if(this.buff.getHpBoost != 0 && player.getHpBoost == 0 && this.buff != null){
                    player.setHpBoost(this.buff.getHpBoost,this.buff.getDuration);
                    scorecounter += 50;
                    var elem = document.getElementById('score');
                    elem.innerHTML = "Score: " + scorecounter;
                    this.buff.removeBuff();
                    this.buff = null;
                }
                if(this.buff.getDmgBoost != 0 && this.buff != null){                //bij deze statements kan null uitkomen wanneer de
                    player.setDmgBoost(this.buff.getDmgBoost,this.buff.getDuration);//voorgaande statement is uitgevoerd, dit is geen probleem
                    scorecounter += 50;                                             //want het zal nooit in de andere statemens komen.
                    var elem = document.getElementById('score');
                    elem.innerHTML = "Score: " + scorecounter;
                    var showbuff = document.getElementById('damageboost');
                    showbuff.style.display = 'block';                     
                    this.buff.removeBuff();                                         
                    this.buff = null;
                    showbuff.style.display = 'none';    
                }
                if(this.buff.getSpeedBoost != 0 && this.buff != null){
                    player.setSpeedBoost(this.buff.getSpeedBoost,this.buff.getDuration);
                    scorecounter += 50;
                    var elem = document.getElementById('score');
                    elem.innerHTML = "Score: " + scorecounter;
                    this.buff.removeBuff();
                    this.buff = null;
                }
                if(this.buff.getHealth > 0 && player.getHealth < player.getMaxHealth && this.buff != null){
                    var finalhealth = player.getHealth + this.buff.getHealth;
                    scorecounter += 50;
                    var elem = document.getElementById('score');
                    elem.innerHTML = "Score: " + scorecounter;
                    if(finalhealth > player.getMaxHealth){
                        finalhealth = player.getMaxHealth;
                    }
                    player.setHealth(finalhealth);
                    this.buff.removeBuff();
                    this.buff = null;
                }
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