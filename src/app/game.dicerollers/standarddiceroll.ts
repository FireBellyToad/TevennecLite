import { DiceRoll } from 'app/game.dicerollers/diceroll';


export class StandardDiceRoll extends DiceRoll {

    roll(): number {
        return  Math.max( 1, Math.floor( Math.random() * this.dice ) );
    }
}
