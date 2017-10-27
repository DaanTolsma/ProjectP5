class Buff {
    constructor(health,name,mesh){
        this.health = health;
        this.name = name;
        this.mesh = mesh;
    }

    get getHealth(){
        return this.health;
    }

    get getMesh(){
        return this.mesh;
    }

    removeBuff(){
        scene.remove(this);
        buffGroup.remove(this.mesh);
    }
}