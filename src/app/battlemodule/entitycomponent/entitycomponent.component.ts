import { Component, OnInit, Input } from '@angular/core';
import { GameEntity } from 'app/game.entities/gameentity';
import { Role } from 'app/game.enums/roles';
import { Talent } from 'app/game.enums/talents';
import { Monster } from 'app/game.entities/monster';
import { MonsterType } from 'app/game.enums/monstertype';
import { Character } from 'app/game.entities/character';
import { Condition } from 'app/game.enums/conditions';
import { DamageRoll } from 'app/game.utils/damageroll';

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

    if (this.entity instanceof Monster) {
      switch (this.entity.monsterType) {
        case MonsterType.Native: {
          nameToShow = 'Native';
          break;
        }
        case MonsterType.LesserFoul: {
          nameToShow = 'Lesser Foul';
          break;
        }
        case MonsterType.LesserUndead: {
          nameToShow = 'Lesser Undead';
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

  getConditionList(): Condition[] {
    return Array.from(this.entity.conditions.keys());
  }

  getConditionString(condition: Condition): string {
    return Condition[condition]
  }
}
