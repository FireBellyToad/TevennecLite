import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { EntitiesService } from 'app/game.services/entityservice';

@Component({
  selector: 'app-battleheader',
  templateUrl: './battleheader.component.html',
  styleUrls: ['./battleheader.component.css']
})
export class BattleheaderComponent implements OnInit {

  @Output() startRound = new EventEmitter<{action: string, spell: string}>();
  spellList: string[];
  spellTocast: string;
  actionToTake: string;
  characterService: EntitiesService;

  constructor( characterService: EntitiesService ) {
    this.characterService = characterService;
    this.spellList = Array.from( characterService.getCharacterByName('Regrell').spellsKnown.keys() );
   }

  ngOnInit() {
  }

  setSpellToCast( event ) {
    this.spellTocast = event.value;
  }

  startBattleRound() {
    this.startRound.emit({ action: this.actionToTake, spell: this.spellTocast });
  }
}
