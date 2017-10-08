export abstract class DiceRoll {

    dice: number;
    numberOfDices: number;
    modifier: number;
    naturalResults: number[] = [];
    totalResult: number;
    maximized: boolean;
    halved: boolean;

    abstract roll(): number;

    constructor(numberOfDices: number, dice: number, modifier = 0, maximized = false, halved = false) {
        this.dice = dice;
        this.numberOfDices = Math.max(1, numberOfDices);
        this.modifier = modifier;
        this.totalResult = 0;
        this.maximized = maximized;
        this.halved = halved;
        this.rollDice();
    }

    // Use this to roll the dice
    rollDice() {

        this.totalResult = 0;
        let rollResult;

        for (let i = 0; i < this.numberOfDices; i++) {

            // check if result must be maximized
            rollResult = this.maximized ? this.dice : this.roll();

            this.naturalResults.push(rollResult)

            this.totalResult += rollResult

        }

        // Check if the result must be halved
        if (this.halved) {
            this.totalResult = Math.floor((this.totalResult + this.modifier) / 2);
        } else {
            this.totalResult = this.totalResult + this.modifier;
        }

    }

    // format "XdY + Z" or "XdY-Z" if Z is less 0, or "XdY" if Z equals 0
    toString(): string {
        return this.numberOfDices + 'd' + this.dice
            + ((this.modifier === 0) ? '' :
                ((this.modifier < 0) ? '-' : '+') + Math.abs(this.modifier))
            + ' = ' + this.totalResult;
    }
}
