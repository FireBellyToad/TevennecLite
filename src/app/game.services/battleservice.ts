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
import { AuraSpell } from 'app/game.spells/auraspell';
import { BattleTurn } from 'app/game.utils/battleturn';
import { AuraEffect } from 'app/game.enums/auraeffects';
import { Mastery } from 'app/game.enums/mastery';
import { Power } from 'app/game.enums/powers';

@Injectable()
export class BattleService {

    private battleTimer;
    private readonly timeToWait = 1250;
    roundFinished = true;
    logger: Logger;

    // Second parameter is a countdown for the regain to happen
    private mustRegainSlots = new Map<GameEntity, number>();

    constructor(logger: Logger) {
        this.logger = logger;
    }


    // Starts round
    startRound(roundNumber, entitiesInBattle: GameEntity[], playerTurnAction: BattleTurn) {
        this.roundFinished = false;
        // Cleans log
        this.logger.addEntry('Round ' + roundNumber + ' Start', LogEntry.COLOR_GREEN);

        this.battleTimer = setInterval(() => { this.manageRoundStartEffect(entitiesInBattle, playerTurnAction) }, this.timeToWait);

    }

    // Manage entity conditions
    manageRoundStartEffect(entitiesInBattle: GameEntity[], playerTurnAction: BattleTurn) {


        entitiesInBattle.forEach((entity: GameEntity) => {
            // Clean all penalties
            entity.clearPenalties();

            // Conditions
            entity.conditions.forEach((value: number, condition: Condition) => {
                entity.takeCondition(condition);
            });

            // Auras
            entity.activeAuras.forEach((value: number, aura: AuraEffect) => {
                if (aura === AuraEffect.Impulsus) {
                    entitiesInBattle.forEach((target: GameEntity) => {
                        if (target instanceof Monster) {
                            target.takeDamage(entity.getWil(), DamageType.Light);
                            this.logger.addDamageEntry(target.name, 'Impulsus', entity.getWil().toString());
                        }
                    });
                }
            })
        });

        clearInterval(this.battleTimer);
        this.battleTimer = setInterval(() => { this.rollRoundInitiative(entitiesInBattle, playerTurnAction) }, this.timeToWait);
    }

    // Rolls initiative for all the entities and sorts the from higher to lower
    rollRoundInitiative(entitiesInBattle: GameEntity[], playerTurnAction: BattleTurn) {

        entitiesInBattle.forEach((entity: GameEntity) => {

            if (!entity.cannotAct()) {
                entity.rollInitiative();
                this.logger.addEntry(entity.name + ' rolled initiative: ' +
                    entity.getCurrentInitiative().toString(),
                    LogEntry.COLOR_BLUE);
            }
        });

        entitiesInBattle.sort((a: GameEntity, b: GameEntity) => {
            return (a.getCurrentInitiative().totalResult <= b.getCurrentInitiative().totalResult) ? 1 : -1;
        });

        clearInterval(this.battleTimer);
        this.battleTimer = setInterval(() => { this.doTurnsDefinition(entitiesInBattle, playerTurnAction) }, this.timeToWait);
    }

    // Defines turn
    doTurnsDefinition(entitiesInBattle: GameEntity[], playerTurnAction: BattleTurn) {

        const turnActions = new Map<GameEntity, BattleTurn>();
        const monsterTargets = entitiesInBattle.filter(en => en instanceof Character);

        entitiesInBattle.forEach((entity: GameEntity) => {

            if (entity instanceof Monster) {
                turnActions.set(entity, this.getMonsterAction(entity, monsterTargets));
            } else {
                turnActions.set(entity, playerTurnAction);
                // turnActions.set(entity, this.getMonsterAction(entity, [playerTurnAction.target]));
            }

        });

        clearInterval(this.battleTimer);
        this.battleTimer = setInterval(() => { this.doResolveTurns(turnActions) }, this.timeToWait);
    }

