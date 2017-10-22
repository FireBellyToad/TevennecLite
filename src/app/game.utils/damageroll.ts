import { DiceRoll } from 'app/game.dicerollers/diceroll';
import { StandardDiceRoll } from 'app/game.dicerollers/standarddiceroll';
import { DamageType } from 'app/game.utils/damagetypes';
import { AdvantageDiceRoll } from 'app/game.dicerollers/advantagediceroll';

export class DamageRoll {

    modifier: number;
    damageRolls: DiceRoll[] = [];
    damageType: DamageType;
    isCritical: boolean;
    isHalved: boolean;
    totalDamage = 0;

    constructor(dices: { numberOfDices: number, dice: number }[], modifier: number, damageType: DamageType,
        isCritical = false, isHalved = false, hasAdvantage = false) {

        if (hasAdvantage) {
            dices.forEach((dice: { numberOfDices: number, dice: number }) => {
                this.damageRolls.push(new AdvantageDiceRoll(dice.numberOfDices, dice.dice, 0, isCritical, isHalved));
            });

        } else {

            dices.forEach((dice: { numberOfDices: number, dice: number }) => {
                this.damageRolls.push(new StandardDiceRoll(dice.numberOfDices, dice.dice, 0, isCritical, isHalved));
            });
        }

        // Calculate the total result
        this.damageRolls.forEach((roll: DiceRoll) => {
            this.totalDamage += roll.totalResult;
        });
        this.totalDamage += isHalved ? Math.floor(modifier / 2) : modifier;

        this.modifier = modifier;
        this.damageType = damageType;
        this.isCritical = isCritical;
        this.isHalved = isHalved;
    }

    // format "XdY + KdW + Z" or "XdY + KdW -Z" if Z is less 0, or "XdY + KdW" if Z equals 0
    toString(): string {
        let diceRolls = '';
        this.damageRolls.forEach((roll: DiceRoll) => {
            diceRolls += ((diceRolls !== '') ? '+' : '') + roll.getRollOnlyString();
        });

        return this.getRollOnlyString()
            + ' = ' + this.totalDamage
            + (this.isCritical ? ' CRITICAL ' : ' ')
            + DamageType[this.damageType].toLowerCase();
    }

    // format "XdY + KdW
    getRollOnlyString() {
        let diceRolls = '';
        this.damageRolls.forEach((roll: DiceRoll) => {
            diceRolls += ((diceRolls !== '') ? '+' : '') + roll.getRollOnlyString();
        });

        return diceRolls + ((this.modifier === 0) ? '' : ((this.modifier < 0) ? '-' : '+') + Math.abs(this.modifier))
    }
}
