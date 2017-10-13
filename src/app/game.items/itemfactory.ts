import { Weapon } from 'app/game.items/weapon';
import { WeaponType } from 'app/game.enums/weapontypes';
import { Armor } from 'app/game.items/armor';
import { ArmorType } from 'app/game.enums/armortypes';
import { Power } from 'app/game.enums/powers';
import { Shield } from 'app/game.items/shield';
import { Ring } from 'app/game.items/ring';

export class ItemFactory {

    // ------------------------------------- WEAPONS ------------------------------------- //
    static readonly UNARMED_STRIKE = new Weapon('Unarmed', 1, 2, [WeaponType.OneHanded, WeaponType.Bludgeoning]);
    static readonly SHORT_SWORD = new Weapon('Short sword', 1, 6, [WeaponType.OneHanded, WeaponType.Slashing]);
    static readonly LONG_SWORD = new Weapon('Long sword', 1, 8, [WeaponType.OneHanded, WeaponType.Slashing]);
    static readonly MACE = new Weapon('Mace', 1, 4, [WeaponType.OneHanded, WeaponType.Bludgeoning]);
    static readonly GREAT_SWORD = new Weapon('Great sword', 1, 12, [WeaponType.TwoHanded, WeaponType.Slashing]);
    static readonly PITCHFORK = new Weapon('Pitchfork', 1, 6, [WeaponType.TwoHanded, WeaponType.Piercing]);


    // ------------------------------------- ARMORS ------------------------------------- //

    static readonly UNARMORED = new Armor('Unarmored', 0, ArmorType.Light);
    static readonly LEATHER_ARMOR = new Armor('Leather armor', 3, ArmorType.Light);
    static readonly CHAIN_MAIL = new Armor('Chain mail', 4, ArmorType.Light);
    static readonly FULL_PLATE = new Armor('Full plate', 8, ArmorType.Heavy);
    static readonly SHIELD = new Shield();

    // ------------------------------------- MAGIC WEAPONS ------------------------------------- //
    static getMagicShortSword(powers?: Map<Power, number>) {
        return new Weapon('Short sword', 1, 6, [WeaponType.OneHanded, WeaponType.Slashing], 1, powers);
    }
    static getMagicMace(powers?: Map<Power, number>) {
        return new Weapon('Mace', 1, 6, [WeaponType.OneHanded, WeaponType.Bludgeoning], 1, powers);
    }
    static getMagicGreatSword(powers?: Map<Power, number>) {
        return new Weapon('Great sword', 1, 12, [WeaponType.TwoHanded, WeaponType.Slashing], 1, powers);
    }


    // ------------------------------------- MAGIC ARMORS ------------------------------------- //
    static getMagicLeatherArmor(powers?: Map<Power, number>) {
        return new Armor('Leather armor', 3, ArmorType.Light, powers);
    }

    static getMagicFullPlate(powers?: Map<Power, number>) {
        return new Armor('Full plate', 8, ArmorType.Heavy, powers);
    }

    static getRingOfPrecision() {

        const powers = new Map<Power, number>();
        powers.set(Power.OfPrecision, 2);
        return new Ring(powers);
    }
}
