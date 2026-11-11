import styles from './Dial.module.scss';
import { cx } from '@/utils/className.utils';

export interface DialProps {
  // Angle de l'aiguille en degrés (270 = avant la partie, 150 = jour…)
  angle?: number;
  size?: 'default' | 'xl';
  // L'aiguille tourne en continu (écran de chargement)
  spinning?: boolean;
  className?: string;
}

// Petit cadran d'horloge : signature visuelle du bandeau de phase
export const Dial = ({ angle = 270, size = 'default', spinning = false, className }: DialProps) => (
  <i
    className={cx(styles.dial, size === 'xl' && styles.xl, spinning && styles.spinning, className)}
    style={{ '--angle': `${angle}deg` } as React.CSSProperties}
    aria-hidden="true"
  />
);
