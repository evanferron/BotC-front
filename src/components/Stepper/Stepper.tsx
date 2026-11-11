import { Minus, Plus } from 'lucide-react';
import styles from './Stepper.module.scss';
import { Button } from '../Button/Button';

export interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  // Libellé sous le nombre (« joueurs, de 5 à 15 »)
  caption?: string;
  // Nom de la valeur pour les boutons (« joueur » → « Un joueur de moins »)
  unitLabel: string;
}

// Grand compteur avec boutons moins / plus
export const Stepper = ({ value, min, max, onChange, caption, unitLabel }: StepperProps) => (
  <div className={styles.stepper}>
    <Button
      variant="secondary"
      fullWidth={false}
      className={styles.button}
      aria-label={`Un ${unitLabel} de moins`}
      disabled={value <= min}
      onClick={() => onChange(Math.max(min, value - 1))}
    >
      <Minus aria-hidden="true" />
    </Button>
    <div className={styles.value} aria-live="polite">
      <span className={styles.number}>{value}</span>
      {caption && <span className={styles.caption}>{caption}</span>}
    </div>
    <Button
      variant="secondary"
      fullWidth={false}
      className={styles.button}
      aria-label={`Un ${unitLabel} de plus`}
      disabled={value >= max}
      onClick={() => onChange(Math.min(max, value + 1))}
    >
      <Plus aria-hidden="true" />
    </Button>
  </div>
);
