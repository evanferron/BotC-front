import styles from './CheckboxRow.module.scss';

export interface CheckboxRowProps {
  label: string;
  // Conséquence de l'option, en une phrase
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

// Case à cocher avec libellé et aide (options d'une feuille de confirmation)
export const CheckboxRow = ({ label, hint, checked, onChange }: CheckboxRowProps) => (
  <label className={styles.row}>
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    <span className={styles.text}>
      {label}
      {hint && <small>{hint}</small>}
    </span>
  </label>
);
