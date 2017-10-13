import { Item } from 'app/game.items/item';
import { ArmorType } from 'app/game.enums/armortypes';
import { Power } from 'app/game.enums/powers';

export class Armor extends Item {

    defBaseBonus: number;
    armorType: ArmorType;
    powers: Map<Power, number>;

    constructor( name: string, baseDef: number, armorType: ArmorType, powers = new Map<Power, number>() ) {
        super();
        this.name = name;
        this.defBaseBonus = baseDef;
        this.armorType = armorType;
        this.powers = powers;
    }

    getArmorDefBonus() {

        let totalBonus = this.defBaseBonus;

        // Magical Armor bonus
        if ( this.powers.has( Power.Defensive ) ) {
            totalBonus += this.powers.get( Power.Defensive );
        }

        return totalBonus;
    }

    getPrice(): number {
        return this.basePrice + ( this.value * 50)
    }

    isHeavy() {
        return this.armorType === ArmorType.Heavy
    }
}
