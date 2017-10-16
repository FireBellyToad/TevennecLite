import { SpellService } from 'app/game.services/spellservice';
import { Injectable } from '@angular/core';
import { Monster } from 'app/game.entities/monster';
import { Character } from 'app/game.entities/character';
import { Role } from 'app/game.enums/roles';
import { Talent } from 'app/game.enums/talents';
import { ItemFactory } from 'app/game.items/itemfactory';
import { WeaponType } from 'app/game.enums/weapontypes';
import { Weapon } from 'app/game.items/weapon';
import { MonsterType } from 'app/game.enums/monstertype';
import { Power } from 'app/game.enums/powers';

@Injectable()
export class EntitiesService {

    spellService: SpellService;
    char: Character[];
    mons: Monster[];

    constructor(spellService: SpellService) {
        this.spellService = spellService;

        this.char = [
            new Character('Bill', 2, 1, -1, 0, 1, Role.Spellcaster, Talent.Exemplar,
                ItemFactory.PITCHFORK),
            new Character('Regrell', 4, 3, 3, 1, 10, Role.Fighter, Talent.Exemplar,
                ItemFactory.getMagicGreatSword(), ItemFactory.FULL_PLATE, null, ItemFactory.getRing(Power.OfPrecision, 2), null,
                this.spellService.getCharacterSpells(2)),
            new Character('Sir Matheus', 3, 2, 3, 0, 10, Role.Fighter, Talent.Paladin,
                ItemFactory.getMagicLongSword(), ItemFactory.FULL_PLATE, ItemFactory.SHIELD,
                null, null, this.spellService.getCharacterSpells(3)),
            new Character('Dalvert', 2, 0, 4, 3, 10, Role.Spellcaster, Talent.Templar,
                ItemFactory.getMagicMace(), ItemFactory.FULL_PLATE, ItemFactory.SHIELD, ItemFactory.getRing(Power.OfPrecision, 2), null,
                this.spellService.getCharacterSpells()),
            new Character('Lissandra', 0, 0, 4, 4, 10, Role.Spellcaster, Talent.Luminous,
                ItemFactory.getMagicMace(), ItemFactory.CHAIN_MAIL, ItemFactory.SHIELD, null, null, this.spellService.getCharacterSpells())
        ];
        this.mons = [
            new Monster('Lesser Daemon', 0, 1, 2, 1, 2,
                Role.Sorcerer, Talent.Generic, MonsterType.LesserFoul,
                new Weapon('Smash', 1, 3, [WeaponType.OneHanded, WeaponType.Bludgeoning]),
                [this.spellService.getSpellByName('Cause Wounds')]),
            new Monster('Ogre', 5, 2, 0, 0, 4,
                Role.Brute, Talent.Big, MonsterType.LesserFoul,
                new Weapon('Smash', 1, 6, [WeaponType.OneHanded, WeaponType.Bludgeoning])),
            new Monster('Rabid Dog', 0, -2, -2, -2, 1,
                Role.Brute, Talent.Generic, MonsterType.Native,
                new Weapon('Bite', 1, 2, [WeaponType.OneHanded, WeaponType.Piercing])),
            new Monster('Necrospecter', 3, 2, 2, 1, 4,
                Role.Brute, Talent.Quick, MonsterType.LesserUndead,
                new Weapon('Claw', 1, 4, [WeaponType.OneHanded, WeaponType.Slashing])),
            new Monster('Abomination', 4, 2, 2, 0, 5,
                Role.Brute, Talent.Lethal, MonsterType.Native,
                new Weapon('Tentacle', 1, 4, [WeaponType.OneHanded, WeaponType.Piercing]),
                [this.spellService.getSpellByName('Maiming'),
                this.spellService.getSpellByName('Bleed')]),
            new Monster('The Giant', 5, 4, 3, 2, 5,
                Role.Boss, Talent.Big, MonsterType.Native,
                new Weapon('Smash', 1, 6, [WeaponType.OneHanded, WeaponType.Bludgeoning]),
                [this.spellService.getSpellByName('Fear'), this.spellService.getSpellByName('Cure Wounds')]),
            new Monster('Succubus', 1, 3, 4, 4, 6,
                Role.Sorcerer, Talent.Generic, MonsterType.LesserFoul,
                new Weapon('Claw', 1, 4, [WeaponType.OneHanded, WeaponType.Slashing]),
                [this.spellService.getSpellByName('Cause Serious Wounds'),
                this.spellService.getSpellByName('Greater Mind Wave')]),
            new Monster('Risen Soldier', 4, 4, 2, 2, 7,
                Role.Brute, Talent.Trained, MonsterType.MajorUndead,
                ItemFactory.SHORT_SWORD, [this.spellService.getSpellByName('Cure Wounds')]),
            new Monster('Death Giant', 8, 2, 2, 1, 9,
                Role.Brute, Talent.Big, MonsterType.MajorUndead,
                new Weapon('Smash', 1, 12, [WeaponType.OneHanded, WeaponType.Bludgeoning])),
            new Monster('Lich', 2, 4, 8, 6, 10,
                Role.Sorcerer, Talent.Generic, MonsterType.MajorUndead,
                new Weapon('Deadly touch', 1, 4, [WeaponType.OneHanded, WeaponType.Piercing]),
                this.spellService.getMonsterSpells()),
            new Monster('Boogeyman', 6, 6, 4, 2, 10,
                Role.Brute, Talent.Quick, MonsterType.MajorFoul,
                new Weapon('Claw', 1, 8, [WeaponType.OneHanded, WeaponType.Slashing]),
                [this.spellService.getSpellByName('Fear'), this.spellService.getSpellByName('Cause Serious Wounds'),
                this.spellService.getSpellByName('Suppress Aura')])];
    }

    getCharacterByName(name: string) {
        return this.char.find((char: Character) => char.name === name);
    }

    getMonsterByName(name: string) {
        return this.mons.find((mons: Monster) => mons.name === name);
    }
}
