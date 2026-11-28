import { useEffect, useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import { Pill } from '@common/components/Pill/Pill';
import { HAPTICS, vibrate } from '@common/utils/haptics.utils';
import { cx } from '@common/utils/className.utils';
import { TYPE_ICONS } from '../../constants/ROLE_ICONS';
import type { PinnedRole } from '../../types/script.types';
import { getTypeTeam } from '../../utils/role.utils';
import { TeamBadge } from '../RoleBadge/RoleBadge';
import styles from './PinnedRoleRow.module.scss';

// Durée d'appui avant la révélation : un simple effleurement ne montre rien au voisin
const HOLD_DELAY = 350;

interface PinnedRoleRowProps {
  role: PinnedRole;
}

/**
 * Rôle du joueur épinglé en haut de la liste (écrans R1 et R2). Masqué par défaut, il ne
 * s'affiche que pendant l'appui long : la surbrillance n'apparaît jamais au repos.
 */
export const PinnedRoleRow = ({ role }: PinnedRoleRowProps) => {
  const [revealed, setRevealed] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const clear = () => window.clearTimeout(timerRef.current);
  useEffect(() => clear, []);

  const start = () => {
    clear();
    timerRef.current = window.setTimeout(() => {
      setRevealed(true);
      vibrate(HAPTICS.reveal);
    }, HOLD_DELAY);
  };
  const stop = () => {
    clear();
    setRevealed(false);
  };

  const Icon = TYPE_ICONS[role.character_type];

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={cx(styles.row, revealed ? styles.revealed : styles.masked)}
        aria-label={
          revealed
            ? `Votre rôle : ${role.name}`
            : 'Votre rôle, masqué. Maintenir appuyé pour le révéler.'
        }
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onKeyDown={(event) => {
          if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
            event.preventDefault();
            start();
          }
        }}
        onKeyUp={stop}
        onBlur={stop}
        onContextMenu={(event) => event.preventDefault()}
      >
        <span className={styles.medal} aria-hidden="true">
          {revealed ? <Icon /> : <Eye />}
        </span>
        <span className={styles.name}>{revealed ? role.name : '•••••'}</span>
        {revealed ? <TeamBadge team={getTypeTeam(role.character_type)} /> : <Pill>Maintenir</Pill>}
      </button>
      {revealed && <p className={styles.hint}>Relâchez pour masquer</p>}
    </div>
  );
};
