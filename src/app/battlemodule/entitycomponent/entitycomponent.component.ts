import { Component, OnInit, Input } from '@angular/core';
import { GameEntity } from 'app/game.entities/gameentity';
import { Role } from 'app/game.enums/roles';
import { Talent } from 'app/game.enums/talents';
import { Monster } from 'app/game.entities/monster';
import { MonsterType } from 'app/game.enums/monstertype';
import { Character } from 'app/game.entities/character';

@Component({
  selector: 'app-entitycomponent',
  templateUrl: './entitycomponent.component.html',
  styleUrls: ['./entitycomponent.component.css']
})
export class EntitycomponentComponent implements OnInit {

  @Input() entity: GameEntity;

  constructor() { }

  ngOnInit() {
  }

  isCharacter(): boolean {
    return this.entity instanceof Character;
  }

  isMonster(): boolean {
    return this.entity instanceof Monster;
  }

  getMonsterTypeString() {

    let nameToShow = 'Human';

    if ( this.entity instanceof Monster ) {
      switch ( this.entity.monsterType ) {
        case MonsterType.Native: {
          nameToShow = 'Native';
          break;
        }
        case MonsterType.LesserFoul: {
          nameToShow = 'Minor Foul';
          break;
        }
        case MonsterType.LesserUndead: {
          nameToShow = 'Minor Undead';
          break;
        }
        case MonsterType.MajorFoul: {
          nameToShow = 'Major Foul';
          break;
        }
        case MonsterType.MajorUndead: {
          nameToShow = 'Major Undead';
          break;
        }

      }
    }

    return nameToShow;
  }

  getRoleString() {
    return Role[this.entity.role];
  }

  getTalentString() {
    return Talent[this.entity.talent];
  }
}
