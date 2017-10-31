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
                    var showbuff = document.getElementById('healthboost');
                    showbuff.style.display = 'block';
                    var audio = new Audio('audio/powerup-coffee.mp3');
                    audio.play();
                    this.buff.removeBuff();
                    this.buff = null;
                }
                if(this.buff != null){
                    if(this.buff.getDmgBoost != 0 && player.getDmgBoost == 0){
                        player.setDmgBoost(this.buff.getDmgBoost,this.buff.getDuration);
                        scorecounter += 50;
                        var elem = document.getElementById('score');
                        elem.innerHTML = "Score: " + scorecounter;
                        var showbuff = document.getElementById('damageboost');
                        showbuff.style.display = 'block';
                        var audio = new Audio('audio/powerup-snack.mp3');
                        audio.play();
                        this.buff.removeBuff();
                        this.buff = null;
                    }
                }
                if(this.buff != null){
                    if(this.buff.getSpeedBoost != 0 && player.getSpeedBoost == 0){
                        player.setSpeedBoost(this.buff.getSpeedBoost,this.buff.getDuration);
                        scorecounter += 50;
                        var elem = document.getElementById('score');
                        elem.innerHTML = "Score: " + scorecounter;
                        var showbuff = document.getElementById('speedboost');
                        showbuff.style.display = 'block';
                        var audio = new Audio('audio/powerup-beer.mp3');
                        audio.play();
                        this.buff.removeBuff();
                        this.buff = null;
                    }
                }
                if(this.buff != null){
                    if(this.buff.getHealth > 0 && player.getHealth < player.getMaxHealth){
                        var finalhealth = player.getHealth + this.buff.getHealth;
                        scorecounter += 50;
                        var elem = document.getElementById('score');
                        elem.innerHTML = "Score: " + scorecounter;
                        if(finalhealth > player.getMaxHealth){
                            finalhealth = player.getMaxHealth;
                        }
                        player.setHealth(finalhealth);
                        var showbuff = document.getElementById('healthup');
                        showbuff.style.display = 'block';
                        setTimeout(function(){
                            showbuff.style.display = 'none';
                        }, 2000);
                        var audio = new Audio('audio/powerup-energy.mp3');
                        audio.play();
                        this.buff.removeBuff();
                        this.buff = null;
                    }
                }
                framecounter = 0;
            }
        } //geeft aan wanneer er een nieuwe buff mag worden gespawned
        if(this.buff == null && !stopcount && !spawnBuff){
            stopcount = true;
            setTimeout(function(){
                spawnBuff = true;
                stopcount = false;
            }, this.cooldown);
        }
    }
}