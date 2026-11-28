import { useState } from 'react';
import { Button } from '@common/components/Button/Button';
import { Sheet } from '@common/components/Sheet/Sheet';
import type { Player } from '@games/types/game.types';
import { playerName } from '@games/utils/day.utils';
import { PlayerPicker } from '@games/components/shared/PlayerPicker/PlayerPicker';

interface SlaySheetProps {
  players: Player[];
  isLoading: boolean;
  onConfirm: (shooterId: string, targetId: string) => void;
  onClose: () => void;
}

/**
 * Un joueur annonce à voix haute « je pourfends X » : le conteur saisit qui tire et sur qui.
 * L'app décide en secret : seul le vrai Pourfendeur, en état d'agir et pas encore utilisé, tue le
 * Démon. Un bluff ou un tir raté ne fait rien, ce qui laisse n'importe qui tenter le coup.
 */
export const SlaySheet = ({ players, isLoading, onConfirm, onClose }: SlaySheetProps) => {
  const [shooter, setShooter] = useState<string>();
  const [target, setTarget] = useState<string>();
  const alive = players.filter((p) => p.is_alive);

  if (!shooter) {
    return (
      <Sheet
        open
        title="Qui pourfend ?"
        description="Le joueur qui vient de l'annoncer à voix haute, vrai Pourfendeur ou non."
        onClose={onClose}
        footer={
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
        }
      >
        <PlayerPicker
          players={alive}
          selected={[]}
          max={1}
          onChange={([id]) => setShooter(id)}
          label="Joueur qui pourfend"
        />
      </Sheet>
    );
  }

  return (
    <Sheet
      open
      title={`${playerName(players, shooter)} pourfend…`}
      description="Si la cible meurt, annoncez-le et la nuit tombe. Sinon, rien ne se passe."
      onClose={onClose}
      footer={
        <>
          <Button
            disabled={!target}
            isLoading={isLoading}
            onClick={() => target && onConfirm(shooter, target)}
          >
            {target ? `Pourfendre ${playerName(players, target)}` : 'Pourfendre'}
          </Button>
          <Button variant="secondary" onClick={() => setShooter(undefined)}>
            Changer qui pourfend
          </Button>
        </>
      }
    >
      <PlayerPicker
        players={alive.filter((p) => p.id !== shooter)}
        selected={target ? [target] : []}
        max={1}
        onChange={([id]) => setTarget(id)}
        label="Joueur visé"
      />
    </Sheet>
  );
};
