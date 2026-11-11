import styles from './Screen.module.scss';
import { cx } from '@/utils/className.utils';

export interface ScreenProps {
  // Bandeau du haut (PhaseBar)
  header: React.ReactNode;
  // Actions du bas, à portée de pouce
  footer?: React.ReactNode;
  // Contenu centré verticalement et horizontalement
  centered?: boolean;
  // Rend le corps et le pied dans un <form>
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  bodyClassName?: string;
  children: React.ReactNode;
}

// Gabarit d'un écran mobile : bandeau, corps défilant, pied fixe
export const Screen = ({
  header,
  footer,
  centered = false,
  onSubmit,
  bodyClassName,
  children,
}: ScreenProps) => {
  const content = (
    <>
      <main className={cx(styles.body, centered && styles.centered, bodyClassName)}>
        {children}
      </main>
      {footer && <div className={styles.footer}>{footer}</div>}
    </>
  );

  return (
    <div className={styles.screen}>
      {header}
      {onSubmit ? (
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          {content}
        </form>
      ) : (
        content
      )}
    </div>
  );
};
