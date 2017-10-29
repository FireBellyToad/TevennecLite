import { GameEntity } from 'app/game.entities/gameentity';
import { DiceRoll } from 'app/game.dicerollers/diceroll';
import { AdvantageDiceRoll } from 'app/game.dicerollers/advantagediceroll';
import { StandardDiceRoll } from 'app/game.dicerollers/standarddiceroll';
import { DamageRoll } from 'app/game.utils/damageroll';
import { Armor } from 'app/game.items/armor';
import { Weapon } from 'app/game.items/weapon';
import { Role } from 'app/game.enums/roles';
import { Talent } from 'app/game.enums/talents';
import { WeaponType } from 'app/game.enums/weapontypes';
import { ArmorType } from 'app/game.enums/armortypes';
import { DamageType } from 'app/game.utils/damagetypes';
import { Shield } from 'app/game.items/shield';
import { SpellService } from 'app/game.services/spellservice';
import { Castable } from 'app/game.spells/castable';
import { Condition } from 'app/game.enums/conditions';
import { AuraEffect } from 'app/game.enums/auraeffects';
import { Ring } from 'app/game.items/ring';
import { Mastery } from 'app/game.enums/mastery';
import { Power } from 'app/game.enums/powers';

export class Character extends GameEntity {

    armor: Armor = null;
    shield: Shield = null;
    leftRing: Ring = null;
    rightRing: Ring = null;
    armorCompetences: ArmorType[] = [];

    constructor(name: string, tou: number, agi: number, min: number, wil: number, level: number,
        role: Role, talent: Talent, weapon: Weapon = null, armor: Armor = null,
        shield: Shield = null, leftRing: Ring = null, rightRing: Ring = null, spells: Castable[] = []) {

        super(name, tou, agi, min, wil, level, role, talent, spells);

        // Bill is a NPC character
        if (this.name === 'Bill') {
            this.actualHP -= 4;
            this.maxHp -= 4;
        }

        this.leftRing = leftRing;
        this.rightRing = rightRing;

        this.weapon = weapon;
        this.armor = armor;
        this.shield = shield;


        // Fighter Role Feature or Templar Talent Feature
        if (this.role === Role.Fighter || this.talent === Talent.Templar) {
            this.maxHp += 3;
            this.actualHP += 3;
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


        // Fighter Role Feature
        if (this.role === Role.Fighter) {
            this.maxHp += Math.floor(this.level / 2);
            this.actualHP = this.maxHp;
        }

        this.updateResistance();
        this.availableSlots = this.getEnergySlots();

        // Luminous Talent Feature
        if (this.talent === Talent.Luminous) {
            this.occupiedSlots = 1;
            this.availableSlots = Math.max(0, this.availableSlots - 1);
        }

    }

    // Overriding Attributes Getters
    getTou(): number {
        let touBonus = 0;

        if (this.armor && this.armor.powers.has(Power.OfTheBear)) {
            touBonus += 1;
        }

        if (this.leftRing && this.leftRing.powers.has(Power.OfTheBear)) {
            touBonus += 1;
        } else if (this.rightRing && this.rightRing.powers.has(Power.OfTheBear)) {
            touBonus += 1;
        }

        return this.tou + touBonus - this.touPenalty
    }
    getAgi(): number {
        let agiBonus = 0;

        if (this.weapon && this.weapon.powers.has(Power.OfTheCat)) {
            agiBonus += 1;
        }

        if (this.leftRing && this.leftRing.powers.has(Power.OfTheCat)) {
            agiBonus += 1;
        } else if (this.rightRing && this.rightRing.powers.has(Power.OfTheCat)) {
            agiBonus += 1;
        }
        return this.agi + agiBonus - this.agiPenalty
    }
    getMin(): number {
        let minBonus = 0;

        if (this.armor && this.armor.powers.has(Power.OfTheFox)) {
            minBonus += 1;
        }

        if (this.leftRing && this.leftRing.powers.has(Power.OfTheFox)) {
            minBonus += 1;
        } else if (this.rightRing && this.rightRing.powers.has(Power.OfTheFox)) {
            minBonus += 1;
        }

        return this.min + minBonus - this.minPenalty
    }
    getWil(): number {
        let wilBonus = 0;

        if (this.weapon && this.weapon.powers.has(Power.OfTheEagle)) {
            wilBonus += 1;
        }

        if (this.leftRing && this.leftRing.powers.has(Power.OfTheEagle)) {
            wilBonus += 1;
        } else if (this.rightRing && this.rightRing.powers.has(Power.OfTheEagle)) {
            wilBonus += 1;
        }

        return this.wil + wilBonus - this.wilPenalty
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
            magicBonus += this.weapon.powers.get(Power.Precise);
        } else if (this.weapon.powers.has(Power.OfPrecision)) {
            magicBonus += this.weapon.powers.get(Power.OfPrecision);
        }

        // Magic Ring bonus
        if (this.leftRing && this.leftRing.powers.has(Power.OfPrecision)) {
            magicBonus += this.leftRing.powers.get(Power.OfPrecision);
        } else if (this.rightRing && this.rightRing.powers.has(Power.OfPrecision)) {
            magicBonus += this.rightRing.powers.get(Power.OfPrecision);
        }

        return competence + Math.floor(this.getAgi() / 2) + magicBonus - this.atkPenalty;
    }

