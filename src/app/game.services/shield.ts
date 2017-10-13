import { Item } from 'app/game.items/item';
import { Power } from 'app/game.enums/powers';

export class Shield extends Item {

    powers = new Map< Power, number>();

    getPrice(): number {
        return this.basePrice;
    }

}
