import { Component, OnInit, DoCheck, EventEmitter, Output, Input } from '@angular/core';
import { EntitiesService } from 'app/game.services/entityservice';
import { Character } from 'app/game.entities/character';
import { BattleTurn } from 'app/game.utils/battleturn';
import { AuraEffect } from 'app/game.enums/auraeffects';

@Component({
  selector: 'app-battleheader',
  templateUrl: './battleheader.component.html',
  styleUrls: ['./battleheader.component.css']
})
export class BattleheaderComponent implements OnInit {
  @Input() buttonDisabled = false;
  @Input() currentChar: Character;
  @Output() startRound = new EventEmitter<BattleTurn>();
  spellList: string[];
  characterService: EntitiesService;
  numberOfResets = 0;

  constructor(characterService: EntitiesService) {
    this.characterService = characterService;
  }

  ngOnInit() {
    this.spellList = Array.from(this.currentChar.spellsKnown.keys());
  }

  quickSpellList() {
    let quickSpellTemp = Array.from(this.currentChar.spellsKnown.values());
    const delta = this.currentChar.activeAuras.has(AuraEffect.Celeritas) ? 2 : 3;
    quickSpellTemp = quickSpellTemp.filter(sp => sp.spellLevel + delta <= this.currentChar.getMin())
    const quickSpellList = [];

    for (const spell of quickSpellTemp) {

      quickSpellList.push(spell.name);
    }
    return quickSpellList;
  }

  activeAuraList() {
    const auraToReleaseList = []

    this.currentChar.activeAuras.forEach((value: number, aura: AuraEffect) => {
      auraToReleaseList.push(aura);
    });

    return auraToReleaseList;
  }

  getAuraName(aura: AuraEffect): string {
    return AuraEffect[aura];
  }

  startBattleRound(action: string, spell: string, quickSpell: string, auraToRelease: string) {
    this.startRound.emit({ action: action, spell: spell, quickSpell: quickSpell, auraToRelease: auraToRelease, target: undefined });
  }

  resetChar() {
    this.numberOfResets++;
    this.currentChar.actualHP = this.currentChar.maxHp;
    this.currentChar.conditions.clear();
  }
}
