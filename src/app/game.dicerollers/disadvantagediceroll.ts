import { DiceRoll } from 'app/game.dicerollers/diceroll';


export class DisadvantageDiceRoll extends DiceRoll {

    roll(): number {
        const firstRoll = Math.floor( Math.max( 1, Math.random() * this.dice ) );
        return  Math.min( firstRoll, Math.floor( Math.random() * this.dice ) );
    }

}
