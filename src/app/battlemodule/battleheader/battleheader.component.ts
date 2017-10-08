import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { EntitiesService } from 'app/game.services/entityservice';
import { Character } from 'app/game.entities/character';

@Component({
  selector: 'app-battleheader',
  templateUrl: './battleheader.component.html',
  styleUrls: ['./battleheader.component.css']
})
export class BattleheaderComponent implements OnInit {

  @Input() buttonDisabled = false;
  @Input() currentChar: Character;
  @Output() startRound = new EventEmitter<{ action: string, spell: string }>();
  spellList: string[];
  quickSpellList: string[];
  characterService: EntitiesService;
  numberOfResets = 0;

  constructor(characterService: EntitiesService) {
    this.characterService = characterService;
  }

  ngOnInit() {
    this.spellList = Array.from(this.currentChar.spellsKnown.keys());

  }


  startBattleRound(action: string, spell: string) {
    this.startRound.emit({ action: action, spell: spell });
  }

  resetChar() {
    this.numberOfResets++;
    this.currentChar.actualHP = this.currentChar.maxHp;
    this.currentChar.conditions.clear();
  }
}
