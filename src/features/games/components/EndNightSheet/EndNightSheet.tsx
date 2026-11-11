import { useState } from 'react';
import { Sheet } from '@/components/Sheet/Sheet';
import { Button } from '@/components/Button/Button';
import type { Player } from '../../types/game.types';
import { PlayerPicker } from '../PlayerPicker/PlayerPicker';

interface EndNightSheetProps {
  players: Player[];
  // Étapes encore ouvertes : elles seront passées
  openSteps: number;
  isLoading: boolean;
  onConfirm: (deaths: string[]) => void;
  onClose: () => void;
}

// Écran 10c : le conteur désigne les morts de la nuit, puis lève le jour
export const EndNightSheet = ({
  players,
  openSteps,
  isLoading,
  onConfirm,
  onClose,
}: EndNightSheetProps) => {
  const [deaths, setDeaths] = useState<string[]>([]);
  const alive = players.filter((p) => p.is_alive);
  let remaining = '';
  if (openSteps === 1) remaining = ' 1 étape non traitée sera passée.';
  if (openSteps > 1) remaining = ` ${openSteps} étapes non traitées seront passées.`;

  return (
    <Sheet
      open
      title="Terminer la nuit ?"
      description={`Touchez les joueurs morts cette nuit. Vous les annoncez à voix haute.${remaining}`}
      onClose={onClose}
      footer={
        <>
          <Button isLoading={isLoading} onClick={() => onConfirm(deaths)}>
            {deaths.length === 0
              ? 'Lever le jour sans mort'
              : `Lever le jour · ${deaths.length} mort${deaths.length > 1 ? 's' : ''}`}
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
        onChange={setDeaths}
        label="Morts de la nuit"
      />
    </Sheet>
  );
};
