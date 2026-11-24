import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet } from '@common/components/Sheet/Sheet';
import { Button } from '@common/components/Button/Button';
import { ChoiceRow } from '@common/components/ChoiceRow/ChoiceRow';
import { HoldButton } from '@common/components/HoldButton/HoldButton';
import { AUTH_ROUTES } from '@common/config/routes.config';
import { usePlayersQuery } from '@games/api/games.api';
import { useCloseTableMutation, useTransferStorytellerMutation } from '@games/api/table.api';
import type { Game } from '@games/types/game.types';
import styles from './LeaveTableSheet.module.scss';

interface LeaveTableSheetProps {
  game: Game;
  onClose: () => void;
}

/**
 * Le conteur quitte la partie (design/C7 23g), depuis la pause : passer la main à un joueur, ou
 * fermer la table, ce qui termine la partie pour tous.
 */
export const LeaveTableSheet = ({ game, onClose }: LeaveTableSheetProps) => {
  const navigate = useNavigate();
  const { data: players = [] } = usePlayersQuery(game.id);
  const { mutateAsync: transfer, isPending: isTransferring } = useTransferStorytellerMutation();
  const { mutateAsync: close, isPending: isClosing } = useCloseTableMutation();
  const [step, setStep] = useState<'choice' | 'transfer'>('choice');
  const [heirId, setHeirId] = useState<string>();

  const atTable = players.filter((p) => !p.has_left);
  const heir = atTable.find((p) => p.id === heirId);

  const handleTransfer = async () => {
    if (!heir) return;
    try {
      await transfer({ gameId: game.id, playerId: heir.id, pseudo: heir.pseudo });
      // Plus conteur, et plus à table : retour à la liste des parties
      void navigate(AUTH_ROUTES.GAMES, { replace: true });
    } catch {
      // Toast affiché par la mutation
    }
  };

  const handleClose = async () => {
    try {
      await close(game.id);
      onClose();
    } catch {
      // Toast affiché par la mutation
    }
  };

  if (step === 'transfer') {
    return (
      <Sheet
        open
        title="Transférer le rôle de Conteur"
        description="Ce joueur quitte sa place et devient le Conteur ; son rôle reste au grimoire. Vous n'aurez plus accès à la partie."
        onClose={onClose}
        footer={
          <>
            <Button
              disabled={!heir}
              isLoading={isTransferring}
              onClick={() => void handleTransfer()}
            >
              {heir ? `Donner la main à ${heir.pseudo}` : 'Choisissez un joueur'}
            </Button>
            <Button variant="secondary" onClick={() => setStep('choice')}>
              Retour
            </Button>
          </>
        }
      >
        <div className={styles.list} role="radiogroup" aria-label="Nouveau Conteur">
          {atTable.map((player) => (
            <ChoiceRow
              key={player.id}
              title={player.pseudo}
              description={player.is_online ? 'En ligne' : 'Hors ligne'}
              selected={player.id === heirId}
              onClick={() => setHeirId(player.id)}
            />
          ))}
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet
      open
      title="Quitter la partie ?"
      description="La partie reste en pause. Vous pouvez transférer le rôle de Conteur à un autre joueur. Fermer la table termine la partie pour tous."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Rester
          </Button>
          <Button variant="secondary" onClick={() => setStep('transfer')}>
            Transférer le rôle de Conteur
          </Button>
          <HoldButton isLoading={isClosing} onConfirm={() => void handleClose()}>
            Maintenir pour fermer la table
          </HoldButton>
        </>
      }
    />
  );
};
