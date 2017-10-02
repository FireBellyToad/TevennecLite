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

export class Monster extends GameEntity {

    monsterType: MonsterType;

    constructor( name: string,  tou: number, agi: number, min: number, wil: number,
                 level: number, role: Role, talent: Talent, monsterType: MonsterType,
                 weapon = new Weapon( 'Claw', 1, 2, [ WeaponType.OneHanded, WeaponType.Slashing ] ),
                 spells: Castable[] = [] ) {

        super( name, tou, agi, min, wil, level, role, talent, spells);

        // Boss and Sorcerer Role Feature
        if ( this.role === Role.Boss || this.role === Role.Sorcerer ) {
            this.energySlots = Math.min(6 , this.energySlots + 1);
            this.availableSlots = this.energySlots;
        }

        // Boss Role Feature
        if ( this.role === Role.Boss ) {
            this.maxHp += 3 * this.level;
            this.actualHP += 3 * this.level;
        }

        this.weapon = weapon;
        this.monsterType = monsterType;

        // Minor Foul and Major Foul type feature
        if ( this.monsterType === MonsterType.MajorFoul || this.monsterType === MonsterType.LesserFoul ) {
           this.weapon.damageType = DamageType.Supernatural;
        }

        // Minor Foul and Major Undead type feature
        if ( this.monsterType === MonsterType.LesserFoul || this.monsterType === MonsterType.MajorUndead ) {
            this.resistances.push( DamageType.Physical );
        }

        // Major Foul type feature
        if ( this.monsterType === MonsterType.MajorFoul ) {
            this.immunities.push( DamageType.Physical );
        }

        // Minor Undead and Major Undead type feature
        if ( this.monsterType === MonsterType.LesserUndead || this.monsterType === MonsterType.MajorUndead ) {
            this.vulnerabilities.push( DamageType.Light );
        }
    }

    getATK(): number {
        let levelModifier = 0

        // Brute and Boss Role Feature
        if ( this.role === Role.Brute || this.role === Role.Boss ) {
            levelModifier = Math.floor( this.level / 4 );
        }

        return 3 + levelModifier + Math.floor( this.agi / 2 );
    }

    getAttackRoll(): DiceRoll {

        // Boss Role Feature
        if ( this.role === Role.Boss ) {
            return new AdvantageDiceRoll( 1, 20, this.getATK() );
        }else {
            return new StandardDiceRoll( 1, 20, this.getATK() );
        }
    }

    getDamageRoll(): DamageRoll {
        let type = DamageType.Physical;

        // Foul Monsters Type Feature
        if ( this.monsterType === MonsterType.MajorFoul || this.monsterType === MonsterType.LesserFoul ) {
            type = DamageType.Supernatural;
        }


        let isCritical = false;
        
        if ( this.lastAttackRoll !== undefined ) {
            isCritical = this.lastAttackRoll.naturalResults[0] + this.min >= 20;
        }


        return new DamageRoll( 1, this.weapon.weaponDice, Math.floor( this.tou / 2), type, isCritical );
    }

    getDEF(): number {
        let levelModifier = 0

        // Brute and Boss Role Feature
        if ( this.role === Role.Brute || this.role === Role.Boss ) {
            levelModifier = Math.floor( this.level / 3 );
        }

       return 8 + this.agi + levelModifier;
    }

    protected getSavingThrow(attribute: number) {
       return new StandardDiceRoll( 1, 20, attribute );
    }

    protected addHpIncrements() {

        for ( let lev = 0; lev < this.level - 1 ; lev++  ) {
            this.levelupHpIncrements.push( new StandardDiceRoll( 1, 4, 0).totalResult );
        }

    }

    hasDoubleAttack(): boolean {
        return this.talent === Talent.Quick;
    }

    attemptBlock(): boolean {
        return false
    }

    canBeBlocked(): boolean {
        return this.talent !== Talent.Big;
    }
}
