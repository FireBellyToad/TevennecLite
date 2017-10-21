import { Item } from 'app/game.items/item';
import { WeaponType } from 'app/game.enums/weapontypes';
import { Power } from 'app/game.enums/powers';
import { DamageType } from 'app/game.utils/damagetypes';
import { Mastery } from 'app/game.enums/mastery';

export class Weapon extends Item {

    numberOfDices: number
    weaponDice: number;
    types: WeaponType[];
    damageType: DamageType;
    powers: Map<Power, number> = new Map<Power, number>();
    masteries: Mastery[];

    constructor(name: string, numberOfDices: number, weaponDice: number, type: WeaponType[] = [],
        masteries: Mastery[] = [], value = 0, powers = new Map<Power, number>(), ) {
        super();
        this.name = name;
        this.numberOfDices = numberOfDices;
        this.weaponDice = weaponDice;
        this.types = type;
        this.powers = powers;
        this.value = value;
        this.masteries = masteries;

        this.updateDamageType()
    }

    updateDamageType() {

        if (this.value > 0 || this.powers.size > 0) {
            if (this.powers.has(Power.Luminous)) {
                this.damageType = DamageType.Light;
            } else {
                this.damageType = DamageType.Supernatural;
            }
        } else {
            this.damageType = DamageType.Physical;
        }
    }

    getPrice(): number {
        return this.basePrice + this.value * 50
    }


}
