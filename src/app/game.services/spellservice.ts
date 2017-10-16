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
import { AuraSpell } from 'app/game.spells/auraspell';
import { AuraEffect } from 'app/game.enums/auraeffects';

@Injectable()
export class SpellService {

    log: Logger;

    spells: Castable[];

    constructor(log: Logger) {
        this.log = log
        this.spells = [
            new AuraSpell('Arma', 2, 1, false, AuraEffect.Arma, log),
            new AuraSpell('Lux', 1, 1, false, AuraEffect.Lux, log),
            new AuraSpell('Scutum', 3, 2, false, AuraEffect.Scutum, log),
            new AuraSpell('Celeritas', 3, 2, false, AuraEffect.Celeritas, log),
            new AuraSpell('Fortitudo', 4, 2, false, AuraEffect.Fortitudo, log),
            new AuraSpell('Consecratio', 4, 2, false, AuraEffect.Consecratio, log),
            new AuraSpell('Impulsus', 2, 1, false, AuraEffect.Impulsus, log),
            new AuraSpell('Iracundia', 3, 2, false, AuraEffect.Iracundia, log),
            {
                name: 'Medico',
                spellLevel: 1,
                slotExpendend: 1,
                isMonsterSpell: false,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // The target gains 1d8+(Wil*2) hp
                    log.addEntry(caster.name + ' casts ' + this.name);

                    const cureRoll = new StandardDiceRoll(1, 8, caster.getWil() * 2);

                    caster.gainHP(cureRoll.totalResult);

                    log.addEntry(caster.name + ' gains ' + cureRoll.toString() + ' Hp');
                }
            }, {
                name: 'Carcero',
                spellLevel: 3,
                slotExpendend: 2,
                isMonsterSpell: false,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // The target becomes Paralized, on a successful WIL save becomes stunned

                    log.addEntry(caster.name + ' casts ' + this.name);

                    const savingThrow = new SavingThrow(targets[0].getWilSavingThrow(),
                        caster.getDifficultyClass(),
                        false,
                        targets[0].name,
                        log);

                    if (!savingThrow.isSuccessful()) {

                        if (!targets[0].takeCondition(Condition.Paralyzed, 2)) {
                            log.addEntry(targets[0].name + ' cannot be Paralyzed');
                        }
                    } else {

                        if (!targets[0].takeCondition(Condition.Stunned, 1)) {
                            log.addEntry(targets[0].name + ' cannot be Stunned');
                        }
                    }
                }
            }, {
                name: 'Resumptio',
                spellLevel: 2,
                slotExpendend: 1,
                isMonsterSpell: false,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // Removes one condition
                    log.addEntry(caster.name + ' casts ' + this.name);

                    const first = caster.conditions.keys().next().value;

                    caster.conditions.delete(first);
                }
            }, {
                name: 'Purificatio',
                spellLevel: 4,
                slotExpendend: 2,
                isMonsterSpell: false,
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
                isMonsterSpell: false,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // Target takes 1d6+(Wil) light damage, AGI negates (only for tevennec Lite)
                    log.addEntry(caster.name + ' casts ' + this.name);

                    const savingThrow = new SavingThrow(targets[0].getAgiSavingThrow(),
                        caster.getDifficultyClass(),
                        targets[0].role === Role.Fighter && targets[0].level >= 6,
                        targets[0].name,
                        log);

                    if (!savingThrow.isSuccessful()) {

                        const dmg = new DamageRoll([{ numberOfDices: 1, dice: 6 }], caster.getWil(), DamageType.Light, false,
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
                }
            }, {
                name: 'Deflagratio',
                spellLevel: 4,
                slotExpendend: 2,
                isMonsterSpell: false,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // All the targets take 2d8+(Wil*2) damage, TOU save halves
                    log.addEntry(caster.name + ' casts ' + this.name);
                    targets.forEach((target: GameEntity) => {

                        const savingThrow = new SavingThrow(targets[0].getTouSavingThrow(),
                            caster.getDifficultyClass(),
                            false,
                            target.name,
                            log);

                        const dmg = new DamageRoll([{ numberOfDices: 2, dice: 8 }], caster.getWil() * 2, DamageType.Light, false,
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
                    });
                }
            }, {
                name: 'Phalanx',
                spellLevel: 3,
                slotExpendend: 2,
                isMonsterSpell: false,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // All the targets take 1d8+(Will) damage, Agi save halves
                    log.addEntry(caster.name + ' casts ' + this.name);
                    targets.forEach((target: GameEntity) => {

                        const savingThrow = new SavingThrow(targets[0].getAgiSavingThrow(),
                            caster.getDifficultyClass(),
                            false,
                            target.name,
                            log);

                        const dmg = new DamageRoll([{ numberOfDices: 1, dice: 8 }], caster.getWil(), DamageType.Light, false,
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
                    });
                }
            }, {
                name: 'Cause Wounds',
                spellLevel: 1,
                slotExpendend: 1,
                isMonsterSpell: true,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // The target takes 1d4+(Wil) damage, TOU save halves

                    log.addEntry(caster.name + ' casts ' + this.name);

                    const savingThrow = new SavingThrow(targets[0].getTouSavingThrow(),
                        caster.getDifficultyClass(),
                        targets[0].role === Role.Fighter && targets[0].level >= 6,
                        targets[0].name,
                        log);

                    const dmg = new DamageRoll([{ numberOfDices: 1, dice: 4 }],
                        caster.getWil(),
                        DamageType.Darkness,
                        false,
                        savingThrow.isSuccessful());

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
                slotExpendend: 2,
                isMonsterSpell: true,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // The target takes 3d4 + (Wil) damage, TOU save halves

                    log.addEntry(caster.name + ' casts ' + this.name);

                    const savingThrow = new SavingThrow(targets[0].getTouSavingThrow(),
                        caster.getDifficultyClass(),
                        targets[0].role === Role.Fighter && targets[0].level >= 6,
                        targets[0].name,
                        log);

                    const dmg = new DamageRoll([{ numberOfDices: 3, dice: 4 }],
                        caster.getWil(),
                        DamageType.Darkness,
                        false,
                        savingThrow.isSuccessful());

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
                slotExpendend: 4,
                isMonsterSpell: true,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // The target takes 6d4 + (Wil) damage, TOU save halves

                    log.addEntry(caster.name + ' casts ' + this.name);

                    const savingThrow = new SavingThrow(targets[0].getTouSavingThrow(),
                        caster.getDifficultyClass(),
                        targets[0].role === Role.Fighter && targets[0].level >= 6,
                        targets[0].name,
                        log);

                    const dmg = new DamageRoll([{ numberOfDices: 6, dice: 4 }],
                        caster.getWil(),
                        DamageType.Darkness,
                        false,
                        savingThrow.isSuccessful());

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
                slotExpendend: 1,
                isMonsterSpell: true,
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
                slotExpendend: 1,
                isMonsterSpell: true,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // The target becomes Bleeding, WIL save negates

                    log.addEntry(caster.name + ' casts ' + this.name);

                    const savingThrow = new SavingThrow(targets[0].getTouSavingThrow(),
                        caster.getDifficultyClass(),
                        targets[0].role === Role.Fighter && targets[0].level >= 6,
                        targets[0].name,
                        log);

                    if (!savingThrow.isSuccessful()) {

                        if (!targets[0].takeCondition(Condition.Bleeding, Math.max(1, 2 + caster.getWil()))) {
                            log.addEntry(targets[0].name + ' cannot be Bleeded');
                        }
                    }
                }
            }, {
                name: 'Confusion',
                spellLevel: 2,
                slotExpendend: 2,
                isMonsterSpell: true,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // The target becomes Confused, WIL save negates

                    log.addEntry(caster.name + ' casts ' + this.name);

                    const savingThrow = new SavingThrow(targets[0].getWilSavingThrow(),
                        caster.getDifficultyClass(),
                        targets[0].role === Role.Fighter && targets[0].level >= 6,
                        targets[0].name,
                        log);

                    if (!savingThrow.isSuccessful()) {

                        if (!targets[0].takeCondition(Condition.Confused, Math.max(1, 2 + caster.getWil()))) {
                            log.addEntry(targets[0].name + ' cannot be Confused');
                        }
                    }
                }
            }, {
                name: 'Fear',
                spellLevel: 1,
                slotExpendend: 1,
                isMonsterSpell: true,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // The target becomes Frightened, WIL save negates

                    log.addEntry(caster.name + ' casts ' + this.name);

                    const savingThrow = new SavingThrow(targets[0].getWilSavingThrow(),
                        caster.getDifficultyClass(),
                        targets[0].role === Role.Fighter && targets[0].level >= 6,
                        targets[0].name,
                        log);

                    if (!savingThrow.isSuccessful()) {

                        if (!targets[0].takeCondition(Condition.Frightened, Math.max(1, 2 + caster.getWil()))) {
                            log.addEntry(targets[0].name + ' cannot be Frightened');
                        }
                    }
                }
            }, {
                name: 'Maiming',
                spellLevel: 2,
                slotExpendend: 2,
                isMonsterSpell: true,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // The target becomes Maimed, TOU save negates

                    log.addEntry(caster.name + ' casts ' + this.name);

                    const savingThrow = new SavingThrow(targets[0].getTouSavingThrow(),
                        caster.getDifficultyClass(),
                        targets[0].role === Role.Fighter && targets[0].level >= 6,
                        targets[0].name,
                        log);

                    if (!savingThrow.isSuccessful()) {

                        if (!targets[0].takeCondition(Condition.Maimed, -1)) {
                            log.addEntry(targets[0].name + ' cannot be Maimed');
                        }
                    }
                }
            }, {
                name: 'Cause Illness',
                spellLevel: 2,
                slotExpendend: 2,
                isMonsterSpell: true,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // The target becomes Ill, Tou save negates

                    log.addEntry(caster.name + ' casts ' + this.name);

                    const savingThrow = new SavingThrow(targets[0].getTouSavingThrow(),
                        caster.getDifficultyClass(),
                        targets[0].role === Role.Fighter && targets[0].level >= 6,
                        targets[0].name,
                        log);

                    if (!savingThrow.isSuccessful()) {

                        if (!targets[0].takeCondition(Condition.Ill, 15 - caster.getWil())) {
                            log.addEntry(targets[0].name + ' cannot be Ill');
                        }
                    }
                }
            }, {
                name: 'Lesser Mind Wave',
                spellLevel: 1,
                slotExpendend: 1,
                isMonsterSpell: true,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // The target becomes Stunned, WIL save negates

                    log.addEntry(caster.name + ' casts ' + this.name);

                    const savingThrow = new SavingThrow(targets[0].getWilSavingThrow(),
                        caster.getDifficultyClass(),
                        targets[0].role === Role.Fighter && targets[0].level >= 6,
                        targets[0].name,
                        log);

                    if (!savingThrow.isSuccessful()) {

                        if (!targets[0].takeCondition(Condition.Stunned, 1)) {
                            log.addEntry(targets[0].name + ' cannot be Stunned');
                        }
                    }
                }
            }, {
                name: 'Greater Mind Wave',
                spellLevel: 2,
                slotExpendend: 2,
                isMonsterSpell: true,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // The target becomes Paralized, WIL save negates

                    log.addEntry(caster.name + ' casts ' + this.name);

                    const savingThrow = new SavingThrow(targets[0].getWilSavingThrow(),
                        caster.getDifficultyClass(),
                        targets[0].role === Role.Fighter && targets[0].level >= 6,
                        targets[0].name,
                        log);

                    if (!savingThrow.isSuccessful()) {

                        if (!targets[0].takeCondition(Condition.Paralyzed, 2)) {
                            log.addEntry(targets[0].name + ' cannot be Paralyzed');
                        }
                    }
                }
            }, {
                name: 'Suppress Aura',
                spellLevel: 2,
                slotExpendend: 2,
                isMonsterSpell: true,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // The target lose all Aura Effects, Wil negates

                    log.addEntry(caster.name + ' casts ' + this.name);

                    const savingThrow = new SavingThrow(targets[0].getWilSavingThrow(),
                        caster.getDifficultyClass(),
                        targets[0].role === Role.Fighter && targets[0].level >= 6,
                        targets[0].name,
                        log);

                    if (!savingThrow.isSuccessful()) {

                        targets[0].activeAuras.clear();
                        targets[0].recalculateOccupiedSlots();
                    }
                }
            }, {
                name: 'Negate Magic',
                spellLevel: 3,
                slotExpendend: 4,
                isMonsterSpell: true,
                cast: function (targets: GameEntity[], caster: GameEntity) {

                    // The target lose all Aura Effects and Energy Slots, Wil negates

                    log.addEntry(caster.name + ' casts ' + this.name);

                    const savingThrow = new SavingThrow(targets[0].getWilSavingThrow(),
                        caster.getDifficultyClass(),
                        targets[0].role === Role.Fighter && targets[0].level >= 6,
                        targets[0].name,
                        log);

                    if (!savingThrow.isSuccessful()) {

                        targets[0].activeAuras.clear();
                        targets[0].recalculateOccupiedSlots();
                        targets[0].spendEnergySlots(targets[0].availableSlots);
                    }
                }
            }];
    }

    getSpells(): Castable[] {
        return this.spells;
    }

    getCharacterSpells(maxLevel = 5): Castable[] {
        return this.spells.filter((sp: Castable) => !sp.isMonsterSpell && sp.spellLevel <= maxLevel);
    }
    getMonsterSpells(maxLevel = 3): Castable[] {
        return this.spells.filter((sp: Castable) => sp.isMonsterSpell && sp.spellLevel <= maxLevel);
    }
    getSpellByName(name: string): Castable {
        return this.spells.find((sp: Castable) => sp.name === name);
    }
}



