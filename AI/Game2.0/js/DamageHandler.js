class DamageHandler{
    constructor(){

    }

    dealDamageTo(attacker,defender){
        var basedmg = attacker.getBasedmg;
        var hpdef = defender.getHealth;
        var weaponDur = -1;
        var knockback = 0;
        var weaponbonus = 0;
        if(attacker instanceof Player){
            knockback = attacker.getKnockback;
            if(attacker.weapon != null){
                weaponbonus = attacker.weapon.getDMG;
                weaponDur = attacker.weapon.getDUR;
                knockback += attacker.weapon.getKnockback;
            }
            defender.setKnockback(knockback);
        }
        var averagedmg = basedmg + weaponbonus;
        var RNGpercentage = 0.15;
        var mindmg = averagedmg * (1 - RNGpercentage);
        var maxdmg = averagedmg * (1 + RNGpercentage);
        var finaldmg = Math.floor((Math.random() * (maxdmg - mindmg)) + mindmg);
        var newhealth = hpdef - finaldmg;
        if(weaponDur > 0){
            attacker.weapon.setDur();
        }
        if(newhealth <= 0){
            newhealth = 0;
            defender.kill();
        }
        defender.setHealth(newhealth);
    }
}