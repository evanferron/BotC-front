import { cx } from '@common/utils/className.utils';
import type { GrimoirePlayer } from '../../types/grimoire.types';
import styles from './GrimoireCircle.module.scss';

interface GrimoireCircleProps {
  // Dans l'ordre de la table : le premier est placé en haut, puis dans le sens horaire
  players: GrimoirePlayer[];
  onSelect: (player: GrimoirePlayer) => void;
}

// Position sur l'ellipse, en pourcentage du cadre : place 1 en haut, sens des aiguilles d'une montre
const seatPosition = (index: number, count: number) => {
  const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
  return { left: `${50 + Math.cos(angle) * 39}%`, top: `${50 + Math.sin(angle) * 40}%` };
};

/**
 * Grimoire, vue cercle (design/C4-Grimoire 13b) : les joueurs posés comme autour de la table, le
 * nombre de vivants et de morts au centre. Un appui ouvre la fiche de correction.
 */
export const GrimoireCircle = ({ players, onSelect }: GrimoireCircleProps) => {
  const alive = players.filter((p) => p.is_alive).length;
  const dead = players.length - alive;

  return (
    <div className={styles.table}>
      <ol className={styles.ring} aria-label="Table, dans le sens des aiguilles d'une montre">
        {players.map((player, index) => (
          <li key={player.id} className={styles.seat} style={seatPosition(index, players.length)}>
            <button
              type="button"
              className={cx(
                styles.token,
                !player.is_alive && styles.dead,
                player.alignment === 'Evil' && styles.evil
              )}
              aria-label={`${player.pseudo}, ${player.role?.name ?? 'sans rôle'}, ${
                player.is_alive ? 'en vie' : 'mort'
              }`}
              onClick={() => onSelect(player)}
            >
              <span className={styles.disc} aria-hidden="true">
                {player.pseudo.trim().charAt(0).toUpperCase()}
              </span>
              <span className={styles.name}>{player.pseudo}</span>
              <span className={styles.role}>{player.role?.name ?? '—'}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className={styles.center}>
        {alive} en vie
        <br />
        {dead} {dead > 1 ? 'morts' : 'mort'}
      </p>
    </div>
  );
};
