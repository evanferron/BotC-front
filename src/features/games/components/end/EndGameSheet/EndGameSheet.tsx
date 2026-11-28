import { useState } from 'react';
import { Sheet } from '@common/components/Sheet/Sheet';
import { Button } from '@common/components/Button/Button';
import { Segmented } from '@common/components/Segmented/Segmented';
import { getTeamLabel } from '@scripts/utils/role.utils';
import type { Alignment, Game } from '@games/types/game.types';
import { useEndGameMutation } from '@games/api/end.api';
import styles from './EndGameSheet.module.scss';

const REASON_MAX = 200;

// Raisons courantes, à toucher plutôt qu'à taper
const REASONS = [
  'Le Démon a été exécuté.',
  'Le Démon est mort.',
  'Il ne reste que deux joueurs en vie.',
  'Le Saint a été exécuté.',
];

interface EndGameSheetProps {
  game: Game;
  onClose: () => void;
}

/**
 * Le conteur déclare la fin : camp vainqueur et raison annoncée (design/C6-Fin). Sur une partie
 * déjà terminée, la même feuille change le camp (« Corrigeable tant que la table est ouverte »).
 */
export const EndGameSheet = ({ game, onClose }: EndGameSheetProps) => {
  const isEnded = game.status === 'Ended';
  const [winner, setWinner] = useState<Alignment>(game.winner ?? 'Good');
  const [reason, setReason] = useState(game.end_reason ?? '');
  const { mutateAsync: endGame, isPending } = useEndGameMutation();

  const confirm = async () => {
    try {
      await endGame({ gameId: game.id, winner, reason: reason.trim() || null });
      onClose();
    } catch {
      // Toast affiché par la mutation
    }
  };

  return (
    <Sheet
      open
      title={isEnded ? 'Changer le résultat' : 'Terminer la partie ?'}
      description={
        isEnded
          ? 'Tous les écrans affichent aussitôt le nouveau résultat.'
          : 'Tous les écrans passent à la fin de partie et les rôles sont révélés à tous.'
      }
      onClose={onClose}
      footer={
        <>
          <Button isLoading={isPending} onClick={() => void confirm()}>
            {isEnded ? 'Enregistrer' : `Victoire : ${getTeamLabel(winner).toLowerCase()}`}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
        </>
      }
    >
      <Segmented
        label="Camp vainqueur"
        value={winner}
        onChange={setWinner}
        options={[
          { value: 'Good', label: getTeamLabel('Good') },
          { value: 'Evil', label: getTeamLabel('Evil') },
        ]}
      />
      <div className={styles.field}>
        <span className={styles.label}>Raison annoncée</span>
        <div className={styles.reasons}>
          {REASONS.map((item) => (
            <button
              key={item}
              type="button"
              className={styles.reason}
              aria-pressed={reason === item}
              onClick={() => setReason(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <textarea
          className={styles.text}
          value={reason}
          maxLength={REASON_MAX}
          rows={2}
          placeholder="Ou écrivez la raison"
          aria-label="Raison annoncée"
          onChange={(event) => setReason(event.target.value)}
        />
      </div>
    </Sheet>
  );
};
