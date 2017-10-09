import { Injectable } from '@angular/core';
import { Logger } from 'app/game.services/logger';
import { GameEntity } from 'app/game.entities/gameentity';
import { LogEntry } from 'app/game.services/logentry';
import { DamageRoll } from 'app/game.utils/damageroll';
import { Castable } from 'app/game.spells/castable';
import { Monster } from 'app/game.entities/monster';
import { Character } from 'app/game.entities/character';
import { DiceRoll } from 'app/game.dicerollers/diceroll';
import { StandardDiceRoll } from 'app/game.dicerollers/standarddiceroll';
import { Talent } from 'app/game.enums/talents';
import { Condition } from 'app/game.enums/conditions';
import { Role } from 'app/game.enums/roles';
import { WeaponType } from 'app/game.enums/weapontypes';
import { SavingThrow } from 'app/game.utils/savingthrow';
import { DamageType } from 'app/game.utils/damagetypes';

@Injectable()
export class BattleService {

    private battleTimer;
    roundFinished = true;
    logger: Logger;

    // Second parameter is a countdown for the regain to happen
    private mustRegainSlots = new Map<GameEntity, number>();

    constructor(logger: Logger) {
        this.logger = logger;
    }


    // Starts round
    startRound(roundNumber, entitiesInBattle: GameEntity[],
        playerTurnAction: { action: string, spell: string, quickSpell: string, target: GameEntity }) {
        this.roundFinished = false;
        // Cleans log
        this.logger.addEntry('Round ' + roundNumber + ' Start', LogEntry.COLOR_GREEN);

        this.battleTimer = setInterval(() => { this.manageConditions(entitiesInBattle, playerTurnAction) }, 1500);

    }

    // Manage entity conditions
    manageConditions(entitiesInBattle: GameEntity[],
        playerTurnAction: { action: string, spell: string, quickSpell: string, target: GameEntity }) {


        for (const entity of entitiesInBattle) {
            // Clean all penalties
            entity.clearPenalties();

            for (const condition of Array.from(entity.conditions.keys())) {
                entity.takeCondition(condition);
            }
        }

        clearInterval(this.battleTimer);
        this.battleTimer = setInterval(() => { this.rollRoundInitiative(entitiesInBattle, playerTurnAction) }, 1500);
    }

    // Rolls initiative for all the entities and sorts the from higher to lower
    rollRoundInitiative(entitiesInBattle: GameEntity[],
        playerTurnAction: { action: string, spell: string, quickSpell: string, target: GameEntity }) {

        for (const entity of entitiesInBattle) {

            if (!entity.cannotAct()) {
                entity.rollInitiative();
                this.logger.addEntry(entity.name + ' rolled initiative: ' +
                    entity.getCurrentInitiative().toString(),
                    LogEntry.COLOR_BLUE);
            }
        }

        entitiesInBattle.sort((a: GameEntity, b: GameEntity) => {
            if (a.getCurrentInitiative().totalResult <= b.getCurrentInitiative().totalResult) {
                return 1;
            } else {
                return -1;
            }
        });

        clearInterval(this.battleTimer);
        this.battleTimer = setInterval(() => { this.doTurnsDefinition(entitiesInBattle, playerTurnAction) }, 1500);
    }

    // Defines turn
    // tslint:disable-next-line:max-line-length
    doTurnsDefinition(entitiesInBattle: GameEntity[], playerTurnAction: { action: string, spell: string, quickSpell: string, target: GameEntity }) {

        const turnActions = new Map<GameEntity, { action: string, spell: string, quickSpell: string, target: GameEntity }>();
        const monsterTargets = entitiesInBattle.filter(en => en instanceof Character);

        for (const entity of entitiesInBattle) {

            if (entity instanceof Monster) {
                turnActions.set(entity, this.getMonsterAction(entity, monsterTargets));
            } else {
                turnActions.set(entity, playerTurnAction);
                // turnActions.set(entity, this.getMonsterAction(entity, [playerTurnAction.target]));
            }

        }

        clearInterval(this.battleTimer);
        this.battleTimer = setInterval(() => { this.doResolveTurns(turnActions) }, 1500);
    }

    // Resolve Turns actions
    doResolveTurns(turnActions: Map<GameEntity, { action: string, spell: string, quickSpell: string, target: GameEntity }>) {

        const entitiesHit: { target: GameEntity, attacker: GameEntity, spells: Castable, damage: DamageRoll, processed: boolean }[] = [];

        // Attacking or Casting
        for (const entity of Array.from(turnActions.keys())) {

            // Cleans the hit json object array

            if (!entity.cannotAct()) {

                // If confused, on a 33% damages himself instead of acting
                if (entity.conditions.has(Condition.Confused) && (new StandardDiceRoll(1, 3).totalResult === 1)) {

                    const dmg = new DamageRoll(1, 4, 0, DamageType.Untyped);
                    entity.takeDamageFromRoll(dmg);

                    this.logger.addDamageEntry(entity.name, 'confusion', dmg.toString());

                } else {
                    const turn = turnActions.get(entity);

                    switch (turn.action) {
                        case 'atk': {
                            // Attack
                            if (turn.quickSpell !== '') {
                                this.spellRoutine(entity, turn, entitiesHit, true);
                            }

                            this.attackRoutine(entity, turn.target, entitiesHit);
                            break;
                        }
                        case 'cas': {
                            if (turn.quickSpell !== '') {
                                this.spellRoutine(entity, turn, entitiesHit, true);
                            }
                            this.spellRoutine(entity, turn, entitiesHit);
                            break;
                        }
                    }

                }


            } else {
                // Dead
                if (entity.conditions.has(Condition.Dead)) {
                    this.logger.addEntry(entity.name + ' is dead')
                }
            }

        }
        clearInterval(this.battleTimer);
        this.battleTimer = setInterval(() => { this.endRound(turnActions) }, 1500);
    }

