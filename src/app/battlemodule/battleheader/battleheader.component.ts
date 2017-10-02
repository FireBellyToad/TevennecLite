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
  spellTocast: string;
  actionToTake: string;
  characterService: EntitiesService;
  numberOfResets = 0;

  constructor(characterService: EntitiesService) {
    this.characterService = characterService;
  }

  ngOnInit() {
    this.spellList = Array.from(this.currentChar.spellsKnown.keys());
  }

  setSpellToCast(event) {
    this.spellTocast = event.value;
  }

  startBattleRound() {
    this.startRound.emit({ action: this.actionToTake, spell: this.spellTocast });
  }

  resetCharLife() {
    this.numberOfResets++;
    this.currentChar.actualHP = this.currentChar.maxHp;
  }
}
