import styles from './PhaseBar.module.scss';
import { cx } from '@/utils/className.utils';
import { Dial } from '../Dial/Dial';

// Ambiance du bandeau : avant la partie, nuit, jour, vote, fin
export type PhaseVariant = 'lobby' | 'night' | 'day' | 'vote' | 'end';

// Position de l'aiguille du cadran selon la phase
const DIAL_ANGLE: Record<PhaseVariant, number> = {
  lobby: 270,
  night: 0,
  day: 150,
  vote: 210,
  end: 330,
};

export interface PhaseBarProps {
  title: string;
  variant?: PhaseVariant;
  // Étiquette de phase (« Lobby », « Jour 2 »…)
  tag?: string;
  // Texte discret à droite (« 1 / 2 », « 5 / 10 »)
  meta?: string;
  // Boutons d'action carrés (voir PhaseBarAction)
  actions?: React.ReactNode;
}

// Bandeau du haut de chaque écran : cadran, titre, phase et actions
export const PhaseBar = ({ title, variant = 'lobby', tag, meta, actions }: PhaseBarProps) => (
  <header className={cx(styles.bar, styles[variant])}>
    <Dial angle={DIAL_ANGLE[variant]} />
    <h1 className={styles.title}>{title}</h1>
    {meta && <span className={styles.meta}>{meta}</span>}
    {tag && <span className={styles.tag}>{tag}</span>}
    {actions}
  </header>
);

interface PhaseBarActionProps extends React.ComponentProps<'button'> {
  'aria-label': string;
}

// Bouton icône 44 px du bandeau
export const PhaseBarAction = ({ className, children, ...props }: PhaseBarActionProps) => (
  <button type="button" className={cx(styles.action, className)} {...props}>
    {children}
  </button>
);
