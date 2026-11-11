import styles from './ProgressBar.module.scss';

export interface ProgressBarProps {
  value: number;
  max: number;
  // Nom accessible (« Joueurs présents »)
  label: string;
}

// Barre de progression fine, remplissage laiton
export const ProgressBar = ({ value, max, label }: ProgressBarProps) => {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <i className={styles.fill} style={{ width: `${percent}%` }} />
    </div>
  );
};
