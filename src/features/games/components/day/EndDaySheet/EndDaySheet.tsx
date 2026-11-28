import { useState } from 'react';
import { Sheet } from '@common/components/Sheet/Sheet';
import { Button } from '@common/components/Button/Button';
import { CheckboxRow } from '@common/components/CheckboxRow/CheckboxRow';
import type { Player } from '@games/types/game.types';
import type { Day } from '@games/types/day.types';
import { playerName } from '@games/utils/day.utils';

interface EndDaySheetProps {
  day: Day;
  players: Player[];
  isLoading: boolean;
  onConfirm: (execute: boolean, suppressAbilities: boolean) => void;
  onClose: () => void;
}

/**
 * Écrans 16b et 17 : fin du jour. Le joueur sur l'échafaud est exécuté, puis la nuit tombe.
 * À trois vivants sans exécution, le Maire fait gagner son équipe (appliqué par le serveur).
 */
export const EndDaySheet = ({ day, players, isLoading, onConfirm, onClose }: EndDaySheetProps) => {
  const [suppressed, setSuppressed] = useState(false);
  const block = day.on_the_block;
  const name = playerName(players, block);
  // Le Maire ne compte que s'il n'y a pas d'exécution et qu'il reste trois vivants
  const mayorMatters = day.alive_count === 3;

  const mayorOption = mayorMatters && (
    <CheckboxRow
      label="Capacités neutralisées"
      hint="Maire empoisonné : pas de victoire automatique sans exécution."
      checked={suppressed}
      onChange={setSuppressed}
    />
  );

  return (
    <Sheet
      open
      title="Terminer le jour ?"
      description={
        block
          ? `${name} est sur l'échafaud : il sera exécuté, puis la nuit tombe.`
          : "Personne n'est sur l'échafaud : aucune exécution, la nuit tombe."
      }
      onClose={onClose}
      footer={
        <>
          {mayorOption}
          {block ? (
            <>
              <Button
                variant="danger"
                isLoading={isLoading}
                onClick={() => onConfirm(true, suppressed)}
              >
                Exécuter {name}
              </Button>
              <Button
                variant="secondary"
                disabled={isLoading}
                onClick={() => onConfirm(false, suppressed)}
              >
                Ne pas exécuter
              </Button>
            </>
          ) : (
            <Button isLoading={isLoading} onClick={() => onConfirm(false, suppressed)}>
              Faire tomber la nuit
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Rester au jour
          </Button>
        </>
      }
    />
  );
};
