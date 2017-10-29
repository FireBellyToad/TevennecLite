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
import { Castable } from 'app/game.spells/castable';
import { Logger } from 'app/game.services/logger';
import { SpellService } from 'app/game.services/spellservice';
import { EntitiesService } from 'app/game.services/entityservice';
import { BattleService } from 'app/game.services/battleservice';
import { BattleTurn } from 'app/game.utils/battleturn';
import { Condition } from 'app/game.enums/conditions';

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
    this.char = this.characterService.getCharacterByName('Regrell');
    this.mons = this.characterService.getMonsterByName('Horla');
    this.mons.takeCondition(Condition.Far, 1, true);
  }

  startRound(playerTurnAction: BattleTurn) {
    this.roundNumber++;

    const entitiesInBattle: GameEntity[] = [this.char, this.mons];
    playerTurnAction.target = this.mons;

    this.battleService.startRound(this.roundNumber, entitiesInBattle, playerTurnAction);

  }

  setCharacter() {
    this.char.actualHP = this.char.maxHp;
    this.char.conditions.clear();
    this.char.activeAuras.clear();
    this.char.occupiedSlots = 0;
    this.char.availableSlots = this.char.getEnergySlots();
  }

  setMonster() {
    this.mons.actualHP = this.char.maxHp;
    this.mons.conditions.clear();
    this.mons.activeAuras.clear();
    this.mons.occupiedSlots = 0;
    this.mons.availableSlots = this.mons.getEnergySlots();
  }
}
