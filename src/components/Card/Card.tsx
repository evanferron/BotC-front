import styles from './Card.module.scss';
import { cx } from '@/utils/className.utils';

export interface CardProps extends React.ComponentProps<'div'> {
  // Filet laiton (sélection, état valide) ou rouge (erreur)
  tone?: 'default' | 'accent' | 'danger';
  // Contenu en ligne (icône + texte) plutôt qu'en colonne
  row?: boolean;
}

// Panneau d'interface : surface, filet, rayon 16 px
export const Card = ({ tone = 'default', row = false, className, ...props }: CardProps) => (
  <div className={cx(styles.card, styles[tone], row && styles.row, className)} {...props} />
);
