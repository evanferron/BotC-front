import { Pill } from '@/components/Pill/Pill';
import { cx } from '@/utils/className.utils';
import type { NightStep } from '../../types/night.types';
import {
  getStepStatusLabel,
  getStepTitle,
  isOpenStatus,
  isTeamInfoStep,
} from '../../utils/night.utils';
import styles from './NightStepList.module.scss';

interface NightStepListProps {
  steps: NightStep[];
  currentId?: string;
}

const getWho = (step: NightStep) => {
  if (step.actor) return step.actor.pseudo;
  return isTeamInfoStep(step) ? 'Équipe du mal' : 'Aucun joueur';
};

// Ordre de nuit (écran 10a) : étapes faites, en cours, à venir
export const NightStepList = ({ steps, currentId }: NightStepListProps) => (
  <ol className={styles.list} aria-label="Ordre de nuit">
    {steps.map((step) => {
      const isCurrent = step.id === currentId;
      const isDone = !isOpenStatus(step.status);
      return (
        <li
          key={step.id}
          className={cx(styles.row, isCurrent && styles.current, isDone && styles.done)}
          aria-current={isCurrent ? 'step' : undefined}
        >
          <span className={styles.number}>{step.step_order}</span>
          <span className={styles.name}>
            {getStepTitle(step)}
            <small>{getWho(step)}</small>
          </span>
          <Pill tone={isCurrent || isDone ? 'highlight' : 'default'}>
            {isCurrent && step.status === 'Pending' ? 'En cours' : getStepStatusLabel(step.status)}
          </Pill>
        </li>
      );
    })}
  </ol>
);
