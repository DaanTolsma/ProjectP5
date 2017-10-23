class Weapon {
    constructor(dmg,dur,range,speed,knockback,mesh,name){
        this.dmg = dmg;
        this.dur = dur;
        this.range = range;
        this.speed = speed;
        this.knockback = knockback;
        this.mesh = mesh;
        this.destroyed = false;
        this.name = name;
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
}