import styles from './Button.module.scss';
import { cx } from '@/utils/className.utils';
import { Spinner } from '../Spinner/Spinner';

export interface ButtonProps extends React.ComponentProps<'button'> {
  // primary : laiton plein · secondary : contour laiton · danger : aplat sang · ghost : texte laiton
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  // xl : action principale côté joueur (72 px, dans le tiers bas de l'écran)
  size?: 'default' | 'xl';
  leadingIcon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'default',
  leadingIcon,
  isLoading = false,
  fullWidth = true,
  disabled,
  className,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cx(
      styles.button,
      styles[variant],
      size === 'xl' && styles.xl,
      fullWidth && styles.full_width,
      className
    )}
    disabled={disabled || isLoading}
    aria-busy={isLoading || undefined}
    {...props}
  >
    {isLoading ? <Spinner /> : leadingIcon}
    {children}
  </button>
);
