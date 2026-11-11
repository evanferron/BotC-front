import styles from './PlayerDisc.module.scss';
import { cx } from '@/utils/className.utils';

export interface PlayerDiscProps {
  // Pseudo : seule son initiale est affichée
  name?: string;
  size?: 'small' | 'default' | 'large';
  // Place libre : pointillés, pas d'initiale
  empty?: boolean;
  dead?: boolean;
}

// Pastille ronde d'un joueur, filet laiton (design/Jetons.dc.html)
export const PlayerDisc = ({
  name,
  size = 'default',
  empty = false,
  dead = false,
}: PlayerDiscProps) => (
  <span
    className={cx(styles.disc, styles[size], empty && styles.empty, dead && styles.dead)}
    aria-hidden="true"
  >
    {empty ? '·' : (name?.trim().charAt(0).toUpperCase() ?? '?')}
  </span>
);
