import { useState } from 'react';
import { Sheet } from '@common/components/Sheet/Sheet';
import { Button } from '@common/components/Button/Button';
import type { Player } from '../../types/game.types';
import { PlayerPicker } from '../PlayerPicker/PlayerPicker';

interface EndNightSheetProps {
  players: Player[];
  // Étapes encore ouvertes : elles seront passées
  openSteps: number;
  // Morts calculés par la nuit automatique : cochés d'avance
  proposedDeaths?: string[];
  // Toutes les étapes sont traitées
  resolved: boolean;
  // Joueurs dont on attend encore le choix
  waitingCount: number;
  isLoading: boolean;
  onConfirm: (deaths: string[]) => void;
  onClose: () => void;
}

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;

// Écran 10c : le conteur désigne les morts de la nuit, puis lève le jour
export const EndNightSheet = ({
  players,
  openSteps,
  proposedDeaths = [],
  resolved,
  waitingCount,
  isLoading,
  onConfirm,
  onClose,
}: EndNightSheetProps) => {
  // Choix du conteur. Tant qu'il n'a rien touché, la sélection suit les morts calculés, qui
  // peuvent arriver ou changer pendant que la fiche est ouverte (réponse tardive, annulation).
  const [edited, setEdited] = useState<string[]>();
  const alive = players.filter((p) => p.is_alive);
  const deaths = (edited ?? proposedDeaths).filter((id) => alive.some((p) => p.id === id));

  const lines = [
    proposedDeaths.length > 0
      ? 'Les morts calculés par la nuit sont cochés ; corrigez si besoin.'
      : 'Touchez les joueurs morts cette nuit.',
    'Vous les annoncez à voix haute.',
  ];
  if (!resolved && waitingCount > 0) {
    lines.push(
      `La nuit n'est pas finie : ${plural(waitingCount, 'joueur')} n'a pas encore répondu, son choix sera ignoré.`
    );
  }
  if (openSteps > 0) {
    lines.push(
      openSteps === 1
        ? '1 étape non traitée sera passée.'
        : `${openSteps} étapes non traitées seront passées.`
    );
  }

  return (
    <Sheet
      open
      title="Terminer la nuit ?"
      description={lines.join(' ')}
      onClose={onClose}
      footer={
        <>
          <Button isLoading={isLoading} onClick={() => onConfirm(deaths)}>
            {deaths.length === 0
              ? 'Lever le jour sans mort'
              : `Lever le jour · ${plural(deaths.length, 'mort')}`}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
        </>
      }
    >
      <PlayerPicker
        players={alive}
        selected={deaths}
        max={alive.length}
        onChange={setEdited}
        label="Morts de la nuit"
      />
    </Sheet>
  );
};
