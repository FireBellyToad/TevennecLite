import { Item } from 'app/game.items/item';
import { Power } from 'app/game.enums/powers';

export class Shield extends Item {

    powers = new Map<Power, number>();

    constructor(powers?: Map<Power, number>) {
        super();
        this.powers = powers;
    }

    getPrice(): number {
        return this.basePrice;
    }

}
