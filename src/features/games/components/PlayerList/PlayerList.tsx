import { Check, UserX } from 'lucide-react';
import { PlayerDisc } from '@/components/PlayerDisc/PlayerDisc';
import { Pill } from '@/components/Pill/Pill';
import type { Player } from '../../types/game.types';
import styles from './PlayerList.module.scss';

interface PlayerListProps {
  players: Player[];
  // Pseudo du conteur, affiché en tête (absent pendant son chargement)
  storytellerPseudo?: string;
  // Compte connecté, signalé par « Vous »
  currentUserId?: string;
  // Places prévues : affiche une ligne « n places libres »
  maxPlayers: number;
  // Fourni au conteur : bouton d'exclusion sur chaque joueur
  onKick?: (player: Player) => void;
}

// Liste des présents à la table (écrans 05a et 06a)
export const PlayerList = ({
  players,
  storytellerPseudo,
  currentUserId,
  maxPlayers,
  onKick,
}: PlayerListProps) => {
  const freeSeats = Math.max(0, maxPlayers - players.length);

  return (
    <ul className={styles.list} aria-label="Joueurs à la table">
      {storytellerPseudo && (
        <li className={styles.row}>
          <PlayerDisc name={storytellerPseudo} />
          <span className={styles.name}>
            {storytellerPseudo}
            <small>Conteur</small>
          </span>
        </li>
      )}

      {players.map((player) => {
        const isMe = player.user_id === currentUserId;
        return (
          <li key={player.id} className={styles.row}>
            <PlayerDisc name={player.pseudo} />
            <span className={styles.name}>
              {player.pseudo}
              {isMe && <small>Vous</small>}
            </span>
            {onKick ? (
              <button
                type="button"
                className={styles.kick}
                aria-label={`Exclure ${player.pseudo}`}
                onClick={() => onKick(player)}
              >
                <UserX aria-hidden="true" />
              </button>
            ) : (
              <Pill tone="highlight" icon={<Check aria-hidden="true" />}>
                Présent
              </Pill>
            )}
          </li>
        );
      })}

      {freeSeats > 0 && (
        <li className={`${styles.row} ${styles.free}`}>
          <PlayerDisc empty />
          <span className={styles.name}>
            {freeSeats} place{freeSeats > 1 ? 's' : ''} libre{freeSeats > 1 ? 's' : ''}
          </span>
        </li>
      )}
    </ul>
  );
};
