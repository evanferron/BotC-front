import styles from './Loading.module.scss';
import { Dial } from '../Dial/Dial';

export interface LoadingProps {
  label?: string;
}

// Écran d'attente plein : grand cadran dont l'aiguille balaie
export const Loading = ({ label = 'Chargement…' }: LoadingProps) => (
  <div className={styles.loading} role="status">
    <Dial size="xl" spinning />
    <p className={styles.label}>{label}</p>
  </div>
);
