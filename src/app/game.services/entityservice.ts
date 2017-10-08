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
import { Power } from 'app/game.enums/power';

@Injectable()
export class EntitiesService {

    spellService: SpellService;
    char: Character[];
    mons: Monster[];

    constructor(spellService: SpellService) {
        this.spellService = spellService;

        this.char = [
            new Character('Bill', 2, 1, -1, 0, 1, Role.Spellcaster, Talent.Exemplar,
                ItemFactory.PITCHFORK, null, null, this.spellService.getSpells()),
            new Character('Regrell', 4, 4, 2, 1, 10, Role.Fighter, Talent.Exemplar,
                ItemFactory.getMagicGreatSword(), ItemFactory.FULL_PLATE, null, [this.spellService.getSpellByName('Sagitta'),
                this.spellService.getSpellByName('Medico')]),
            new Character('Dalvert', 2, 0, 4, 3, 10, Role.Spellcaster, Talent.Templar,
                ItemFactory.getMagicMace(), null, ItemFactory.SHIELD, this.spellService.getSpells()),
            new Character('Lissandra', 0, 0, 4, 4, 10, Role.Spellcaster, Talent.Luminous,
                ItemFactory.getMagicMace(), null, ItemFactory.SHIELD, this.spellService.getSpells())
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
            new Monster('Boogeyman', 6, 6, 4, 2, 10,
                Role.Brute, Talent.Quick, MonsterType.MajorFoul,
                new Weapon('Claw', 1, 8, [WeaponType.OneHanded, WeaponType.Slashing]),
                [this.spellService.getSpellByName('Fear'), this.spellService.getSpellByName('Cause Serious Wounds')])];
    }

    getCharacterByName(name: string) {
        return this.char.find((char: Character) => char.name === name);
    }

    getMonsterByName(name: string) {
        return this.mons.find((mons: Monster) => mons.name === name);
    }
}
