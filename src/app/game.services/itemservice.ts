import { Weapon } from 'app/game.items/weapon';
import { WeaponType } from 'app/game.enums/weapontypes';
import { Armor } from 'app/game.items/armor';
import { ArmorType } from 'app/game.enums/armortypes';
import { Power } from 'app/game.enums/powers';
import { Shield } from 'app/game.items/shield';
import { Ring } from 'app/game.items/ring';
import { Mastery } from 'app/game.enums/mastery';
import { Injectable } from '@angular/core';

@Injectable()
export class ItemService {

    private weapons: Weapon[] = [];
    private armors: Armor[] = [];
    private shield = new Shield();

    constructor() {
        this.weapons = [
            new Weapon('Unarmed', 1, 2, [WeaponType.OneHanded, WeaponType.Bludgeoning]),
            new Weapon('Mace', 1, 4, [WeaponType.OneHanded, WeaponType.Bludgeoning], [Mastery.Stun, Mastery.ImprovedStun]),
            new Weapon('Pitchfork', 1, 6, [WeaponType.TwoHanded, WeaponType.Piercing]),
            new Weapon('Short sword', 1, 6, [WeaponType.OneHanded, WeaponType.Slashing], [Mastery.ImprovedCritical, Mastery.Bleed]),
            new Weapon('War hammer', 1, 6, [WeaponType.OneHanded, WeaponType.Bludgeoning], [Mastery.Stun, Mastery.ImprovedStun]),
            new Weapon('Long sword', 1, 8, [WeaponType.OneHanded, WeaponType.Slashing], [Mastery.Maim, Mastery.Bleed]),
            new Weapon('Morningstar', 1, 8, [WeaponType.OneHanded, WeaponType.Bludgeoning], [Mastery.Stun, Mastery.ImprovedStun]),
            new Weapon('Great sword', 1, 12, [WeaponType.TwoHanded, WeaponType.Slashing], [Mastery.Maim, Mastery.Stun]),
        ];

        this.armors = [
            new Armor('Unarmored', 0, ArmorType.Light),
            new Armor('Leather armor', 3, ArmorType.Light),
            new Armor('Chain mail', 4, ArmorType.Light),
            new Armor('Full plate', 8, ArmorType.Heavy),

        ];
    }

    getWeaponByName(name: string): Weapon {
        return this.weapons.find((we: Weapon) => we.name === name)
    }

    getMagicWeaponByName(name: string, powers = new Map<Power, number>()): Weapon {
        const baseWeapon = this.getWeaponByName(name);
        baseWeapon.powers = powers;
        baseWeapon.updateDamageType();
        return baseWeapon;
    }

    getArmorByName(name: string): Armor {
        return this.armors.find((ar: Armor) => ar.name === name)
    }

    getMagicArmorByName(name: string, powers = new Map<Power, number>()): Armor {
        const baseArmor = this.getArmorByName(name);
        baseArmor.powers = powers;
        return baseArmor;
    }

    getShield(powers = new Map<Power, number>()) {

        return new Shield(powers);
    }

    getRing(power: Power, value: number) {

        const powers = new Map<Power, number>();
        powers.set(power, value);
        return new Ring(powers);
    }
}
