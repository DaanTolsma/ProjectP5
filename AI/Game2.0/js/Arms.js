class Arms {
    constructor(posx,posz,mesh,geometry,mixer){
        this.mesh = mesh;
        this.mixer = mixer;
        this.punch = this.mixer.clipAction(geometry.animations[1]);
        this.punch.setLoop(THREE.LoopOnce);
        player.getMesh.add(this.mesh);
        this.mesh.eulerOrder = "YXZ";
        this.mesh.position.set(posx,4.5,posz);
    }

    get getMesh(){
        return this.mesh;
    }

    Animation(type){
        if(type == "punch"){
            this.punch.play().reset();
        }
    }

    updateArms(delta){
        this.mixer.update(delta);
        this.mesh.position.set(player.getMesh.position.x,player.getMesh.position.y,player.getMesh.position.z);
        this.mesh.rotation.set(controls.pitch.rotation.x,player.getMesh.rotation.y,0);
        this.mesh.updateMatrix();
        this.mesh.translateX(0.61);
        this.mesh.translateY(-0.6);
    }
}