    // Attack routine
    private attackRoutine(entity: GameEntity, target: GameEntity,
        entitiesHit: { target: GameEntity, attacker: GameEntity, damage: DamageRoll, processed: boolean }[],
        secondRoll = false) {

        // Gets entity attack roll
        const attackRoll = entity.getAttackRoll();
        let message = entity.name + ' Attacks: ' + attackRoll;

        // If entity hits, create a damage json object
        if (attackRoll.totalResult >= target.getDEF()) {

            entitiesHit.push({
                'target': target,
                'attacker': entity,
                'damage': entity.getDamageRoll(),
                'processed': false
            });
            message += ' *HIT*'
        } else {
            message += ' *MISS*'
        }

        // Logs the attack roll
        this.logger.addEntry(message, LogEntry.COLOR_RED);

        // Check for double attack, in case roll another
        if (!secondRoll && entity.hasDoubleAttack()) {

            this.attackRoutine(entity, target, entitiesHit, true);
        } else {
            // Roll the damage for each successful hit
            this.damageTarget(entitiesHit);
        }

    }

    // Execute damage logic
    private damageTarget(entitiesHit: { target: GameEntity, attacker: GameEntity, damage: DamageRoll, processed: boolean }[]) {

        let resImmVulMessage = '';
        let finalDamage = 0;
        const canBlock = true;
        // Damaging each target hit
        for (const hitEntry of entitiesHit.filter(en => en.processed !== true)) {

            hitEntry.processed = true;

            // Block logic
            if (canBlock &&
                hitEntry.attacker.canBeBlocked() &&
                hitEntry.target.attemptBlock()) {

                this.logger.addEntry(hitEntry.target.name + ' blocked ' + hitEntry.attacker.name, LogEntry.COLOR_RED);

            } else {

                finalDamage = hitEntry.target.takeDamageFromRoll(hitEntry.damage);

                if (hitEntry.target.hasImmunity(hitEntry.damage.damageType)) {
                    resImmVulMessage = '*IMMUNE*'
                }

                if (hitEntry.target.hasResistance(hitEntry.damage.damageType)) {
                    resImmVulMessage = '*RESISTANT*'
                }

                if (hitEntry.target.hasVulnerability(hitEntry.damage.damageType)) {
                    resImmVulMessage = '*VULNERABLE*'
                }

                this.logger.addDamageEntry(hitEntry.target.name,
                    hitEntry.attacker.name,
                    hitEntry.damage.toString(),
                    finalDamage.toString(),
                    resImmVulMessage);

                this.postAttackRoutine(hitEntry, finalDamage);
            }
        }
    }

    // Spells Routine
    private spellRoutine(entity: GameEntity, turn: { action: string, spell: string, quickSpell: string, target: GameEntity },
        entitiesHit: { target: GameEntity, attacker: GameEntity, damage: DamageRoll }[], isQuickSpellCasting = false) {

        const spellTocast = isQuickSpellCasting ? entity.spellsKnown.get(turn.quickSpell) : entity.spellsKnown.get(turn.spell);
        let canCast = entity.spendEnergySlots(spellTocast.slotExpendend);

        // For each time the caster has been hit, he tries to concentrate
        if (canCast) {
            for (const tar of entitiesHit.filter(en => en.target === entity)) {
                if (!tar.target.attemptConcentration(tar.damage.damageRoll.totalResult)) {
                    this.logger.addEntry(tar.target.name + ' fails to concentrate ');
                    canCast = false;
                    break;
                }
            }
        } else {
            this.logger.addEntry(entity.name + ' has not enough energy slots ')
        }

        if (canCast) {
            spellTocast.cast([turn.target], entity);
        }
    }

