import { Item } from 'app/game.items/item';
import { Power } from 'app/game.enums/powers';

export class Ring extends Item {

    powers: Map<Power, number>;

    constructor(powers = new Map<Power, number>()) {
        super();
        this.powers = powers
    }
    
    getPrice(): number {
        return this.basePrice;
    }

}
