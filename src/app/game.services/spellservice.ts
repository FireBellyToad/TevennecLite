import { Castable } from 'app/game.spells/castable';
import { GameEntity } from 'app/game.entities/gameentity';
import { DamageRoll } from 'app/game.utils/damageroll';
import { DamageType } from 'app/game.utils/damagetypes';
import { Logger } from 'app/game.services/logger';
import { Injectable } from '@angular/core';
import { SavingThrow } from 'app/game.utils/savingthrow';
import { StandardDiceRoll } from 'app/game.dicerollers/standarddiceroll';

@Injectable()
export class SpellService {

    log: Logger;

    spells: Castable[];

    constructor(log: Logger) {
        this.log = log
        this.spells = [{
            name: 'Medico',
            spellLevel: 1,
            slotExpendend: 1,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                // The target gains 1d8+(Wil*2) hp
                log.addEntry(caster.name + ' casts ' + this.name);

                const cureRoll = new StandardDiceRoll(1, 8, caster.wil * 2);

                targets[0].gainHP(cureRoll.totalResult);

                log.addEntry(targets[0].name + ' gains ' + cureRoll.toString() + ' Hp');
            }
        }, {
            name: 'Sagitta',
            spellLevel: 1,
            slotExpendend: 1,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                log.addEntry(caster.name + ' casts ' + this.name);
                const dmg = new DamageRoll(1, 6, caster.wil * 2, DamageType.Light);
                const finalDamage = targets[0].takeDamageFromRoll(dmg);

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

                    const finalDamage = target.takeDamageFromRoll(dmg);

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
        }, {
            name: 'Cause Wounds',
            spellLevel: 1,
            slotExpendend: 2,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                // The target takes 1d3+(Wil) damage, TOU save halves

                const savingThrow = new SavingThrow(targets[0].getTouSavingThrow(), caster.getDifficultyClass());
                log.addEntry(caster.name + ' casts ' + this.name);

                const dmg = new DamageRoll(1, 3, caster.wil, DamageType.Darkness, false, savingThrow.hasSuccess());
                const finalDamage = targets[0].takeDamageFromRoll(dmg);

                log.addSavingThrowEntry(targets[0].name, savingThrow.saveRoll.toString(),
                    savingThrow.difficultyClass.toString(),
                    savingThrow.hasSuccess());

                let resImmVulMessage = '';
                if (targets[0].hasVulnerability(dmg.damageType)) {
                    resImmVulMessage = '*VULNERABLE*'
                } else if (targets[0].hasResistance(dmg.damageType)) {
                    resImmVulMessage = '*RESISTANT*'
                }
                log.addDamageEntry(targets[0].name,
                    caster.name,
                    dmg.toString(),
                    finalDamage.toString(),
                    resImmVulMessage);
            }
        }, {
            name: 'Cure Wounds',
            spellLevel: 1,
            slotExpendend: 2,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                // The target gains 1d4+(Wil) hp
                log.addEntry(caster.name + ' casts ' + this.name);

                const cureRoll = new StandardDiceRoll(1, 4, caster.wil);

                targets[0].gainHP(cureRoll.totalResult);

                log.addEntry(targets[0].name + ' gains ' + cureRoll.toString() + ' Hp');
            }
        }];
    }

    getSpells(): Castable[] {
        return this.spells;
    }
    getSpellByName(name: string): Castable {
        return this.spells.find(sp => sp.name === name);
    }
}



