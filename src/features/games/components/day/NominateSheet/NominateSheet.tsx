import { useState } from 'react';
import { Sheet } from '@common/components/Sheet/Sheet';
import { Button } from '@common/components/Button/Button';
import { CheckboxRow } from '@common/components/CheckboxRow/CheckboxRow';
import type { Player } from '@games/types/game.types';
import type { Day } from '@games/types/day.types';
import { getNominationsUsed, playerName } from '@games/utils/day.utils';
import { PlayerPicker } from '@games/components/shared/PlayerPicker/PlayerPicker';

interface NominateSheetProps {
  players: Player[];
  day: Day | undefined;
  isLoading: boolean;
  onConfirm: (nominatorId: string, nomineeId: string, suppressAbilities: boolean) => void;
  onClose: () => void;
}

/**
 * Écran 15b : qui nomme, puis qui est nommé, comme annoncé à voix haute.
 * Seuls les choix permis sont proposés : un vivant qui n'a pas encore nommé, un joueur pas
 * encore nommé aujourd'hui.
 */
export const NominateSheet = ({
  players,
  day,
  isLoading,
  onConfirm,
  onClose,
}: NominateSheetProps) => {
  const [nominator, setNominator] = useState<string>();
  const [nominee, setNominee] = useState<string>();
  const [suppressed, setSuppressed] = useState(false);
  const used = getNominationsUsed(day);

  const nominators = players.filter((p) => p.is_alive && !used.nominators.has(p.id));
  const nominees = players.filter((p) => !used.nominees.has(p.id));

  if (!nominator) {
    return (
      <Sheet
        open
        title="Qui nomme ?"
        description="Un vivant qui n'a pas encore nommé aujourd'hui."
        onClose={onClose}
        footer={
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
        }
      >
        <PlayerPicker
          players={nominators}
          selected={[]}
          max={1}
          onChange={([id]) => setNominator(id)}
          label="Joueur qui nomme"
        />
      </Sheet>
    );
  }

  return (
    <Sheet
      open
      title={`${playerName(players, nominator)} nomme…`}
      description="Choisissez la personne nommée."
      onClose={onClose}
      footer={
        <>
          <CheckboxRow
            label="Capacités neutralisées"
            hint="Vierge empoisonnée : la nomination ne déclenche rien automatiquement."
            checked={suppressed}
            onChange={setSuppressed}
          />
          <Button
            disabled={!nominee}
            isLoading={isLoading}
            onClick={() => nominee && onConfirm(nominator, nominee, suppressed)}
          >
            {nominee ? `Nommer ${playerName(players, nominee)}` : 'Nommer'}
          </Button>
          <Button variant="secondary" onClick={() => setNominator(undefined)}>
            Changer qui nomme
          </Button>
        </>
      }
    >
      <PlayerPicker
        players={nominees}
        selected={nominee ? [nominee] : []}
        max={1}
        onChange={([id]) => setNominee(id)}
        label="Joueur nommé"
      />
    </Sheet>
  );
};
