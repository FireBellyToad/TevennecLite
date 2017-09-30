import { Castable } from 'app/game.spells/castable';
import { GameEntity } from 'app/game.entities/gameentity';
import { DamageRoll } from 'app/game.utils/damageroll';
import { DamageType } from 'app/game.utils/damagetypes';
import { Logger } from 'app/game.services/logger';
import { Injectable } from '@angular/core';
import { SavingThrow } from 'app/game.utils/savingthrow';

@Injectable()
export class SpellService {

    log: Logger;

    spells: Castable[];

    constructor(log: Logger) {
        this.log = log
        this.spells = [{
            name: 'Sagitta',
            spellLevel: 1,
            slotExpendend: 1,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                log.addEntry(caster.name + ' casts ' + this.name);
                const dmg = new DamageRoll(1, 6, caster.wil * 2, DamageType.Light);
                const finalDamage = targets[0].takeDamage(dmg);

                let resImmVulMessage = '';
                if (targets[0].hasVulnerability(dmg.damageType)) {
                    resImmVulMessage = '*VULNERABLE*'
                }
                log.addDamageEntry(targets[0].name,
                    caster.name,
                    dmg.toString(),
                    finalDamage.toString(),
                    resImmVulMessage);
            }
        }, {
            name: 'Deflagratio',
            spellLevel: 4,
            slotExpendend: 2,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                // All the targets take (Will)d6+(Will) damage, TOU save halves
                log.addEntry(caster.name + ' casts ' + this.name);
                for (const target of targets) {

                    const savingThrow = new SavingThrow(target.getTouSavingThrow(), caster.getDifficultyClass());

                    const dmg = new DamageRoll(caster.wil, 6, caster.wil, DamageType.Light, false, savingThrow.hasSuccess());

                    log.addSavingThrowEntry(target.name, savingThrow.saveRoll.toString(),
                        savingThrow.difficultyClass.toString(),
                        savingThrow.hasSuccess());

                    const finalDamage = target.takeDamage(dmg);

                    let resImmVulMessage = '';
                    if (target.hasVulnerability(dmg.damageType)) {
                        resImmVulMessage = '*VULNERABLE*'
                    }

                    log.addDamageEntry(target.name,
                        caster.name,
                        dmg.toString(),
                        finalDamage.toString(),
                        resImmVulMessage);
                }
            }
        }];
    }

    getSpells(): Castable[] {
        return this.spells;
    }
}



