import { useState } from 'react';
import { Sheet } from '@common/components/Sheet/Sheet';
import { Button } from '@common/components/Button/Button';
import { ChoiceRow } from '@common/components/ChoiceRow/ChoiceRow';
import { useAddStepMutation } from '../../api/useAddStepMutation';
import type { Player, RoleSummary } from '../../types/game.types';
import type { ActionKind } from '../../types/night.types';
import { getActionHint } from '../../utils/night.utils';
import { PlayerPicker } from '../PlayerPicker/PlayerPicker';
import { RolePicker } from '../RolePicker/RolePicker';
import styles from './AddStepSheet.module.scss';

const KINDS: { kind: ActionKind; label: string }[] = [
  { kind: 'ChooseOnePlayer', label: 'Choisir un joueur' },
  { kind: 'ChooseTwoPlayers', label: 'Choisir deux joueurs' },
  { kind: 'ChooseRole', label: 'Choisir un rôle' },
  { kind: 'Confirm', label: 'Recevoir une information' },
];

interface AddStepSheetProps {
  gameId: string;
  players: Player[];
  roles: RoleSummary[];
  onClose: () => void;
}

/**
 * Le conteur ajoute une étape à la nuit en cours : qui réveiller, au titre de quel rôle
 * (facultatif) et ce que le joueur fait. L'étape se place après les étapes restantes.
 * Cas imprévus : le Sbire devenu Diable à informer, un second réveil, une capacité oubliée.
 */
export const AddStepSheet = ({ gameId, players, roles, onClose }: AddStepSheetProps) => {
  const [actorId, setActorId] = useState<string>();
  const [kind, setKind] = useState<ActionKind>('Confirm');
  const [roleId, setRoleId] = useState<string | null>(null);
  const { mutateAsync: addStep, isPending } = useAddStepMutation();

  const confirm = async () => {
    if (!actorId) return;
    try {
      await addStep({ gameId, actorId, roleId, actionKind: kind });
      onClose();
    } catch {
      // Toast affiché par la mutation
    }
  };

  return (
    <Sheet
      open
      title="Ajouter une étape"
      description="Elle se place après les étapes restantes de cette nuit."
      onClose={onClose}
      footer={
        <>
          <Button disabled={!actorId} isLoading={isPending} onClick={() => void confirm()}>
            {actorId
              ? `Ajouter : réveiller ${players.find((p) => p.id === actorId)?.pseudo}`
              : 'Choisissez un joueur'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
        </>
      }
    >
      <span className={styles.label}>Qui réveiller</span>
      <PlayerPicker
        players={players}
        selected={actorId ? [actorId] : []}
        max={1}
        onChange={([id]) => setActorId(id)}
        label="Joueur à réveiller"
      />

      <span className={styles.label}>Ce qu'il fait</span>
      <div role="radiogroup" aria-label="Ce qu'il fait" className={styles.kinds}>
        {KINDS.map((item) => (
          <ChoiceRow
            key={item.kind}
            title={item.label}
            description={getActionHint(item.kind)}
            selected={kind === item.kind}
            onClick={() => setKind(item.kind)}
          />
        ))}
      </div>

      <span className={styles.label}>Au titre du rôle (facultatif)</span>
      <RolePicker
        roles={roles}
        selected={roleId ? [roleId] : []}
        max={1}
        onChange={([id]) => setRoleId(id ?? null)}
        label="Rôle de l'étape"
      />
    </Sheet>
  );
};
