import { SpellService } from 'app/game.services/spellservice';
import { Injectable } from '@angular/core';
import { Monster } from 'app/game.entities/monster';
import { Character } from 'app/game.entities/character';
import { Role } from 'app/game.enums/roles';
import { Talent } from 'app/game.enums/talents';
import { WeaponType } from 'app/game.enums/weapontypes';
import { Weapon } from 'app/game.items/weapon';
import { MonsterType } from 'app/game.enums/monstertype';
import { Power } from 'app/game.enums/powers';
import { ItemService } from 'app/game.services/itemservice';
import { Mastery } from 'app/game.enums/mastery';

@Injectable()
export class EntitiesService {

    spellService: SpellService;
    itemService: ItemService;

    char: Character[];
    mons: Monster[];

    constructor(spellService: SpellService, itemService: ItemService) {
        this.spellService = spellService;
        this.itemService = itemService;

        const precise = new Map<Power, number>();
        precise.set(Power.Precise, 1);

        const blessedOfTheBear = new Map<Power, number>();
        blessedOfTheBear.set(Power.OfTheBear, 1);
        blessedOfTheBear.set(Power.Blessed, 2);

        const blessedOfTheDivinity = new Map<Power, number>();
        blessedOfTheDivinity.set(Power.OfTheDivinity, 1);
        blessedOfTheDivinity.set(Power.Blessed, 2);

        const destructiveOfPrecision = new Map<Power, number>();
        destructiveOfPrecision.set(Power.OfPrecision, 3);
        destructiveOfPrecision.set(Power.Destructive, 0);

        const shieldPowers = new Map<Power, number>();
        shieldPowers.set(Power.Blocking, 1);
        // shieldPowers.set(Power.OfFirmness, 0);

        const lumionousOfTheEagle = new Map<Power, number>();
        lumionousOfTheEagle.set(Power.Luminous, 1);
        lumionousOfTheEagle.set(Power.OfTheEagle, 2);

        const lumionousOfEfficiency = new Map<Power, number>();
        lumionousOfEfficiency.set(Power.Luminous, 1);
        lumionousOfEfficiency.set(Power.OfEfficiency, 2);

        const ofMagic = new Map<Power, number>();
        ofMagic.set(Power.OfMagic, 2);

        const blockingOfMagic = new Map<Power, number>();
        blockingOfMagic.set(Power.OfMagic, 2);
        blockingOfMagic.set(Power.Blocking, 2);

        this.char = [
            new Character('Bill', 2, 1, -1, 0, 1, Role.Spellcaster, Talent.Cleric,
                itemService.getWeaponByName('Pitchfork'), itemService.getArmorByName('Unarmored')),
            new Character('Tulpin', 1, 5, 1, 0, 10, Role.Fighter, Talent.Duelist,
                itemService.getMagicWeaponByName('Rapier', lumionousOfTheEagle),
                itemService.getMagicArmorByName('Chain mail', blessedOfTheBear), null,
                itemService.getRing(Power.OfTheFox, 1), itemService.getRing(Power.OfBlessing, 2)),
            new Character('Regrell', 4, 3, 3, 1, 10, Role.Fighter, Talent.Mercenary,
                itemService.getMagicWeaponByName('Great sword', destructiveOfPrecision),
                itemService.getMagicArmorByName('Full plate', blessedOfTheBear),
                null, itemService.getRing(Power.OfPrecision, 2), itemService.getRing(Power.OfBlessing, 2),
                this.spellService.getCharacterSpells(2)),
            new Character('Raast', 3, 3, 2, 0, 10, Role.Fighter, Talent.Corrupted,
                itemService.getMagicWeaponByName('Great sword', destructiveOfPrecision),
                itemService.getMagicArmorByName('Full plate', blessedOfTheBear),
                null, itemService.getRing(Power.OfPrecision, 2), itemService.getRing(Power.OfBlessing, 2),
                this.spellService.getCharacterSpells(1)),
            new Character('Sir Matheus', 2, 2, 2, 0, 6, Role.Fighter, Talent.Paladin,
                itemService.getMagicWeaponByName('Long sword', precise),
                itemService.getMagicArmorByName('Splint mail'),
                itemService.getShield(shieldPowers),
                null, null, this.spellService.getCharacterSpells(2)),
            new Character('Dalvert', 2, 0, 4, 3, 10, Role.Spellcaster, Talent.Templar,
                itemService.getMagicWeaponByName('Morningstar', destructiveOfPrecision),
                itemService.getMagicArmorByName('Full plate', blessedOfTheBear), itemService.getShield(shieldPowers),
                itemService.getRing(Power.OfPrecision, 2), itemService.getRing(Power.OfMeditation, 2),
                this.spellService.getCharacterSpells()),
            new Character('Emeric', 0, 0, 5, 4, 10, Role.Spellcaster, Talent.Cleric,
                itemService.getMagicWeaponByName('Quarterstaff', blockingOfMagic),
                itemService.getMagicArmorByName('Chain mail', blessedOfTheDivinity), itemService.getShield(shieldPowers),
                itemService.getRing(Power.OfTheEagle, 2), itemService.getRing(Power.OfMeditation, 2),
                this.spellService.getCharacterSpells()),
            new Character('Lissandra', 0, 0, 5, 4, 10, Role.Spellcaster, Talent.Luminous,
                itemService.getMagicWeaponByName('Mace', ofMagic), itemService.getMagicArmorByName('Chain mail', blessedOfTheBear),
                itemService.getShield(shieldPowers),
                itemService.getRing(Power.OfTheEagle, 2), itemService.getRing(Power.OfBlessing, 2),
                this.spellService.getCharacterSpells())
        ];
        this.mons = [
            new Monster('Lesser Daemon', 0, 1, 2, 1, 2,
                Role.Sorcerer, Talent.Generic, MonsterType.LesserFoul,
                new Weapon('Smash', 1, 3, [WeaponType.OneHanded, WeaponType.Bludgeoning]),
                [this.spellService.getSpellByName('Cause Wounds')]),
            new Monster('Ogre', 5, 2, 0, 0, 4,
                Role.Brute, Talent.Big, MonsterType.LesserFoul,
                new Weapon('Smash', 1, 6, [WeaponType.OneHanded, WeaponType.Bludgeoning], [Mastery.Stun])),
            new Monster('Rabid Dog', 0, -2, -2, -2, 1,
                Role.Brute, Talent.Generic, MonsterType.Native,
                new Weapon('Bite', 1, 2, [WeaponType.OneHanded, WeaponType.Piercing])),
            new Monster('Necrospecter', 3, 2, 2, 1, 4,
                Role.Brute, Talent.Quick, MonsterType.LesserUndead,
                new Weapon('Claw', 1, 4, [WeaponType.OneHanded, WeaponType.Slashing]),
                [this.spellService.getSpellByName('Fear')]),
            new Monster('Abomination', 4, 2, 2, 0, 5,
                Role.Brute, Talent.Lethal, MonsterType.Native,
                new Weapon('Tentacle', 1, 4, [WeaponType.OneHanded, WeaponType.Piercing], [Mastery.Maim]),
                [this.spellService.getSpellByName('Maiming'),
                this.spellService.getSpellByName('Bleed')]),
            new Monster('The Giant', 5, 4, 3, 2, 5,
                Role.Boss, Talent.Big, MonsterType.Native,
                new Weapon('Smash', 1, 6, [WeaponType.OneHanded, WeaponType.Bludgeoning], [Mastery.Stun]),
                [this.spellService.getSpellByName('Fear'), this.spellService.getSpellByName('Cure Wounds')]),
            new Monster('Succubus', 1, 3, 4, 4, 6,
                Role.Sorcerer, Talent.Generic, MonsterType.LesserFoul,
                new Weapon('Claw', 1, 4, [WeaponType.OneHanded, WeaponType.Slashing]),
                [this.spellService.getSpellByName('Bleed'),
                this.spellService.getSpellByName('Cause Serious Wounds'),
                this.spellService.getSpellByName('Greater Mind Wave')]),
            new Monster('Risen Soldier', 4, 4, 2, 2, 7,
                Role.Brute, Talent.Trained, MonsterType.MajorUndead,
                itemService.getWeaponByName('Short sword'), [this.spellService.getSpellByName('Cure Wounds')]),
            new Monster('Death Giant', 10, 2, 2, 1, 9,
                Role.Brute, Talent.Big, MonsterType.MajorUndead,
                new Weapon('Smash', 1, 12, [WeaponType.OneHanded, WeaponType.Bludgeoning], [Mastery.Stun])),
            new Monster('Lich', 2, 4, 8, 6, 10,
                Role.Sorcerer, Talent.Generic, MonsterType.MajorUndead,
                new Weapon('Deadly touch', 1, 4, [WeaponType.OneHanded, WeaponType.Piercing]),
                this.spellService.getMonsterSpells()),
            new Monster('Boogeyman', 6, 6, 4, 2, 10,
                Role.Brute, Talent.Quick, MonsterType.MajorFoul,
                new Weapon('Claw', 1, 8, [WeaponType.OneHanded, WeaponType.Slashing], [Mastery.Maim]),
                [this.spellService.getSpellByName('Fear'), this.spellService.getSpellByName('Cause Serious Wounds'),
                this.spellService.getSpellByName('Suppress Aura')]),
            new Monster('Horla', 8, 8, 6, 8, 10,
                Role.Boss, Talent.Quick, MonsterType.MajorFoul,
                new Weapon('Claw', 1, 6, [WeaponType.OneHanded, WeaponType.Slashing], [Mastery.Maim]),
                this.spellService.getMonsterSpells())];
    }

    getCharacterByName(name: string) {
        return this.char.find((char: Character) => char.name === name);
    }

    getMonsterByName(name: string) {
        return this.mons.find((mons: Monster) => mons.name === name);
    }
}
