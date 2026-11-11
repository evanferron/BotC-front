import styles from './Pill.module.scss';
import { cx } from '@/utils/className.utils';

export interface PillProps {
  children: React.ReactNode;
  // highlight : laiton (en cours, présent) · default : discret
  tone?: 'default' | 'highlight';
  icon?: React.ReactNode;
}

// Petite étiquette d'état en capitales
export const Pill = ({ children, tone = 'default', icon }: PillProps) => (
  <span className={cx(styles.pill, tone === 'highlight' && styles.highlight)}>
    {icon}
    {children}
  </span>
);
