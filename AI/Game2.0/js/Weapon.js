var stopdecay = false;
var decayed = false;
var previousname = "";
var dropcounter = 0;
var previouscounter = 0;

class Weapon {
    constructor(dmg,dur,range,speed,knockback,mesh,name,decay){
        this.dmg = dmg;
        this.dur = dur;
        this.range = range;
        this.speed = speed;
        this.knockback = knockback;
        this.mesh = mesh;
        this.destroyed = false;
        this.name = name;
        this.decay = decay;
        this.isDropped = false;
    }

    get getMesh(){
        return this.mesh;
    }

    get getDMG(){
        return this.dmg;
    }

    get getDUR(){
        return this.dur;
    }

    get getKnockback(){
        return this.knockback;
    }

    get getRange(){
        return this.range;
    }

    get getSpeed(){
        return this.speed;
    }

    get isDestroyed(){
        return this.destroyed;
    }

    setDur(){
        this.dur -= 1;
        if(this.dur <= 0){
            this.destroyed = true;
        }
    }

    setDecay(bool,counter){
        this.isDropped = bool;
        dropcounter = counter;
    }

    updateWeapon(){
        if(this.isDropped && !stopdecay){
            previouscounter = dropcounter;
            previousname = this.name;
            stopdecay = true;
            setTimeout(function(){
                decayed = true;
            }, this.decay);
        }
        if(decayed && this.isDropped){
            if(previousname == this.name && dropcounter == previouscounter){
                stopdecay = false;
                decayed = false;
                this.isDropped = false;
                scene.remove(this);
                weaponsGroup.remove(this.mesh);
            }
            else{
                stopdecay = false;
                decayed = false;
                this.isDropped = true;
            }
        }
        if(this.isDropped){
            this.mesh.rotation.y += 0.02;
        }
    }
}