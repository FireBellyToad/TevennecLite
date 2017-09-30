import { DiceRoll } from 'app/game.dicerollers/diceroll';


export class AdvantageDiceRoll extends DiceRoll {

    roll(): number {
        const firstRoll = Math.max( 1, Math.floor( Math.random() * this.dice ) );
        return  Math.max( firstRoll, Math.floor( Math.random() * this.dice ) );
    }

}
