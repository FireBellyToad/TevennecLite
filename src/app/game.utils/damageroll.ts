import { DiceRoll } from 'app/game.dicerollers/diceroll';
import { StandardDiceRoll } from 'app/game.dicerollers/standarddiceroll';
import { DamageType } from 'app/game.utils/damagetypes';
import { AdvantageDiceRoll } from 'app/game.dicerollers/advantagediceroll';

export class DamageRoll {

    modifier: number;
    damageRoll: DiceRoll;
    damageType: DamageType;
    isCritical: boolean;
    isHalved: boolean;

    constructor(numberOfDices: number, dice: number, modifier: number, damageType: DamageType,
        isCritical = false, isHalved = false, hasAdvantage = false) {

        if (hasAdvantage) {

            this.damageRoll = new AdvantageDiceRoll(numberOfDices, dice, modifier, isCritical, isHalved);
        } else {

            this.damageRoll = new StandardDiceRoll(numberOfDices, dice, modifier, isCritical, isHalved);
        }

        this.modifier = modifier;
        this.damageType = damageType;
        this.isCritical = isCritical;
        this.isHalved = isHalved;
    }

    toString() {
        return this.damageRoll.toString() + ' '
            + (this.isCritical ? 'CRITICAL ' : '')
            + DamageType[this.damageType].toLowerCase();
    }
}