    postAttackRoutine(hitEntry: { target: GameEntity, attacker: GameEntity, damage: DamageRoll, processed: boolean }, finalDamage: number) {

        // Big Talent Feature
        if (hitEntry.attacker.talent === Talent.Big) {
            const savingThrow = new SavingThrow(hitEntry.target.getTouSavingThrow(),
                finalDamage,
                false,
                hitEntry.target.name,
                this.logger);

            if (!savingThrow.isSuccessful()) {

                hitEntry.target.takeCondition(Condition.Stunned, 1);
            }
        }

        // Lethal Talent Feature
        if (hitEntry.attacker.talent === Talent.Lethal) {

            const random = new StandardDiceRoll(1, hitEntry.attacker.spellsKnown.size);
            const spellsTocast = Array.from(hitEntry.attacker.spellsKnown.values());
            spellsTocast[random.totalResult - 1].cast([hitEntry.target], hitEntry.attacker);
        }

        // Fighter Role Feature
        if (hitEntry.attacker.role === Role.Fighter && hitEntry.attacker.level >= 6) {
            if (hitEntry.attacker.weapon.types.includes(WeaponType.Bludgeoning)) {
                const savingThrow = new SavingThrow(hitEntry.target.getTouSavingThrow(),
                    finalDamage,
                    false,
                    hitEntry.target.name,
                    this.logger);

                if (!savingThrow.isSuccessful()) {

                    hitEntry.target.takeCondition(Condition.Stunned, 1);
                }
            } else if (hitEntry.attacker.weapon.types.includes(WeaponType.Slashing) && hitEntry.damage.isCritical) {
                hitEntry.target.takeCondition(Condition.Maimed, -1);
            } else if (hitEntry.attacker.weapon.types.includes(WeaponType.Piercing) && hitEntry.damage.isCritical) {
                hitEntry.target.takeCondition(Condition.Bleeding, 2);
            }
        }
    }

    // End Round
    private endRound(turnActions: Map<GameEntity, { action: string, spell: string, target: GameEntity }>) {

        // The entities that have cast a spell in the previous round now regains slots
        for (const entity of Array.from(this.mustRegainSlots.keys())) {
            const value = this.mustRegainSlots.get(entity);
            if (value === 1) {
                this.mustRegainSlots.delete(entity)
                entity.regainEnergySlot();
                this.logger.addEntry(entity.name + ' regains some Energy slots');
            } else {
                this.mustRegainSlots.set(entity, value - 1);
            }
        }

        for (const entity of Array.from(turnActions.keys())) {

            // Clean all finished conditions
            for (const condition of Array.from(entity.conditions.keys())) {
                if (condition !== Condition.Dead && entity.conditions.get(condition) === 0) {
                    entity.conditions.delete(condition);
                }
            }

            // The entities that have spent or lost energy slots this round will regain slots in the next one
            const turn = turnActions.get(entity);
            if (!entity.conditions.has(Condition.Dead) && entity.availableSlots < (entity.energySlots - entity.occupiedSlots)) {
                // Ospitaler Talent feature
                if (entity.talent === Talent.Ospitaler) {
                    this.mustRegainSlots.set(entity, 2);
                } else {
                    this.mustRegainSlots.set(entity, 1);
                }
            }
        }
        clearInterval(this.battleTimer);
        this.roundFinished = true;
    }

    // AI for Monsters
    // tslint:disable-next-line:max-line-length
    private getMonsterAction(entity: GameEntity, targets: GameEntity[]): { action: string, spell: string, quickSpell: string, target: GameEntity } {


        // Dumb monsters, Lethal monsters or spell less just attack
        if (entity.getMin() < 2 || entity.talent === Talent.Lethal || entity.spellsKnown.size === 0) {
            return { action: 'atk', spell: '', quickSpell: '', target: targets[0] };
        } else {

            let quickSpellMemo = '';

            // If the monster is hurt badly and can cure himself, he will do
            if ((entity.canCast('Cure Wounds')) && (entity.actualHP / entity.maxHp) <= 0.3) {

                // If is Sorcerer or Boss, he will quickcast it
                if (entity.role === Role.Boss || entity.role === Role.Sorcerer) {
                    quickSpellMemo = 'Cure Wounds';
                } else {
                    return { action: 'cas', spell: 'Cure Wounds', quickSpell: '', target: entity }
                }

            }

            const spellList = Array.from(entity.spellsKnown.keys());
            // If the monster could cast a non-cure spell, he will do, or else he will attack
            for (const spellChosen of spellList) {
                if ((entity.availableSlots >= entity.spellsKnown.get(spellChosen).slotExpendend) &&
                    (spellChosen !== 'Cure Wounds' && spellChosen !== 'Medico')) {

                    // If is Sorcerer or Boss and is a 1st level spell, he will quickcast it
                    if ((entity.role === Role.Boss || entity.role === Role.Sorcerer) &&
                        entity.spellsKnown.get(spellChosen).spellLevel === 1) {

                        quickSpellMemo = spellChosen;

                    } else {
                        // Chose one spell randomly from the list, or the last one if no other has been chosen
                        if (spellList.lastIndexOf(spellChosen) === spellList.length - 1 ||
                            (new StandardDiceRoll(1, 3)).totalResult !== 1) {

                            return { action: 'cas', spell: spellChosen, quickSpell: quickSpellMemo, target: targets[0] }
                        }
                    }

                }
            }

            // Just attack
            return { action: 'atk', spell: '', quickSpell: quickSpellMemo, target: targets[0] };

        }
    }
}
