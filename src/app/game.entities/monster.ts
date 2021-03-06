import { GameEntity } from 'app/game.entities/gameentity';
import { DiceRoll } from 'app/game.dicerollers/diceroll';
import { AdvantageDiceRoll } from 'app/game.dicerollers/advantagediceroll';
import { DamageRoll } from 'app/game.utils/damageroll';
import { StandardDiceRoll } from 'app/game.dicerollers/standarddiceroll';
import { Weapon } from 'app/game.items/weapon';
import { MonsterType } from 'app/game.enums/monstertype';
import { Role } from 'app/game.enums/roles';
import { Talent } from 'app/game.enums/talents';
import { DamageType } from 'app/game.utils/damagetypes';
import { WeaponType } from 'app/game.enums/weapontypes';
import { SpellService } from 'app/game.services/spellservice';
import { Castable } from 'app/game.spells/castable';
import { Condition } from 'app/game.enums/conditions';

export class Monster extends GameEntity {

    monsterType: MonsterType;

    constructor(name: string, tou: number, agi: number, min: number, wil: number,
        level: number, role: Role, talent: Talent, monsterType: MonsterType,
        weapon = new Weapon('Claw', 1, 2, [WeaponType.OneHanded, WeaponType.Slashing]),
        spells: Castable[] = []) {

        super(name, tou, agi, min, wil, level, role, talent, spells);

        this.currentInitiative = new StandardDiceRoll(1, 20, this.agi);

        // Boss Role Feature
        if (this.role === Role.Boss) {
            this.maxHp += 3 * this.level;
            this.actualHP += 3 * this.level;
        }

        this.weapon = weapon;
        this.monsterType = monsterType;

        // Minor Foul and Major Foul type feature
        if (this.monsterType === MonsterType.MajorFoul || this.monsterType === MonsterType.LesserFoul) {
            this.weapon.damageType = DamageType.Supernatural;
        }

        // Minor Foul and Major Undead type feature
        if (this.monsterType === MonsterType.LesserFoul || this.monsterType === MonsterType.MajorUndead) {
            this.resistances.push(DamageType.Physical);
        }

        // Major Foul type feature
        if (this.monsterType === MonsterType.MajorFoul) {
            this.resistances.push(DamageType.Supernatural);
            this.immunities.push(DamageType.Physical);
        }

        // All Monster Type except Natives Type Feature
        if (this.monsterType !== MonsterType.Native) {
            this.immunities.push(DamageType.Darkness);
        }

        // Minor Undead and Major Undead type feature
        if (this.monsterType === MonsterType.LesserUndead || this.monsterType === MonsterType.MajorUndead) {
            this.vulnerabilities.push(DamageType.Light);
        }
        this.availableSlots = this.getEnergySlots();
    }

    getATK(): number {
        let levelModifier = 0

        // Brute and Boss Role Feature
        if (this.role === Role.Brute || this.role === Role.Boss) {
            levelModifier = Math.floor(this.level / 4);
        }

        return 3 + levelModifier + Math.floor(this.agi / 2) - this.atkPenalty;
    }

    getAttackRoll(): DiceRoll {

        // Boss Role Feature
        if (this.role === Role.Boss) {
            this.lastAttackRoll = new AdvantageDiceRoll(1, 20, this.getATK());
        }

        this.lastAttackRoll = new StandardDiceRoll(1, 20, this.getATK());

        return this.lastAttackRoll;
    }

    getDamageRoll(): DamageRoll {
        let type = DamageType.Physical;

        // Foul Monsters Type Feature
        if (this.monsterType === MonsterType.MajorFoul || this.monsterType === MonsterType.LesserFoul) {
            type = DamageType.Supernatural;
        }

        let isCritical = false;

        if (this.lastAttackRoll) {
            isCritical = this.lastAttackRoll.naturalResults[0] + Math.floor(this.getMin() / 2) >= 20;
        }

        return new DamageRoll([{ numberOfDices: 1, dice: this.weapon.weaponDice }],
            Math.floor(this.tou / 2) - this.dmgPenalty,
            type,
            isCritical);
    }

    getDEF(): number {
        let levelModifier = 0

        // Brute and Boss Role Feature
        if (this.role === Role.Brute || this.role === Role.Boss) {
            levelModifier = Math.floor(this.level / 4);
        }

        return 8 + this.agi + levelModifier - this.defPenalty;
    }


    rollInitiative() {

        this.currentInitiative.rollDice();

        if (this.conditions.has(Condition.Slowed)) {
            this.currentInitiative.totalResult -= 3;
            this.currentInitiative.modifier -= 3;
        }
    }


    protected getSavingThrow(attribute: number) {
        let levelModifier = 0;

        // Brute and Boss Role Feature
        if (this.role === Role.Brute || this.role === Role.Boss) {
            levelModifier += Math.floor(this.level / 4);
        }

        return new StandardDiceRoll(1, 20, attribute + levelModifier);
    }


    hasDoubleAttack(): boolean {
        return !this.conditions.has(Condition.Maimed) && this.talent === Talent.Quick;
    }

    attemptBlock(): boolean {
        return this.talent === Talent.Trained && new StandardDiceRoll(1, 20, this.agi + 3).totalResult >= 20;
    }

    canBeBlocked(): boolean {
        return this.talent !== Talent.Big;
    }

    // Override
    takeCondition(condition: Condition, rounds = 0, overrideUndeadImmunity = false): boolean {
        // Undeads are Immune to conditions, but sometimes this condition could be overridden
        if (overrideUndeadImmunity ||
            condition === Condition.Far ||
            (this.monsterType !== MonsterType.LesserUndead && this.monsterType !== MonsterType.MajorUndead)) {
            return super.takeCondition(condition, rounds);
        }

        return false;
    }

    getEnergySlots(): number {
        let bonusSlots = 0;

        // Boss and Sorcerer Role Feature
        if (this.role === Role.Boss || this.role === Role.Sorcerer) {
            bonusSlots += 1;
        }

        return Math.max(1, (Math.min(this.slotLimit, 1 + this.getMin() + bonusSlots)));
    }

    regainEnergySlot() {
        const toRegain = Math.max(1, Math.floor(this.getWil() / 2));
        this.availableSlots = Math.min(this.getEnergySlots() - this.occupiedSlots, this.availableSlots + toRegain);
    }

    getDifficulty(): number {
        return this.getWil() + 8;
    }
}