    // Resolve Turns actions
    doResolveTurns(turnActions: Map<GameEntity, BattleTurn>) {

        const entitiesHit: { target: GameEntity, attacker: GameEntity, spells: Castable, damage: DamageRoll, processed: boolean }[] = [];

        // Attacking or Casting
        turnActions.forEach((turn: BattleTurn, entity: GameEntity) => {

            // Cleans the hit json object array

            if (!entity.cannotAct()) {

                // If confused, on a 33% damages himself instead of acting
                if (entity.conditions.has(Condition.Confused) && (new StandardDiceRoll(1, 3).totalResult === 1)) {

                    const dmg = new DamageRoll([{ numberOfDices: 1, dice: 4 }], 0, DamageType.Untyped);
                    entity.takeDamageFromRoll(dmg);

                    this.logger.addDamageEntry(entity.name, 'confusion', dmg.toString());

                } else {

                    // Release the selected aura
                    if (turn.auraToRelease !== '') {
                        const aura = entity.activeAuras.forEach((slots: number, au: AuraEffect) => {
                            if (au.toString() === turn.auraToRelease) {

                                entity.releaseEnergySlots(slots);
                                entity.activeAuras.delete(au);
                            }
                        })
                    }

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

        });
        clearInterval(this.battleTimer);
        this.battleTimer = setInterval(() => { this.endRound(turnActions) }, this.timeToWait);
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
        let canBlock = true;
        let previousBlocker;
        // Take only not processed entries, and sort them by target name
        let entriesToCheck = entitiesHit.filter(en => en.processed !== true);
        entriesToCheck = entriesToCheck.sort((a, b) => {
            return (a.target.name <= b.target.name) ? 1 : -1;
        });

        // Damaging each target hit
        entriesToCheck.forEach((hitEntry) => {

            hitEntry.processed = true;
            canBlock = (previousBlocker !== hitEntry.target);

            // Block logic
            if (canBlock &&
                hitEntry.attacker.canBeBlocked() &&
                hitEntry.target.attemptBlock()) {

                this.logger.addEntry(hitEntry.target.name + ' blocked ' + hitEntry.attacker.name, LogEntry.COLOR_RED);

                // Thorny shield
                if (hitEntry.target instanceof Character) {
                    if (hitEntry.target.shield.powers.has(Power.Thorny)) {

                        const dmg = new DamageRoll([{ numberOfDices: 1, dice: 4 }], 0, DamageType.Supernatural);
                        hitEntry.attacker.takeDamageFromRoll(dmg);

                        this.logger.addDamageEntry(hitEntry.attacker.name, hitEntry.target.name, dmg.toString());
                    }
                }
                canBlock = false;
                previousBlocker = hitEntry.target;
            } else {

                // Fighter Role Feature
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

                this.postDamageRoutine(hitEntry, finalDamage);
            }
        });
    }

    // Spells Routine
    private spellRoutine(entity: GameEntity, turn: BattleTurn,
        entitiesHit: { target: GameEntity, attacker: GameEntity, damage: DamageRoll }[], isQuickSpellCasting = false) {

        const spellTocast = isQuickSpellCasting ? entity.spellsKnown.get(turn.quickSpell) : entity.spellsKnown.get(turn.spell);
        let canCast = false;

        // Check if can spend or reserve slots
        if (spellTocast instanceof AuraSpell) {
            canCast = entity.canReserveEnergySlots(spellTocast.slotExpendend);
        } else {
            canCast = entity.spendEnergySlots(spellTocast.slotExpendend);
        }

        // For each time the caster has been hit, he tries to concentrate
        if (canCast) {
            for (const tar of entitiesHit.filter(en => en.target === entity)) {
                if (!tar.target.attemptConcentration(tar.damage.totalDamage)) {
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

    // Post Damage routine
    postDamageRoutine(hitEntry: { target: GameEntity, attacker: GameEntity, damage: DamageRoll, processed: boolean }, finalDamage: number) {

        // Big Talent Feature
        if (hitEntry.attacker.talent === Talent.Big) {
            const savingThrow = new SavingThrow(hitEntry.target.getTouSavingThrow(),
                finalDamage,
                hitEntry.target.role === Role.Fighter && hitEntry.target.level >= 6,
                hitEntry.target.name,
                this.logger);

            if (!savingThrow.isSuccessful()) {

                hitEntry.target.takeCondition(Condition.Stunned, 1);
            }
        } else if (hitEntry.attacker.talent === Talent.Lethal) {
            // Lethal Talent Feature
            const random = new StandardDiceRoll(1, hitEntry.attacker.spellsKnown.size);
            const spellsTocast = Array.from(hitEntry.attacker.spellsKnown.values());
            spellsTocast[random.totalResult - 1].cast([hitEntry.target], hitEntry.attacker);
        }

        // Fighter Role Feature
        if ((hitEntry.attacker.role === Role.Fighter && hitEntry.attacker.level >= 4)) {
            hitEntry.attacker.weapon.masteries.forEach((mastery: Mastery, i: number, arr: Mastery[]) => {
                switch (mastery) {
                    case Mastery.Maim: {

                        if (hitEntry.damage.isCritical && !hitEntry.target.takeCondition(Condition.Maimed, -1)) {
                            this.logger.addEntry(hitEntry.target.name + ' cannot be Maimed');
                        }
                        break;
                    }
                    case Mastery.Stun: {

                        let bonus = 0;
                        if (arr.includes(Mastery.ImprovedStun) && hitEntry.attacker.level >= 10) {
                            bonus = 2;
                        }

                        const savingThrow = new SavingThrow(hitEntry.target.getTouSavingThrow(),
                            finalDamage + bonus,
                            hitEntry.target.role === Role.Fighter && hitEntry.target.level >= 6,
                            hitEntry.target.name,
                            this.logger);

                        if (!savingThrow.isSuccessful()) {

                            if (!hitEntry.target.takeCondition(Condition.Stunned, 1)) {
                                this.logger.addEntry(hitEntry.target.name + ' cannot be Stunned');
                            }
                        }
                        break;
                    }
                    case Mastery.Bleed: {
                        let time = 2;

                        if (arr.includes(Mastery.ImprovedBleed) && hitEntry.attacker.level >= 10) {
                            time = 4;
                        }

                        if (hitEntry.damage.isCritical && !hitEntry.target.takeCondition(Condition.Bleeding, time)) {
                            this.logger.addEntry(hitEntry.target.name + ' cannot be Bleeded');
                        }
                        break;
                    }
                }
            });
        }
    }

    // End Round
    private endRound(turnActions: Map<GameEntity, BattleTurn>) {

        // The entities that have cast a spell in the previous round now regains slots
        this.mustRegainSlots.forEach((value: number, entity: GameEntity) => {
            if (value === 1) {
                this.mustRegainSlots.delete(entity)
                entity.regainEnergySlot();
                this.logger.addEntry(entity.name + ' regains some Energy slots');
            } else {
                this.mustRegainSlots.set(entity, value - 1);
            }
        })

        turnActions.forEach((turn: BattleTurn, entity: GameEntity) => {

            // Clean all ended conditions.
            entity.conditions.forEach((rounds: number, condition: Condition) => {
                if (condition !== Condition.Dead && rounds === 0) {
                    // If has Illness, Dies
                    if (condition === Condition.Ill) {
                        entity.takeCondition(Condition.Dead);
                    }
                    entity.conditions.delete(condition);
                }
            });

            // The entities that have spent or lost energy slots this round will regain slots in the next one
            // Unless he has Iracundia on, or is Dead
            if (!entity.conditions.has(Condition.Dead) && !entity.activeAuras.has(AuraEffect.Iracundia) &&
                entity.availableSlots < (entity.getEnergySlots() - entity.occupiedSlots)) {
                this.mustRegainSlots.set(entity, 1);
            }
        });
        clearInterval(this.battleTimer);
        this.roundFinished = true;
    }

    // AI for Monsters
    private getMonsterAction(entity: GameEntity, targets: GameEntity[]): BattleTurn {


        // Dumb monsters, Lethal monsters or spell less just attack
        if (entity.getMin() < 1 || entity.talent === Talent.Lethal || entity.spellsKnown.size === 0) {
            return { action: 'atk', spell: '', quickSpell: '', auraToRelease: '', target: targets[0] };
        } else {

            let quickSpellMemo = '';

            // If the monster is hurt badly and can cure himself, he will do
            if ((entity.canCast('Cure Wounds')) && (entity.actualHP / entity.maxHp) <= 0.3) {

                // If is Sorcerer or Boss, he will quickcast it
                if (entity.role === Role.Boss || entity.role === Role.Sorcerer) {
                    quickSpellMemo = 'Cure Wounds';
                } else {
                    return { action: 'cas', spell: 'Cure Wounds', quickSpell: '', auraToRelease: '', target: entity }
                }

            }

            // If the monster could cast a non-cure spell, he will do, or else he will attack
            let toDo: BattleTurn;
            const chanceToCast = 1 + ((entity.role === Role.Sorcerer) ? 3 :
                (entity.role === Role.Boss) ? (new StandardDiceRoll(1, 3, -1)).totalResult : 1)
            entity.spellsKnown.forEach((spell: Castable) => {
                if ((entity.availableSlots >= spell.slotExpendend) &&
                    (quickSpellMemo !== 'Cure Wounds' && quickSpellMemo !== 'Medico') &&
                    (spell.name !== 'Cure Wounds' && spell.name !== 'Medico')) {

                    // If is Sorcerer or Boss and is a 1st level spell, he will quickcast it
                    if ((entity.role === Role.Boss || entity.role === Role.Sorcerer) && spell.spellLevel === 1) {

                        quickSpellMemo = spell.name;

                    } else {
                        // Chose one spell randomly from the list, or the last one if no other has been chosen
                        if ((new StandardDiceRoll(1, chanceToCast)).totalResult !== 1) {

                            toDo = {
                                action: 'cas',
                                spell: spell.name,
                                quickSpell: quickSpellMemo,
                                auraToRelease: '',
                                target: targets[0]
                            }
                            return;
                        }
                    }

                }

            });

            // Just attack
            if (toDo && toDo.action === 'cas') {
                return toDo
            } else {
                return { action: 'atk', spell: '', quickSpell: quickSpellMemo, auraToRelease: '', target: targets[0] };
            }

        }
    }
}
