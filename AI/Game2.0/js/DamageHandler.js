 class DamageHandler{
    constructor(){

    }

    dealDamageTo(attacker,defender){
        var basedmg = attacker.getBasedmg;
        var finaldmg = basedmg;
        var hpdef = defender.getHealth;
        var newhealth = hpdef - finaldmg;
        if(newhealth <= 0){
            newhealth = 0;
            defender.kill();
        }
        defender.setHealth(newhealth);
    }
}