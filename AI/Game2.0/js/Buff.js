class Buff {
    constructor(health,name,mesh,dmgboost,speedboost,hpboost,dur){
        this.health = health;
        this.name = name;
        this.mesh = mesh;
        this.dmgboost = dmgboost;
        this.speedboost = speedboost;
        this.hpboost = hpboost;
        this.dur = dur;
    }

    get getHealth(){
        return this.health;
    }

    get getDmgBoost(){
        return this.dmgboost;
    }

    get getSpeedBoost(){
        return this.speedboost;
    }

    get getHpBoost(){
        return this.hpboost;
    }

    get getDuration(){
        return this.dur;
    }

    get getMesh(){
        return this.mesh;
    }

    removeBuff(){
        scene.remove(this);
        buffGroup.remove(this.mesh);
    }
}