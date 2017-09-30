export abstract class Item {

    value = 0;
    basePrice = 0;
    name: string;

    abstract getPrice(): number;
}
