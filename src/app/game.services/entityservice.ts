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

    constructor( spellService: SpellService ) {
        this.spellService = spellService;

        this.char = [
            new Character('Regrell', 4, 2, 3, 0, 10, Role.Fighter, Talent.Exemplar,
            null, null, null, this.spellService.getSpells()),
            new Character( 'Dalvert', 2, 0, 4, 3, 10, Role.Spellcaster, Talent.Templar,
                            ItemFactory.MACE, null, ItemFactory.SHIELD, this.spellService.getSpells())
        ];
        this.mons = [
            new Monster( 'Ogre', 5, 2, 0, 0, 4,
                         Role.Brute, Talent.Big, MonsterType.MinorFoul,
                         new Weapon( 'Smash', 1, 6, [WeaponType.OneHanded, WeaponType.Bludgeoning])),
            new Monster( 'Rabid Dog', 0, -2, -2, -2, 1,
                          Role.Brute, Talent.Generic, MonsterType.Native,
                          new Weapon( 'Bite', 1, 2, [WeaponType.OneHanded, WeaponType.Piercing])),
            new Monster( 'Necrospecter', 3, 2, 2, 1, 4,
                         Role.Brute, Talent.Quick, MonsterType.MinorUndead,
                         new Weapon( 'Claw', 1, 4, [WeaponType.OneHanded, WeaponType.Slashing])),
            new Monster( 'Death Giant', 8, 2, 2, 1, 9,
                         Role.Brute, Talent.Big, MonsterType.MajorUndead,
                         new Weapon( 'Smash', 1, 12, [WeaponType.OneHanded, WeaponType.Bludgeoning]))];
    }

    getCharacterByName( name: string ) {
        return this.char.find( ( char: Character ) => char.name === name );
    }

    getMonsterByName( name: string ) {
        return this.mons.find( ( mons: Monster ) => mons.name === name );
    }
}
