class Arms {
    constructor(posx,posz,mesh,geometry,mixer,bone){
        this.mesh = mesh;
        this.mixer = mixer;
        this.punch = this.mixer.clipAction(geometry.animations[1]);
        this.weaponAttack = this.mixer.clipAction(geometry.animations[3]);
        this.punch.setLoop(THREE.LoopOnce);
        this.weaponAttack.setLoop(THREE.LoopOnce);
        player.getMesh.add(this.mesh);
        this.mesh.eulerOrder = "YXZ";
        this.mesh.position.set(posx,4.5,posz);
        this.bone = bone;
    }

    get getMesh(){
        return this.mesh;
    }

    Animation(type){
        if(type == "punch"){
            this.punch.play().reset();
        }
        if(type == "weapon"){
            this.weaponAttack.play().reset();
        }
    }

    showWeapon(mesh){
        this.bone.add(mesh);
    }

    removeWeapon(mesh){
        this.bone.remove(mesh);
    }

    updateArms(delta){
        this.mixer.update(delta);
        this.mesh.position.set(player.getMesh.position.x,player.getMesh.position.y,player.getMesh.position.z);
        this.mesh.rotation.set(controls.pitch.rotation.x,player.getMesh.rotation.y,0);
        this.mesh.updateMatrix();
        this.mesh.translateX(0.61);//0.61
        this.mesh.translateY(-0.6);//-0.6
        if(player.weapon != null){
            this.mesh.rotateX(Math.PI / 3);
        }
        else{
            this.mesh.rotateX(0);
        }
    }
}