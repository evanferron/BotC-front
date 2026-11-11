import { useState } from 'react';
import { Sheet } from '@/components/Sheet/Sheet';
import { Button } from '@/components/Button/Button';
import type { Player, RoleSummary } from '../../types/game.types';
import type { NightStep, StepChoice } from '../../types/night.types';
import { getChoiceShape, isChoiceComplete, toStepChoice } from '../../utils/night.utils';
import { PlayerPicker } from '../PlayerPicker/PlayerPicker';
import { RolePicker } from '../RolePicker/RolePicker';

interface StepChoiceSheetProps {
  step: NightStep;
  players: Player[];
  roles: RoleSummary[];
  // Nom du choix d'origine, rappelé quand le conteur le modifie
  originalLabel?: string;
  isLoading: boolean;
  onApply: (choice: StepChoice) => void;
  onClose: () => void;
}

const TITLES: Record<string, string> = {
  ChooseOnePlayer: 'Quel joueur ?',
  ChooseTwoPlayers: 'Quels deux joueurs ?',
  ChooseRole: 'Quel rôle ?',
};

// Écran 12c : le conteur modifie le choix, ou choisit à la place du joueur. Le joueur n'est pas prévenu.
export const StepChoiceSheet = ({
  step,
  players,
  roles,
  originalLabel,
  isLoading,
  onApply,
  onClose,
}: StepChoiceSheetProps) => {
  const [playerIds, setPlayerIds] = useState<string[]>([]);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const shape = getChoiceShape(step.action_kind);
  const complete = isChoiceComplete(step.action_kind, playerIds, roleIds);

  return (
    <Sheet
      open
      title={TITLES[step.action_kind] ?? 'Valider sans attendre ?'}
      description={
        originalLabel
          ? `Choix d'origine : ${originalLabel}. Le joueur n'est pas prévenu.`
          : 'Le joueur ne sera plus sollicité.'
      }
      onClose={onClose}
      footer={
        <>
          <Button
            disabled={!complete}
            isLoading={isLoading}
            onClick={() => onApply(toStepChoice(playerIds, roleIds))}
          >
            Appliquer ce choix
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Retour
          </Button>
        </>
      }
    >
      {shape.players > 0 && (
        <PlayerPicker
          players={players}
          selected={playerIds}
          max={shape.players}
          onChange={setPlayerIds}
          label="Joueurs"
        />
      )}
      {shape.roles > 0 && (
        <RolePicker
          roles={roles}
          selected={roleIds}
          max={shape.roles}
          onChange={setRoleIds}
          label="Rôles du script"
        />
      )}
    </Sheet>
  );
};
