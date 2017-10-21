import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BattlemoduleComponent } from './battlemodule/battlemodule.component';
import { BattleheaderComponent } from './battlemodule/battleheader/battleheader.component';
import { EntitycomponentComponent } from './battlemodule/entitycomponent/entitycomponent.component';
import { BattlelogComponent } from './battlemodule/battlelog/battlelog.component';
import { Logger } from 'app/game.services/logger';
import { SpellService } from 'app/game.services/spellservice';
import { EntitiesService } from 'app/game.services/entityservice';
import { BattleService } from 'app/game.services/battleservice';
import { ItemService } from 'app/game.services/itemservice';

@NgModule({
  declarations: [
    AppComponent,
    BattlemoduleComponent,
    BattleheaderComponent,
    EntitycomponentComponent,
    BattlelogComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
              Logger,
              SpellService,
              EntitiesService,
              ItemService,
              BattleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