    getAttackRoll(): DiceRoll {

        // Champion Figher Class Feature
        if (this.role === Role.Fighter && this.level >= 8) {
            this.lastAttackRoll = new AdvantageDiceRoll(1, 20, this.getATK());
        } else {
            this.lastAttackRoll = new StandardDiceRoll(1, 20, this.getATK());
        }

        return this.lastAttackRoll;
    }

    getDamageRoll(): DamageRoll {

        let totalModifier = Math.floor(this.getTou() / 2) - this.dmgPenalty;

        // Fighter Lethal Role feature
        if (this.role === Role.Fighter && this.level >= 2 &&
            this.weapon.types.every((value: WeaponType): boolean => this.weaponCompetences.includes(value))) {

            totalModifier += 3;
        }

        // Duelist Talent  feature
        if (this.talent === Talent.Duelist && this.weapon.types.includes(WeaponType.OneHanded)) {
            totalModifier += 2;
        }

        // Weapon Magical Damage Bonus
        if (this.weapon.powers.has(Power.Destructive)) {
            totalModifier += 2;
        }

        // Check if attack roll was a critical hit
        let isCritical = false;

        if (this.lastAttackRoll) {
            let criticalModifier = Math.floor(this.getMin() / 2);

            if (this.weapon.powers.has(Power.Efficient)) {
                criticalModifier += this.weapon.powers.get(Power.Efficient);
            } else if (this.weapon.powers.has(Power.OfEfficiency)) {
                criticalModifier += this.weapon.powers.get(Power.OfEfficiency);
            }

            if (this.talent === Talent.Mercenary) {
                criticalModifier += 1;
            }

            isCritical = this.lastAttackRoll.naturalResults[0] + criticalModifier >= 20;
        }

        let damageType = this.weapon.damageType;

        // If has Arma Aura Active change damage type
        if (this.activeAuras.has(AuraEffect.Arma)) {
            damageType = DamageType.Light;
        }

        const totalDices = [{ numberOfDices: 1, dice: this.weapon.weaponDice }]

        // Iracundia Damage Bonus
        if (this.activeAuras.has(AuraEffect.Iracundia)) {
            totalDices.push({ numberOfDices: 1, dice: 6 })
        }

        // Fighter with improved critical weapon
        if (this.weapon.masteries.includes(Mastery.ImprovedCritical) && isCritical &&
            this.role === Role.Fighter && this.level >= 4) {
            totalModifier += 3;
        }

        return new DamageRoll(totalDices, totalModifier, damageType, isCritical);
    }

    public getDEF(): number {

        // Check for Heavy armor cap
        const maxAGi = this.armor.isHeavy() ? Math.min(2, this.getAgi()) : this.getAgi();

        // Spells Modifier
        let spellsModifier = 0

        if (this.activeAuras.has(AuraEffect.Difesio)) {
            spellsModifier = 3;
        }

        return 8 + maxAGi + this.armor.getArmorDefBonus() + spellsModifier - this.defPenalty;
    }

    rollInitiative() {

        this.currentInitiative.rollDice();

        if (this.activeAuras.has(AuraEffect.Celeritas)) {
            this.currentInitiative.totalResult += 3;
            this.currentInitiative.modifier += 3;
        }

        if (this.conditions.has(Condition.Slowed)) {
            this.currentInitiative.totalResult -= 3;
            this.currentInitiative.modifier -= 3;
        }
    }

    protected getSavingThrow(attribute: number): DiceRoll {
        let totalModifier = attribute;

        // Corrupted Talent feature
        if (this.talent === Talent.Corrupted) {
            totalModifier += 3;
        } else if (this.talent === Talent.Merchant) {
            totalModifier -= 1;
        }

        // Armor Bonus
        if (this.armor.powers.has(Power.Blessed)) {
            totalModifier += 2;
        } else if (this.armor.powers.has(Power.OfBlessing)) {
            totalModifier += 2;
        }

        // Rings bonus
        if (this.leftRing && this.leftRing.powers.has(Power.OfBlessing)) {
            totalModifier += 2;
        } else if (this.rightRing && this.rightRing.powers.has(Power.OfBlessing)) {
            totalModifier += 2;
        }

        // Check for Consecratio Spell Effect
        if (this.activeAuras.has(AuraEffect.Consecratio)) {
            return new AdvantageDiceRoll(1, 20, totalModifier);
        } else {
            return new StandardDiceRoll(1, 20, totalModifier);
        }
    }

    hasDoubleAttack(): boolean {
        return !this.conditions.has(Condition.Maimed) && this.weapon.powers.has(Power.Quick);
    }

