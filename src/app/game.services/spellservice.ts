import { Castable } from 'app/game.spells/castable';
import { GameEntity } from 'app/game.entities/gameentity';
import { DamageRoll } from 'app/game.utils/damageroll';
import { DamageType } from 'app/game.utils/damagetypes';
import { Logger } from 'app/game.services/logger';
import { Injectable } from '@angular/core';
import { SavingThrow } from 'app/game.utils/savingthrow';
import { StandardDiceRoll } from 'app/game.dicerollers/standarddiceroll';
import { Role } from 'app/game.enums/roles';
import { Condition } from 'app/game.enums/conditions';
import { Talent } from 'app/game.enums/talents';

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

                const cureRoll = new StandardDiceRoll(1, 8, caster.getWil() * 2);

                caster.gainHP(cureRoll.totalResult);

                log.addEntry(caster.name + ' gains ' + cureRoll.toString() + ' Hp');
            }
        }, {
            name: 'Resumptio',
            spellLevel: 2,
            slotExpendend: 1,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                // Removes one condition
                log.addEntry(caster.name + ' casts ' + this.name);

                const first = caster.conditions.keys().next().value;

                caster.conditions.delete(first);
            }
        }, {
            name: 'Purificatio',
            spellLevel: 2,
            slotExpendend: 1,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                // Removes Curse or every condition
                log.addEntry(caster.name + ' casts ' + this.name);

                if (caster.conditions.has(Condition.Cursed)) {

                    caster.conditions.delete(Condition.Cursed);
                } else {
                    caster.conditions.clear();
                }

            }
        }, {
            name: 'Sagitta',
            spellLevel: 1,
            slotExpendend: 1,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                log.addEntry(caster.name + ' casts ' + this.name);
                const dmg = new DamageRoll(1, 6, caster.getWil() * 2, DamageType.Light, false,
                    false, caster.talent === Talent.Luminous);
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

                    const savingThrow = new SavingThrow(targets[0].getTouSavingThrow(),
                        caster.getDifficultyClass(),
                        false,
                        target.name,
                        log);

                    const dmg = new DamageRoll(caster.getWil(), 6, caster.getWil(), DamageType.Light, false,
                        savingThrow.isSuccessful(), caster.talent === Talent.Luminous);

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
            name: 'Phalanx',
            spellLevel: 3,
            slotExpendend: 2,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                // All the targets take 1d8+(Will) damage, Agi save halves
                log.addEntry(caster.name + ' casts ' + this.name);
                for (const target of targets) {

                    const savingThrow = new SavingThrow(targets[0].getAgiSavingThrow(),
                        caster.getDifficultyClass(),
                        false,
                        target.name,
                        log);

                    const dmg = new DamageRoll(1, 8, caster.getWil(), DamageType.Light, false,
                        savingThrow.isSuccessful(), caster.talent === Talent.Luminous);

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

                log.addEntry(caster.name + ' casts ' + this.name);

                const savingThrow = new SavingThrow(targets[0].getTouSavingThrow(),
                    caster.getDifficultyClass(),
                    targets[0].role === Role.Fighter && targets[0].level >= 8,
                    targets[0].name,
                    log);

                const dmg = new DamageRoll(1, 3, caster.getWil(), DamageType.Darkness, false, savingThrow.isSuccessful());
                const finalDamage = targets[0].takeDamageFromRoll(dmg);

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
            name: 'Cause Serious Wounds',
            spellLevel: 2,
            slotExpendend: 4,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                // The target takes 3d4 + (Wil) damage, TOU save halves

                log.addEntry(caster.name + ' casts ' + this.name);

                const savingThrow = new SavingThrow(targets[0].getTouSavingThrow(),
                    caster.getDifficultyClass(),
                    targets[0].role === Role.Fighter && targets[0].level >= 8,
                    targets[0].name,
                    log);

                const dmg = new DamageRoll(3, 4, caster.getWil(), DamageType.Darkness, false, savingThrow.isSuccessful());
                const finalDamage = targets[0].takeDamageFromRoll(dmg);

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
            name: 'Cause Mortal Wounds',
            spellLevel: 3,
            slotExpendend: 6,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                // The target takes 6d4 + (Wil) damage, TOU save halves

                log.addEntry(caster.name + ' casts ' + this.name);

                const savingThrow = new SavingThrow(targets[0].getTouSavingThrow(),
                    caster.getDifficultyClass(),
                    targets[0].role === Role.Fighter && targets[0].level >= 8,
                    targets[0].name,
                    log);

                const dmg = new DamageRoll(6, 4, caster.getWil(), DamageType.Darkness, false, savingThrow.isSuccessful());
                const finalDamage = targets[0].takeDamageFromRoll(dmg);

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

                const cureRoll = new StandardDiceRoll(1, 4, caster.getWil());

                targets[0].gainHP(cureRoll.totalResult);

                log.addEntry(targets[0].name + ' gains ' + cureRoll.toString() + ' Hp');
            }
        }, {
            name: 'Bleed',
            spellLevel: 1,
            slotExpendend: 2,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                // The target becomes Bleeding, WIL save negates

                log.addEntry(caster.name + ' casts ' + this.name);

                const savingThrow = new SavingThrow(targets[0].getTouSavingThrow(),
                    caster.getDifficultyClass(),
                    targets[0].role === Role.Fighter && targets[0].level >= 8,
                    targets[0].name,
                    log);

                if (!savingThrow.isSuccessful()) {

                    targets[0].takeCondition(Condition.Bleeding, Math.max(1, 2 + caster.getWil()));
                }
            }
        }, {
            name: 'Confusion',
            spellLevel: 2,
            slotExpendend: 4,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                // The target becomes Confused, WIL save negates

                log.addEntry(caster.name + ' casts ' + this.name);

                const savingThrow = new SavingThrow(targets[0].getWilSavingThrow(),
                    caster.getDifficultyClass(),
                    targets[0].role === Role.Fighter && targets[0].level >= 8,
                    targets[0].name,
                    log);

                if (!savingThrow.isSuccessful()) {

                    targets[0].takeCondition(Condition.Confused, Math.max(1, 2 + caster.getWil()));
                }
            }
        }, {
            name: 'Fear',
            spellLevel: 1,
            slotExpendend: 2,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                // The target becomes Frightened, WIL save negates

                log.addEntry(caster.name + ' casts ' + this.name);

                const savingThrow = new SavingThrow(targets[0].getWilSavingThrow(),
                    caster.getDifficultyClass(),
                    targets[0].role === Role.Fighter && targets[0].level >= 8,
                    targets[0].name,
                    log);

                if (!savingThrow.isSuccessful()) {

                    targets[0].takeCondition(Condition.Frightened, Math.max(1, 2 + caster.getWil()));
                }
            }
        }, {
            name: 'Maiming',
            spellLevel: 2,
            slotExpendend: 4,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                // The target becomes Maimed, TOU save negates

                log.addEntry(caster.name + ' casts ' + this.name);

                const savingThrow = new SavingThrow(targets[0].getTouSavingThrow(),
                    caster.getDifficultyClass(),
                    targets[0].role === Role.Fighter && targets[0].level >= 8,
                    targets[0].name,
                    log);

                if (!savingThrow.isSuccessful()) {

                    targets[0].takeCondition(Condition.Maimed, -1);
                }
            }
        }, {
            name: 'Lesser Mind Wave',
            spellLevel: 1,
            slotExpendend: 2,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                // The target becomes Stunned, WIL save negates

                log.addEntry(caster.name + ' casts ' + this.name);

                const savingThrow = new SavingThrow(targets[0].getWilSavingThrow(),
                    caster.getDifficultyClass(),
                    targets[0].role === Role.Fighter && targets[0].level >= 8,
                    targets[0].name,
                    log);

                if (!savingThrow.isSuccessful()) {

                    targets[0].takeCondition(Condition.Stunned, 1);
                }
            }
        }, {
            name: 'Greater Mind Wave',
            spellLevel: 2,
            slotExpendend: 1,
            isAura: false,
            cast: function (targets: GameEntity[], caster: GameEntity) {

                // The target becomes Paralized, WIL save negates

                log.addEntry(caster.name + ' casts ' + this.name);

                const savingThrow = new SavingThrow(targets[0].getWilSavingThrow(),
                    caster.getDifficultyClass(),
                    targets[0].role === Role.Fighter && targets[0].level >= 8,
                    targets[0].name,
                    log);

                if (!savingThrow.isSuccessful()) {

                    targets[0].takeCondition(Condition.Paralyzed, 2);
                }
            }
        }];
    }

    getSpells(): Castable[] {
        return this.spells;
    }
    getSpellByName(name: string): Castable {
        return this.spells.find(sp => sp.name === name);
    }
    getQuickCastable(minValue: number): Castable {
        return this.spells.find(sp => sp.spellLevel + 2 <= minValue);
    }
}



