import styles from './Spinner.module.scss';

// Petite aiguille qui tourne : indicateur de chargement en ligne (bouton, champ)
export const Spinner = () => <span className={styles.spinner} aria-hidden="true" />;
