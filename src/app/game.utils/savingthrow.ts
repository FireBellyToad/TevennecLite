import { DiceRoll } from 'app/game.dicerollers/diceroll';
import { Logger } from 'app/game.services/logger';

export class SavingThrow {

    saveRoll: DiceRoll;
    difficultyClass: number;
    private rerollOnFail: boolean
    log: Logger;

    constructor(saveRoll: DiceRoll, difficultyClass: number, rerollOnFail: boolean, name: string, log: Logger) {
        this.difficultyClass = difficultyClass;
        this.saveRoll = saveRoll;
        this.rerollOnFail = rerollOnFail;
        this.log = log;

        log.addSavingThrowEntry(name, saveRoll.toString(),
            difficultyClass.toString(),
            this.isSuccessful());

        if (!this.isSuccessful() && rerollOnFail) {
            this.saveRoll.rollDice();
            rerollOnFail = false;

            log.addSavingThrowEntry(name, saveRoll.toString(),
                difficultyClass.toString(),
                this.isSuccessful(),
                true);
        }
    }

    isSuccessful() {
        return this.saveRoll.totalResult >= this.difficultyClass;
    }
}
