import { DiceRoll } from 'app/game.dicerollers/diceroll';

export class SavingThrow {

    saveRoll: DiceRoll;
    difficultyClass: number;

    constructor(saveRoll: DiceRoll, difficultyClass: number) {
        this.difficultyClass = difficultyClass;
        this.saveRoll = saveRoll;
    }

    hasSuccess() {
        return this.saveRoll.totalResult >= this.difficultyClass;
    }
}
