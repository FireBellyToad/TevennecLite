import { LogEntry } from 'app/game.services/logentry';
import { Injectable } from '@angular/core';
@Injectable()
export class Logger {

    logEntries: LogEntry[] = [];

    getLog(): LogEntry[] {
        return this.logEntries;
    }

    // Add Entry to BattleLog
    addEntry(text: string, textColor = LogEntry.COLOR_RED) {
        this.logEntries.push(new LogEntry(text, textColor));
    }

    addDamageEntry(targetName: string, attackerName: string, damage: string, finalDamage = '', resImmVulMessage = '') {

        this.logEntries.push({
            text: targetName + ' takes ' + damage + ' ' +
            (resImmVulMessage !== '' ? ' (' + finalDamage + ') ' : '') +
            'damage from ' + attackerName +
            ' ' + resImmVulMessage,
            textColor: LogEntry.COLOR_RED
        });
    }

    addSavingThrowEntry(name: string, savingThrow: string, difficultyClass: string, made: boolean, retry = false) {
        this.logEntries.push({
            text: name + (retry ? ' retries! ' : ' try to save with ') + savingThrow + ' against ' + difficultyClass + ' ' +
            (made ? '*SUCCEDED*' : '*FAILED*'),
            textColor: LogEntry.COLOR_RED
        });
    }

}
