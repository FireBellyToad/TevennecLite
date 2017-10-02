import { GameEntity } from 'app/game.entities/gameentity';
import { DiceRoll } from 'app/game.dicerollers/diceroll';
import { AdvantageDiceRoll } from 'app/game.dicerollers/advantagediceroll';
import { StandardDiceRoll } from 'app/game.dicerollers/standarddiceroll';
import { DamageRoll } from 'app/game.utils/damageroll';
import { Armor } from 'app/game.items/armor';
import { Weapon } from 'app/game.items/weapon';
import { Power } from 'app/game.enums/power';
import { Role } from 'app/game.enums/roles';
import { Talent } from 'app/game.enums/talents';
import { WeaponType } from 'app/game.enums/weapontypes';
import { ArmorType } from 'app/game.enums/armortypes';
import { DamageType } from 'app/game.utils/damagetypes';
import { ItemFactory } from 'app/game.items/itemfactory';
import { Shield } from 'app/game.items/shield';
import { SpellService } from 'app/game.services/spellservice';
import { Castable } from 'app/game.spells/castable';

export class Character extends GameEntity {

    armor: Armor = null;
    shield: Shield = null;
    armorCompetences: ArmorType[] = [];

    constructor(name: string, tou: number, agi: number, min: number, wil: number, level: number,
        role: Role, talent: Talent, weapon: Weapon = null, armor: Armor = null,
        shield: Shield = null, spells: Castable[] = []) {

        super(name, tou, agi, min, wil, level, role, talent, spells);

        this.actualHP -= 4;
        this.maxHp -= 4;


        if (this.role === Role.Fighter) {

            this.weapon = weapon === null ? ItemFactory.LONG_SWORD : weapon;
            this.armor = armor === null ? ItemFactory.LEATHER_ARMOR : armor;

            if (!this.weapon.types.includes(WeaponType.TwoHanded)) {
                this.shield = shield === null ? ItemFactory.SHIELD : shield;
            }
        } else if (this.role === Role.Spellcaster) {

            this.weapon = weapon === null ? ItemFactory.MACE : weapon;
            this.armor = armor === null ? ItemFactory.UNARMORED : armor;
        }

        // Spellcaster Prophet Class Feature
        if (this.role === Role.Spellcaster && level === 10) {
            this.energySlots = Math.min(6, this.energySlots + 1);
            this.availableSlots = this.energySlots;
        }

        // Templar Talent Feature
        if (this.talent === Talent.Templar) {
            this.maxHp += 3;
            this.actualHP += 3;
        }

        // Templar Talent Feature
        if (this.talent === Talent.Corrupted) {
            this.resistances.push(DamageType.Darkness);
        }

        // Armor Competences
        this.armorCompetences.push(ArmorType.Light);

        if ((this.role === Role.Fighter && talent !== Talent.Duelist) ||
            (talent === Talent.Templar)) {

            this.armorCompetences.push(ArmorType.Heavy);
            this.armorCompetences.push(ArmorType.Shield);
        }

        // Weapon Competences
        this.weaponCompetences.push(WeaponType.Bludgeoning);
        this.weaponCompetences.push(WeaponType.OneHanded);

        if (this.role === Role.Fighter) {
            this.weaponCompetences.push(WeaponType.TwoHanded);
            this.weaponCompetences.push(WeaponType.Slashing);
            this.weaponCompetences.push(WeaponType.Piercing);
        }

    }

    getATK(): number {

        let competence = 0;
        let magicBonus = 0;

        // Competence Weapon bonus
        if (this.weapon.types.every(
            (value: WeaponType, index: number, type: WeaponType[]): boolean => this.weaponCompetences.includes(value))) {
            competence = 3;
        }

        // Magic Weapon bonus
        if (this.weapon.powers.has(Power.Precise)) {
            magicBonus = this.weapon.powers.get(Power.Precise);
        }

        return competence + Math.floor(this.agi / 2) + magicBonus;
    }

    getAttackRoll(): DiceRoll {

        // Champion Figher Class Feature
        if (this.role === Role.Fighter && this.level === 10) {
            this.lastAttackRoll = new AdvantageDiceRoll(1, 20, this.getATK());
        }

        this.lastAttackRoll = new StandardDiceRoll(1, 20, this.getATK());

        return this.lastAttackRoll;
    }

    getDamageRoll(): DamageRoll {

        let totalModifier = Math.floor(this.tou / 2);

        // Fighter Lethal class feature
        if (this.role === Role.Fighter && this.level >= 4 &&
            this.weapon.types.every(
                (value: WeaponType): boolean => this.weaponCompetences.includes(value))) {

            totalModifier += 3;
        }

        if (this.talent === Talent.Duelist && this.weapon.types.includes(WeaponType.OneHanded)) {
            totalModifier += 2;
        }

        // Weapon Magical Damage Bonus
        if (this.weapon.powers.has(Power.Destructive)) {

            const value = this.weapon.powers.get(Power.Destructive);

            switch (value) {
                case 1: {
                    totalModifier += 1;
                    break;
                }
                case 2: {
                    totalModifier += new StandardDiceRoll(1, 3, 0).totalResult;
                    break;
                }
                case 3: {
                    totalModifier += new StandardDiceRoll(1, 4, 1).totalResult;
                    break;
                }
            }

        }

        let isCritical = false;

        if (this.lastAttackRoll !== undefined) {
            isCritical = this.lastAttackRoll.naturalResults[0] + this.min >= 20;
        }

        return new DamageRoll(1, this.weapon.weaponDice, totalModifier, this.weapon.damageType, isCritical);
    }

    public getDEF(): number {

        // Check for Heavy armor cap
        const maxAGi = this.armor.isHeavy() ? Math.min(2, this.agi) : this.agi;

        // Spells Modifier
        const spellsModifier = 0

        return 8 + maxAGi + this.armor.getArmorDefBonus() + spellsModifier;
    }

    protected getSavingThrow(attribute: number): DiceRoll {
        let totalModifier = attribute;

        // Corrupter Talent feature
        if (this.talent === Talent.Corrupted) {
            totalModifier += 3;
        }

        // Check for Consecratio Spell Effect
        // if ( this.activeAuras.hasAura( Spells.Consecratio ) ) {
        //     return new AdvantageDiceRoll( 1, 20, totalModifier );
        // }else{
        return new StandardDiceRoll(1, 20, totalModifier);
        // }
    }

    protected addHpIncrements() {

        let roll: DiceRoll = null;

        for (let lev = 0; lev < this.level - 1; lev++) {

            if (this.role === Role.Fighter && this.level >= 2) {
                roll = new AdvantageDiceRoll(1, 4, 0);
            } else {
                roll = new StandardDiceRoll(1, 4, 0);
            }

            this.levelupHpIncrements.push(roll.totalResult);
        }

    }

    hasDoubleAttack(): boolean {
        return this.weapon.powers.has(Power.Quick);
    }

    attemptBlock(): boolean {
        let blockValue = this.agi + 5;

        // Duelist Talent feature
        if (this.talent === Talent.Duelist) {
            blockValue = (this.agi * 2) + 5;
        }

        return this.shield != null && new StandardDiceRoll(1, 20).totalResult <= (blockValue);
    }

    canBeBlocked(): boolean {
        return true;
    }
}
