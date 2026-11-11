import { Check } from 'lucide-react';
import { PlayerDisc } from '@/components/PlayerDisc/PlayerDisc';
import { Pill } from '@/components/Pill/Pill';
import { cx } from '@/utils/className.utils';
import type { GameCardInfo, Player } from '../../types/game.types';
import styles from './DistributionList.module.scss';

interface DistributionListProps {
  players: Player[];
  cards: GameCardInfo[];
  currentPickerId: string | null;
  // Compte connecté, signalé par « Vous »
  currentUserId?: string;
  // Conteur : affiche le rôle sous chaque joueur qui a choisi
  showRoles?: boolean;
}

// Rôle affiché au conteur : « Ivrogne · se croit Moine » quand le rôle vu diffère
const formatRole = (card: GameCardInfo | undefined) => {
  if (!card?.role) return undefined;
  return card.shown_role ? `${card.role.name} · se croit ${card.shown_role.name}` : card.role.name;
};

const PickState = ({ hasPicked, isPicking }: { hasPicked: boolean; isPicking: boolean }) => {
  if (hasPicked) {
    return (
      <Pill tone="highlight" icon={<Check aria-hidden="true" />}>
        A choisi
      </Pill>
    );
  }
  if (isPicking) return <Pill tone="highlight">Choisit…</Pill>;
  return <Pill>En attente</Pill>;
};

// Suivi de la distribution (écrans 07c et 09a) : qui a choisi, qui choisit, qui attend
export const DistributionList = ({
  players,
  cards,
  currentPickerId,
  currentUserId,
  showRoles = false,
}: DistributionListProps) => {
  // Places autour de la table, attribuées au lancement
  const sorted = [...players].sort(
    (a, b) => (a.seat_position ?? Infinity) - (b.seat_position ?? Infinity)
  );

  return (
    <ul className={styles.list} aria-label="Ordre de la distribution">
      {sorted.map((player) => {
        const card = cards.find((c) => c.picked_by === player.id);
        const isPicking = player.id === currentPickerId;
        const role = showRoles ? formatRole(card) : undefined;
        return (
          <li key={player.id} className={cx(styles.row, !card && !isPicking && styles.waiting)}>
            <PlayerDisc name={player.pseudo} size="small" />
            <span className={styles.name}>
              {player.pseudo}
              {player.user_id === currentUserId && <small>Vous</small>}
              {showRoles && <small>{role ?? 'Rôle à venir'}</small>}
            </span>
            <PickState hasPicked={!!card} isPicking={isPicking} />
          </li>
        );
      })}
    </ul>
  );
};
