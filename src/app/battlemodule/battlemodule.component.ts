import { Component, OnInit } from '@angular/core';
import { Character } from 'app/game.entities/character';
import { Role } from 'app/game.enums/roles';
import { Talent } from 'app/game.enums/talents';
import { MonsterType } from 'app/game.enums/monstertype';
import { Monster } from 'app/game.entities/monster';
import { Weapon } from 'app/game.items/weapon';
import { WeaponType } from 'app/game.enums/weapontypes';
import { LogEntry } from 'app/game.services/logentry';
import { GameEntity } from 'app/game.entities/gameentity';
import { DamageRoll } from 'app/game.utils/damageroll';
import { ItemFactory } from 'app/game.items/itemfactory';
import { Castable } from 'app/game.spells/castable';
import { Logger } from 'app/game.services/logger';
import { SpellService } from 'app/game.services/spellservice';
import { EntitiesService } from 'app/game.services/entityservice';
import { BattleService } from 'app/game.services/battleservice';
import { BattleTurn } from 'app/game.utils/battleturn';

@Component({
  selector: 'app-battlemodule',
  templateUrl: './battlemodule.component.html',
  styleUrls: ['./battlemodule.component.css']
})

export class BattlemoduleComponent implements OnInit {

  battleTimer: any;
  logger: Logger;
  spellService: SpellService;
  characterService: EntitiesService;
  battleService: BattleService;
  char: Character;
  mons: Monster;

  roundNumber = 0;

  constructor(logger: Logger, spellService: SpellService, characterService: EntitiesService, battleService: BattleService) {
    this.logger = logger;
    this.spellService = spellService;
    this.battleService = battleService;
    this.characterService = characterService;
  }

  ngOnInit() {
    this.char = this.characterService.getCharacterByName('Sir Matheus');
    this.mons = this.characterService.getMonsterByName('Boogeyman');
  }

  startRound(playerTurnAction: BattleTurn) {
    this.roundNumber++;

    const entitiesInBattle: GameEntity[] = [this.char, this.mons];
    playerTurnAction.target = this.mons;

    this.battleService.startRound(this.roundNumber, entitiesInBattle, playerTurnAction);

  }
}
