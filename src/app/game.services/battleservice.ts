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
    startRound(roundNumber, entitiesInBattle: GameEntity[], playerTurnAction: { action: string, spell: string, target: GameEntity }) {
        this.roundFinished = false;
        // Cleans log
        this.logger.addEntry('Round ' + roundNumber + ' Start', LogEntry.COLOR_GREEN);

        this.battleTimer = setInterval(() => { this.rollRoundInitiative(entitiesInBattle, playerTurnAction) }, 1500);

    }

    // Rolls initiative for all the entities and sorts the from higher to lower
    rollRoundInitiative(entitiesInBattle: GameEntity[], playerTurnAction: { action: string, spell: string, target: GameEntity }) {

        for (const entity of entitiesInBattle) {

            if (!entity.isDead()) {
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
    doTurnsDefinition(entitiesInBattle: GameEntity[], playerTurnAction: { action: string, spell: string, target: GameEntity }) {

        const turnActions = new Map<GameEntity, { action: string, spell: string, target: GameEntity }>();
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
    doResolveTurns(turnActions: Map<GameEntity, { action: string, spell: string, target: GameEntity }>) {

        const entitiesHit: { target: GameEntity, attacker: GameEntity, spells: Castable, damage: DamageRoll, processed: boolean }[] = [];

        // Attacking or Casting
        for (const entity of Array.from(turnActions.keys())) {

            // Cleans the hit json object array

            if (!entity.isDead()) {

                const turn = turnActions.get(entity);

                switch (turn.action) {
                    case 'atk': {
                        // Attack
                        this.attackRoutine(entity, turn.target, entitiesHit);
                        break;
                    }
                    case 'cas': {
                        this.spellRoutine(entity, turn, entitiesHit);
                    }
                }

            } else {
                // Dead
                this.logger.addEntry(entity.name + ' is dead')
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
        for (const hitTuple of entitiesHit.filter(en => en.processed !== true)) {

            hitTuple.processed = true;

            // Block logic
            if (canBlock &&
                hitTuple.attacker.canBeBlocked() &&
                hitTuple.target.attemptBlock()) {

                this.logger.addEntry(hitTuple.target.name + ' blocked ' + hitTuple.attacker.name, LogEntry.COLOR_RED);

            } else {

                finalDamage = hitTuple.target.takeDamageFromRoll(hitTuple.damage);

                if (hitTuple.target.hasImmunity(hitTuple.damage.damageType)) {
                    resImmVulMessage = '*IMMUNE*'
                }

                if (hitTuple.target.hasResistance(hitTuple.damage.damageType)) {
                    resImmVulMessage = '*RESISTANT*'
                }

                if (hitTuple.target.hasVulnerability(hitTuple.damage.damageType)) {
                    resImmVulMessage = '*VULNERABLE*'
                }

                this.logger.addDamageEntry(hitTuple.target.name,
                    hitTuple.attacker.name,
                    hitTuple.damage.toString(),
                    finalDamage.toString(),
                    resImmVulMessage);
            }
        }
    }

    // Spells Routine
    private spellRoutine(entity: GameEntity, turn: { action: string, spell: string, target: GameEntity },
        entitiesHit: { target: GameEntity, attacker: GameEntity, damage: DamageRoll }[]) {

        const spellTocast = entity.spellsKnown.get(turn.spell);
        let canCast = entity.spendEnergySlots(spellTocast.slotExpendend);

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
            spellTocast.cast([turn.target], entity)
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

        // The entities that have spent or lost energy slots this round will regain slots in the next one
        for (const entity of Array.from(turnActions.keys())) {

            const turn = turnActions.get(entity);
            if (!entity.isDead() && entity.availableSlots < (entity.energySlots - entity.occupiedSlots)) {
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

    private getMonsterAction(entity: GameEntity, targets: GameEntity[]): { action: string, spell: string, target: GameEntity } {

        // Dumb monsters or spell less just attack
        if (entity.min < 2 || entity.spellsKnown.size === 0) {
            return { action: 'atk', spell: '', target: targets[0] };
        } else {

            // If the monster is hurt badly and can cure himself, he will do
            if ((entity.canCast('Cure Wounds') || entity.canCast('Medico')) && (entity.actualHP / entity.maxHp) <= 0.3) {
                if (entity.spellsKnown.has('Cure Wounds')) {
                    return { action: 'cas', spell: 'Cure Wounds', target: entity }
                } else {
                    return { action: 'cas', spell: 'Medico', target: entity }
                }
            }

            // If the monster could cast a non-cure spell, he will do, or else he will attack
            for (const spellChosen of Array.from(entity.spellsKnown.keys())) {
                if ((entity.availableSlots >= entity.spellsKnown.get(spellChosen).slotExpendend) &&
                    (spellChosen !== 'Cure Wounds' && spellChosen !== 'Medico')) {

                    return { action: 'cas', spell: spellChosen, target: targets[0] }
                }
            }

            // Just attack
            return { action: 'atk', spell: '', target: targets[0] };

        }
    }
}
