import { Component, OnInit, Input, Injectable } from '@angular/core';
import { LogEntry } from 'app/game.services/logentry';
import { Logger } from 'app/game.services/logger';

@Component({
  selector: 'app-battlelog',
  templateUrl: './battlelog.component.html',
  styleUrls: ['./battlelog.component.css']
})

@Injectable()
export class BattlelogComponent implements OnInit {

  logger: Logger;

  constructor( log: Logger ) {
    this.logger = log;
   }

  ngOnInit() {
  }

}
