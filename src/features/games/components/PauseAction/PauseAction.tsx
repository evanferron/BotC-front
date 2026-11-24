import { useState } from 'react';
import { Pause } from 'lucide-react';
import { PhaseBarAction } from '@common/components/PhaseBar/PhaseBar';
import { ConfirmSheet } from '@common/components/ConfirmSheet/ConfirmSheet';
import { usePauseMutation } from '../../api/useTableMutations';
import type { Game } from '../../types/game.types';

/**
 * Icône « Pause » du bandeau conteur (design/C7 23d). Confirmation, puis plus rien n'avance
 * jusqu'à la reprise ; les joueurs voient « Partie en pause ».
 */
export const PauseAction = ({ game }: { game: Game }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: pause, isPending } = usePauseMutation();

  const confirm = async () => {
    try {
      await pause(game.id);
      setIsOpen(false);
    } catch {
      // Toast affiché par la mutation
    }
  };

  return (
    <>
      <PhaseBarAction aria-label="Mettre en pause" onClick={() => setIsOpen(true)}>
        <Pause aria-hidden="true" />
      </PhaseBarAction>
      <ConfirmSheet
        open={isOpen}
        title="Mettre la partie en pause ?"
        description="Les joueurs voient « Partie en pause ». Rien n'avance tant que vous n'avez pas repris. Les rôles restent masqués."
        confirmLabel="Mettre en pause"
        tone="primary"
        isLoading={isPending}
        onConfirm={() => void confirm()}
        onCancel={() => setIsOpen(false)}
      />
    </>
  );
};
