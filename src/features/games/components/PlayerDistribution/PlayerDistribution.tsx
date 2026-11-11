import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, IdCard } from 'lucide-react';
import { Screen } from '@/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@/components/PhaseBar/PhaseBar';
import { Button } from '@/components/Button/Button';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import { PlayerDisc } from '@/components/PlayerDisc/PlayerDisc';
import { Loading } from '@/components/Loading/Loading';
import { AUTH_ROUTES } from '@/config/routes.config';
import { useAuth } from '@auth/hooks/useAuth';
import { usePlayersQuery } from '../../api/usePlayersQuery';
import { useCardsQuery } from '../../api/useCardsQuery';
import { usePickCardMutation } from '../../api/usePickCardMutation';
import type { Game } from '../../types/game.types';
import { getPhaseLabel, getPhaseVariant } from '../../utils/game.utils';
import { markRoleSeen } from '../../utils/roleSeen.utils';
import { CardFan } from '../CardFan/CardFan';
import { DistributionList } from '../DistributionList/DistributionList';
import { RoleCard } from '../RoleCard/RoleCard';
import styles from './PlayerDistribution.module.scss';

interface PlayerDistributionProps {
  game: Game;
}

// Écrans 07a à 08b (J2-Distribution) : choisir sa carte à son tour, puis découvrir son rôle en secret
export const PlayerDistribution = ({ game }: PlayerDistributionProps) => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const isDistributing = game.status === 'Distribution';
  const { data: players } = usePlayersQuery(game.id);
  const { data: distribution, isLoading } = useCardsQuery(game.id, isDistributing);
  const { mutateAsync: pickCard, isPending: isPicking } = usePickCardMutation();

  const [selected, setSelected] = useState<number>();
  // Le joueur a révélé sa carte au moins une fois, puis confirmé l'avoir vue
  const [hasRevealed, setHasRevealed] = useState(false);
  const [showRole, setShowRole] = useState(true);

  const cards = distribution?.cards ?? [];
  const picked = cards.filter((c) => c.picked_by).length;
  const me = players?.find((p) => p.user_id === userId);
  const currentPicker = players?.find((p) => p.id === distribution?.current_picker_id);
  const isMyTurn = !!me && me.id === distribution?.current_picker_id;
  const myRole = distribution?.my_role;

  const handleConfirm = async () => {
    if (selected === undefined) return;
    try {
      await pickCard({ gameId: game.id, position: selected });
    } finally {
      setSelected(undefined);
    }
  };

  const header = (
    <PhaseBar
      title="Distribution"
      variant={getPhaseVariant(game.status)}
      tag={getPhaseLabel(game)}
      meta={cards.length > 0 ? `${picked} / ${cards.length}` : undefined}
      actions={
        <>
          {myRole && !showRole && (
            <PhaseBarAction aria-label="Mon rôle" onClick={() => setShowRole(true)}>
              <IdCard aria-hidden="true" />
            </PhaseBarAction>
          )}
          <PhaseBarAction
            aria-label="Retour à mes parties"
            onClick={() => void navigate(AUTH_ROUTES.GAMES)}
          >
            <ArrowLeft aria-hidden="true" />
          </PhaseBarAction>
        </>
      }
    />
  );

  if (isLoading || !distribution) {
    return (
      <Screen header={header}>
        <Loading label="Chargement des cartes…" />
      </Screen>
    );
  }

  // 08a / 08b : sa carte, masquée, révélée tant que le doigt reste posé
  if (myRole && showRole) {
    return (
      <Screen
        header={header}
        centered
        footer={
          <>
            <p className={styles.footnote}>Gardez votre rôle secret.</p>
            <Button
              disabled={!hasRevealed}
              onClick={() => {
                markRoleSeen(game.id);
                setShowRole(false);
              }}
            >
              J'ai vu mon rôle
            </Button>
          </>
        }
      >
        <span className={styles.eyebrow}>Votre carte</span>
        <RoleCard role={myRole} masked onReveal={() => setHasRevealed(true)} />
      </Screen>
    );
  }

  // 07a / 07b : à son tour, choisir une carte dans l'éventail
  if (isMyTurn) {
    const freePositions = cards.filter((c) => !c.picked_by).map((c) => c.position);
    const hasSelection = selected !== undefined;
    return (
      <Screen
        header={header}
        footer={
          hasSelection ? (
            <>
              <Button size="xl" isLoading={isPicking} onClick={() => void handleConfirm()}>
                Garder cette carte
              </Button>
              <Button
                variant="secondary"
                disabled={isPicking}
                onClick={() => setSelected(undefined)}
              >
                Choisir une autre carte
              </Button>
            </>
          ) : (
            <p className={styles.footnote}>
              {freePositions.length} carte{freePositions.length > 1 ? 's' : ''} restante
              {freePositions.length > 1 ? 's' : ''}
            </p>
          )
        }
      >
        <span className={styles.eyebrow}>À votre tour</span>
        <h2 className={styles.title}>
          {hasSelection ? 'Garder cette carte ?' : 'Choisissez une carte'}
        </h2>
        <p className={styles.text}>
          {hasSelection
            ? 'Une fois confirmée, elle est à vous.'
            : 'Elles sont toutes face cachée. Personne ne verra la vôtre.'}
        </p>
        <div className={styles.spacer} />
        <CardFan
          positions={freePositions}
          selected={selected}
          disabled={isPicking}
          onSelect={setSelected}
        />
      </Screen>
    );
  }

  // 07c : en attente, on voit qui choisit (après sa carte, ou avant son tour)
  return (
    <Screen
      header={header}
      footer={
        !isDistributing && (
          <p className={styles.footnote}>La première nuit commence. Le Conteur vous guide.</p>
        )
      }
    >
      <span className={styles.eyebrow}>
        {isDistributing ? 'En cours' : 'Distribution terminée'}
      </span>
      {currentPicker ? (
        <div className={styles.picker}>
          <PlayerDisc name={currentPicker.pseudo} size="large" />
          <div>
            <h2 className={styles.subtitle}>{currentPicker.pseudo} choisit…</h2>
            <p className={styles.text}>
              {myRole ? 'Vous avez déjà votre carte.' : 'Votre tour viendra.'}
            </p>
          </div>
        </div>
      ) : (
        <h2 className={styles.subtitle}>Tout le monde a sa carte</h2>
      )}
      <ProgressBar value={picked} max={cards.length} label="Cartes choisies" />
      <DistributionList
        players={players ?? []}
        cards={cards}
        currentPickerId={distribution.current_picker_id}
        currentUserId={userId}
      />
    </Screen>
  );
};
