import { Castable } from 'app/game.spells/castable';
import { GameEntity } from 'app/game.entities/gameentity';
import { Logger } from 'app/game.services/logger';
import { AuraEffect } from 'app/game.enums/auraeffects';

export class AuraSpell implements Castable {

    name: string;
    slotExpendend: number;
    spellLevel: number;
    isMonsterSpell: boolean;
    auraEffect: AuraEffect;
    log: Logger;

    constructor(name: string, spellLevel: number, slotExpendend: number, isMonsterSpell: boolean,
        auraEffect: AuraEffect, log: Logger) {
        this.name = name;
        this.slotExpendend = slotExpendend;
        this.spellLevel = spellLevel;
        this.isMonsterSpell = isMonsterSpell;
        this.auraEffect = auraEffect;
        this.log = log;
    }

    cast(targets: GameEntity[], caster: GameEntity) {

        this.log.addEntry(caster.name + ' casts ' + this.name);

        caster.activeAuras.set(this.auraEffect, this.slotExpendend);
        caster.recalculateOccupiedSlots(true);
    }


}