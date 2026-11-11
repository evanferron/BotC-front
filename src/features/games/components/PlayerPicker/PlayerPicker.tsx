import { Check } from 'lucide-react';
import { PlayerDisc } from '@/components/PlayerDisc/PlayerDisc';
import { cx } from '@/utils/className.utils';
import type { Player } from '../../types/game.types';
import { toggleSelection } from '../../utils/night.utils';
import styles from './PlayerPicker.module.scss';

interface PlayerPickerProps {
  players: Player[];
  selected: string[];
  // Nombre de joueurs à choisir : 1 remplace la sélection, plus coche et décoche
  max: number;
  onChange: (selected: string[]) => void;
  label: string;
  // Compte connecté, signalé par « Vous »
  currentUserId?: string;
}

// Liste de joueurs à toucher (gabarits 1 et 2 de la nuit, informations du conteur)
export const PlayerPicker = ({
  players,
  selected,
  max,
  onChange,
  label,
  currentUserId,
}: PlayerPickerProps) => {
  const sorted = [...players].sort(
    (a, b) => (a.seat_position ?? Infinity) - (b.seat_position ?? Infinity)
  );
  return (
    <div className={styles.list} role="group" aria-label={label}>
      {sorted.map((player) => {
        const isSelected = selected.includes(player.id);
        return (
          <button
            key={player.id}
            type="button"
            className={cx(styles.row, isSelected && styles.selected)}
            aria-pressed={isSelected}
            onClick={() => onChange(toggleSelection(selected, player.id, max))}
          >
            <PlayerDisc name={player.pseudo} size="small" dead={!player.is_alive} />
            <span className={styles.name}>
              {player.pseudo}
              {player.user_id === currentUserId && <small>Vous</small>}
              {!player.is_alive && <small>Mort</small>}
            </span>
            <span className={styles.indicator} aria-hidden="true">
              <Check />
            </span>
          </button>
        );
      })}
    </div>
  );
};
