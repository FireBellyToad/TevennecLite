import { GameEntity } from 'app/game.entities/gameentity';
import { DamageRoll } from 'app/game.utils/damageroll';
import { Logger } from 'app/game.services/logger';

export interface Castable {

    name: string
    slotExpendend: number;
    spellLevel: number;
    isMonsterSpell: boolean;
    cast: ( targets: GameEntity[], caster: GameEntity )  => void;

}
