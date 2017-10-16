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
import { Condition } from 'app/game.enums/conditions';
import { Power } from 'app/game.enums/powers';
import { AuraEffect } from 'app/game.enums/auraeffects';

export abstract class GameEntity {

    // Attributes
    protected tou: number;
    protected agi: number;
    protected min: number;
    protected wil: number;

    protected touPenalty = 0;
    protected agiPenalty = 0;
    protected minPenalty = 0;
    protected wilPenalty = 0;

    protected atkPenalty = 0;
    protected defPenalty = 0;
    protected dmgPenalty = 0;

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

    readonly conditions = new Map<Condition, number>();
    readonly activeAuras = new Map<AuraEffect, number>();

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

    // Attributes Getters
    getTou(): number {
        return this.tou - this.touPenalty
    }
    getAgi(): number {
        return this.agi - this.agiPenalty
    }
    getMin(): number {
        return this.min - this.minPenalty
    }
    getWil(): number {
        return this.wil - this.wilPenalty
    }

    // Penalties setters
    setTouPenalty(value: number) {
        this.touPenalty = value;
    }
    setAgiPenalty(value: number) {
        this.agiPenalty = value;
    }
    setMinPenalty(value: number) {
        this.minPenalty = value;
    }
    setWilPenalty(value: number) {
        this.wilPenalty = value;
    }
    setAtkPenalty(value: number) {
        this.atkPenalty = value;
    }
    setDefPenalty(value: number) {
        this.defPenalty = value;
    }
    setDmgPenalty(value: number) {
        this.dmgPenalty = value;
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
        return this.getSavingThrow(this.getTou());
    }
    getAgiSavingThrow(): DiceRoll {
        return this.getSavingThrow(this.getAgi());
    }
    getMinSavingThrow(): DiceRoll {
        return this.getSavingThrow(this.getMin());
    }
    getWilSavingThrow(): DiceRoll {
        return this.getSavingThrow(this.getWil());
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
        return this.conditions.has(Condition.Cursed) || this.vulnerabilities.includes(damageType);
    }

    hasResistance(damageType: DamageType): boolean {
        return (this.activeAuras.has(AuraEffect.Fortitudo) && damageType !== DamageType.Light) ||
            this.resistances.includes(damageType);
    }

    hasImmunity(damageType: DamageType): boolean {
        return this.immunities.includes(damageType);
    }

    // HP
    protected addHpIncrements() {

        for (let lev = 0; lev < this.level - 1; lev++) {
            this.levelupHpIncrements.push(new StandardDiceRoll(1, 4, 0).totalResult);
        }

    }
    protected calculateHP() {

        this.maxHp = 8 + this.tou * 2;

        for (const increment of this.levelupHpIncrements) {

            this.maxHp += increment;
        }
        this.actualHP = this.maxHp;
    }

    gainHP(value: number) {
        this.actualHP = Math.min(this.maxHp, this.actualHP + value);
    }

    takeDamage(value: number, damageType: DamageType): number {

        let totalDamage = value;

        if (this.hasImmunity(damageType)) {
            return 0;
        } else if (this.hasResistance(damageType)) {
            totalDamage = Math.max(0, totalDamage - 3);
        } else if (this.hasVulnerability(damageType)) {
            totalDamage += 3;
        }

        this.actualHP = Math.max(0, this.actualHP - totalDamage);

        if (this.actualHP === 0) {
            this.conditions.set(Condition.Dead, 0);
        }

        return totalDamage;
    }

    takeDamageFromRoll(roll: DamageRoll): number {

        return this.takeDamage(roll.totalDamage, roll.damageType);
    }


    cannotAct(): boolean {
        return this.conditions.has(Condition.Dead) ||
            this.conditions.has(Condition.Stunned) ||
            this.conditions.has(Condition.Paralyzed);
    }

    // Block
    abstract attemptBlock(): boolean;
    abstract canBeBlocked(): boolean;

    // Concentration
    attemptConcentration(difficulty: number): boolean {

        return new StandardDiceRoll(1, 20, this.getTou()).totalResult >= difficulty;

    }

    // Energy Slots, return false if can't cast
    canCast(spellName: string): boolean {
        return (this.spellsKnown.has(spellName) && this.availableSlots >= this.spellsKnown.get(spellName).slotExpendend)
    }

    spendEnergySlots(toSpend: number): boolean {


        if (this.energySlots < toSpend || this.availableSlots < toSpend) {
            return false;
        }

        this.availableSlots = Math.max(0, this.availableSlots - toSpend);

        return true;
    }

    // Reserve slots for Aura spells. Returns false if can't cast
    canReserveEnergySlots(toReserve: number): boolean {

        if (this.energySlots < toReserve || this.availableSlots < toReserve) {
            return false;
        }

        return true;
    }

    recalculateOccupiedSlots(alterAvailableSlots = false) {
        this.availableSlots = alterAvailableSlots ? this.availableSlots + this.occupiedSlots : this.availableSlots;
        this.occupiedSlots = this.talent === Talent.Luminous ? 1 : 0;
        this.activeAuras.forEach((value: number) => this.occupiedSlots += value);
        this.availableSlots = alterAvailableSlots ? Math.max(0, this.availableSlots - this.occupiedSlots) : this.availableSlots;
    }

    releaseEnergySlots(toRelease: number) {

        this.occupiedSlots = Math.max(0, this.occupiedSlots - toRelease);
    }

    // Regain Will/2 slots per round
    regainEnergySlot() {
        const toRegain = Math.max(1, Math.floor(this.getWil() / 2));
        this.availableSlots = Math.min(this.energySlots - this.occupiedSlots, this.availableSlots + toRegain);
    }

    // Take Condition
    takeCondition(condition: Condition, rounds = 0): boolean {

        // Add new condition or decrease current one
        if (this.conditions.has(condition) && rounds <= 0) {
            this.conditions.set(condition, this.conditions.get(condition) - 1);
        } else {
            this.conditions.set(condition, rounds);
        }

        switch (condition) {
            case Condition.Bleeding: {
                this.takeDamageFromRoll(new DamageRoll([{ numberOfDices: 1, dice: 6 }], 0, DamageType.Untyped))
                break;
            }
            case Condition.Frightened: {
                this.setAtkPenalty(3);
                break;
            }
            case Condition.Maimed: {
                if (!this.hasDoubleAttack() && this.talent !== Talent.Quick && !this.weapon.powers.has(Power.Quick)) {
                    this.setDmgPenalty(3);
                }
                break;
            }
            case Condition.Paralyzed: {
                this.setAgiPenalty(5 + this.agi);
                break;
            }
            case Condition.Weakened: {
                this.setAtkPenalty(3);
                this.setDefPenalty(3);
                break;
            }

        }

        return true;
    }

    clearPenalties() {
        this.setTouPenalty(0);
        this.setAgiPenalty(0);
        this.setMinPenalty(0);
        this.setWilPenalty(0);
        this.setAtkPenalty(0);
        this.setDefPenalty(0);
        this.setDmgPenalty(0);
    }

}
