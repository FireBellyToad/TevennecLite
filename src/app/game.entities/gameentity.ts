import { DiceRoll } from 'app/game.dicerollers/diceroll';
import { StandardDiceRoll } from 'app/game.dicerollers/standarddiceroll';
import { Weapon } from 'app/game.items/weapon';
import { DamageRoll } from 'app/game.utils/damageroll';
import { Role } from 'app/game.enums/roles';
import { Talent } from 'app/game.enums/talents';
import { DamageType } from 'app/game.utils/damagetypes';
import { WeaponType } from 'app/game.enums/weapontypes';
import { Castable } from 'app/game.spells/castable';
import { SpellService } from 'app/game.services/spellservice';

export abstract class GameEntity {

    // Attributes
    tou: number;
    agi: number;
    min: number;
    wil: number;

    level: number;

    actualHP: number;
    maxHp: number;
    levelupHpIncrements: number[] = [];

    energySlots: number;
    availableSlots: number;
    occupiedSlots = 0;

    readonly name: string;

    readonly role: Role;
    readonly talent: Talent;

    weapon: Weapon;
    weaponCompetences: WeaponType[] = [];

    protected vulnerabilities: DamageType[] = [];
    protected resistances: DamageType[] = [];
    protected immunities: DamageType[] = [];

    protected currentInitiative: DiceRoll;
    protected lastAttackRoll: DiceRoll;

    readonly spellsKnown = new Map<string, Castable>();
    spells: Castable[];

    constructor(name: string, tou: number, agi: number, min: number, wil: number, level: number,
        role: Role, talent: Talent, spells: Castable[]) {

        this.tou = tou;
        this.agi = agi;
        this.min = min;
        this.wil = wil;

        this.level = level;
        this.name = name;

        this.energySlots = Math.max(0, Math.min(6, this.min));
        this.availableSlots = this.energySlots;

        this.role = role;
        this.talent = talent;
        this.currentInitiative = new StandardDiceRoll(1, 20, this.agi);

        for (const spell of spells) {
            this.spellsKnown.set(spell.name, spell);
        }

        this.addHpIncrements();
        this.calculateHP();
    }

    // Attack

    abstract getATK(): number;
    abstract getAttackRoll(): DiceRoll;
    abstract getDamageRoll(): DamageRoll;
    abstract hasDoubleAttack(): boolean;
    getDifficultyClass(): number {
        return this.wil + 8;
    }

    // Defense

    public abstract getDEF(): number;

    // Saving throws

    getTouSavingThrow(): DiceRoll {
        return this.getSavingThrow(this.tou);
    }
    getAgiSavingThrow(): DiceRoll {
        return this.getSavingThrow(this.agi);
    }
    getMinSavingThrow(): DiceRoll {
        return this.getSavingThrow(this.min);
    }
    getWilSavingThrow(): DiceRoll {
        return this.getSavingThrow(this.wil);
    }

    protected abstract getSavingThrow(attribute: number);

    // Initiative

    rollInitiative() {
        this.currentInitiative.rollDice();
    }

    getCurrentInitiative(): DiceRoll {
        return this.currentInitiative;
    }

    // Resistance, Immunities and Vulnerabilities

    hasVulnerability(damageType: DamageType): boolean {
        return this.vulnerabilities.includes(damageType);
    }

    hasResistance(damageType: DamageType): boolean {
        return this.resistances.includes(damageType);
    }

    hasImmunity(damageType: DamageType): boolean {
        return this.immunities.includes(damageType);
    }

    // HP
    protected abstract addHpIncrements();
    protected calculateHP() {

        this.maxHp = 8 + this.tou * 2;

        for (const increment of this.levelupHpIncrements) {

            this.maxHp += increment;
        }

        this.actualHP = this.maxHp;
    }

    takeDamageFromRoll(roll: DamageRoll): number {

        let totalDamage = roll.damageRoll.totalResult

        if (this.hasImmunity(roll.damageType)) {
            return 0;
        } else if (this.hasResistance(roll.damageType)) {
            totalDamage = Math.max(0, totalDamage - 5);
        } else if (this.hasVulnerability(roll.damageType)) {
            totalDamage += 5;
        }

        this.actualHP = Math.max(0, this.actualHP - totalDamage);

        return totalDamage;
    }

    takeDamageFromValue(damage: number, damageType: DamageType) {

        let totalDamage = damage

        if (this.hasImmunity(damageType)) {
            return 0;
        } else if (this.hasResistance(damageType)) {
            totalDamage = Math.max(0, totalDamage - 5);
        } else if (this.hasVulnerability(damageType)) {
            totalDamage += 5;
        }

        this.actualHP = Math.max(0, this.actualHP - totalDamage);

        return totalDamage;
    }

    isDead(): boolean {
        return this.actualHP <= 0;
    }

    // Block
    abstract attemptBlock(): boolean;
    abstract canBeBlocked(): boolean;

    // Concentration
    attemptConcentration(difficulty: number): boolean {

        return new StandardDiceRoll(1, 20, this.tou).totalResult >= difficulty;

    }

    // Energy Slots, return false if can't cast
    spendEnergySlots(toSpend: number): boolean {


        if (this.energySlots < toSpend || this.availableSlots < toSpend) {
            return false;
        }

        this.availableSlots = Math.max(0, this.availableSlots - toSpend);

        return true;
    }

    // Reserve slots for Aura spells. Returns false if can't cast
    reserveEnergySlots(toReserve: number): boolean {

        if (this.energySlots < toReserve || this.availableSlots < toReserve) {
            return false;
        }

        this.occupiedSlots = Math.max(0, this.availableSlots - toReserve);

        this.availableSlots -= this.energySlots - this.occupiedSlots;

        return true;
    }

    // Regain Will/2 slots per round
    regainEnergySlot() {
        const toRegain = Math.max(1, Math.floor(this.wil / 2));
        this.availableSlots = Math.min(this.energySlots - this.occupiedSlots, this.availableSlots + toRegain);
    }

}
