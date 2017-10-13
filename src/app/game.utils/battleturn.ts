import { GameEntity } from 'app/game.entities/gameentity';
import { AuraEffect } from 'app/game.enums/auraeffects';

export interface BattleTurn {
    action: string
    spell: string
    quickSpell: string
    auraToRelease: string
    target: GameEntity
}