    attemptBlock(): boolean {

        let blockValue = 0;

        // Duelist Talent feature
        if (this.talent === Talent.Duelist) {
            blockValue = (this.getAgi() * 2) + 3;
            // Fighter Role Feature
            if (this.weapon.masteries.includes(Mastery.ImprovedBlock) &&
                this.role === Role.Fighter && this.level >= 10) {
                blockValue += 2;
            }
        } else if (this.activeAuras.has(AuraEffect.Scutum)) {
            blockValue = (this.getAgi() + this.getWil()) + 3;
        } else if (this.shield ||
            (this.weapon.masteries.includes(Mastery.Block) && this.role === Role.Fighter && this.level >= 4)) {
            blockValue = this.getAgi() + 3

            // Fighter Role Feature
            if (this.weapon.masteries.includes(Mastery.ImprovedBlock) &&
                this.role === Role.Fighter && this.level >= 10) {
                blockValue += 2;
            }
            // Item Bonus
            if (this.shield && this.shield.powers.has(Power.Blocking)) {
                blockValue += this.shield.powers.get(Power.Blocking);
            }
        }

        return blockValue !== 0 && new StandardDiceRoll(1, 20, blockValue).totalResult >= 20;
    }

    canBeBlocked(): boolean {
        return true;
    }

    getEnergySlots(): number {
        let bonusSlots = 0;

        // Spellcaster Prophet Role Feature or Paladin Talent Feature
        if (this.talent === Talent.Paladin || (this.role === Role.Spellcaster && this.level === 10)) {
            bonusSlots += 1
        }

        // Bonus from Items
        if (this.weapon && this.weapon.powers.has(Power.Infused)) {
            bonusSlots += 1
        }


        return Math.max(1, (Math.min(this.slotLimit, 1 + this.getMin() + bonusSlots)));
    }

    // Override
    regainEnergySlot() {
        let toRegain = 0;

        // Ospitaler Talent feature
        if (this.talent === Talent.Ospitaler) {
            toRegain = 1
        } else {
            toRegain = Math.max(1, Math.floor(this.getWil() / 2));
        }

        // Rings bonus
        if (this.leftRing && this.leftRing.powers.has(Power.OfMeditation)) {
            toRegain += 1;
        } else if (this.rightRing && this.rightRing.powers.has(Power.OfMeditation)) {
            toRegain += 1;
        }

        this.availableSlots = Math.min(this.getEnergySlots() - this.occupiedSlots, this.availableSlots + toRegain);
    }

    updateResistance() {
        this.resistances.splice(0);

        // Bonus from Aura
        if (this.activeAuras.has(AuraEffect.Fortitudo) || (this.armor && this.armor.powers.has(Power.OfTheDivinity))) {
            this.resistances.push(DamageType.Physical);
            this.resistances.push(DamageType.Supernatural);
            this.resistances.push(DamageType.Darkness);
        } else if (this.armor) {

            if (this.armor.powers.has(Power.OfTheRock)) {
                this.resistances.push(DamageType.Physical);
            } else if (this.armor.powers.has(Power.OfTheDiamond)) {
                this.resistances.push(DamageType.Supernatural);
            } else if (this.armor.powers.has(Power.OfTheSanctity)) {
                this.resistances.push(DamageType.Supernatural);
            }
        }

        // Corrupted Talent Feature
        if (this.talent === Talent.Corrupted && !this.resistances.includes(DamageType.Darkness)) {
            this.resistances.push(DamageType.Darkness);
        }



    }

    // Override
    takeCondition(condition: Condition, rounds = 0, overrideUndeadImmunity = false): boolean {
        // Check for items given immunities
        if (this.shield) {
            if (this.shield.powers.has(Power.OfCicatrization) && condition === Condition.Bleeding) {
                return false;
            } else if (this.shield.powers.has(Power.OfAntidote) && condition === Condition.Poisoned) {
                return false;
            } else if (this.shield.powers.has(Power.OfClarity) && condition === Condition.Confused) {
                return false;
            } else if (this.shield.powers.has(Power.OfCourage) && condition === Condition.Frightened) {
                return false;
            } else if (this.shield.powers.has(Power.OfFirmness) && condition === Condition.Stunned) {
                return false;
            } else if (this.shield.powers.has(Power.OfFreedom) && condition === Condition.Paralyzed) {
                return false;
            } else if (this.shield.powers.has(Power.OfIntegrity) && condition === Condition.Maimed) {
                return false;
            } else if (this.shield.powers.has(Power.OfHealth) && condition === Condition.Ill) {
                return false;
            }
        }

        return super.takeCondition(condition, rounds);
    }

    getDifficulty(): number {
        let diffModifier = 0;

        if (this.weapon.powers.has(Power.OfMagic)) {
            diffModifier += this.weapon.powers.get(Power.OfMagic);
        }

        if (this.talent === Talent.Cleric) {
            diffModifier += 1;
        }

        return this.getWil() + diffModifier + 8;
    }
}
