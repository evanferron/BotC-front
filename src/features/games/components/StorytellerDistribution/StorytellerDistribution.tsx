import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Screen } from '@/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@/components/PhaseBar/PhaseBar';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import { PlayerDisc } from '@/components/PlayerDisc/PlayerDisc';
import { Loading } from '@/components/Loading/Loading';
import { ENV } from '@/config/api.config';
import { AUTH_ROUTES } from '@/config/routes.config';
import { usePlayersQuery } from '../../api/usePlayersQuery';
import { useCardsQuery } from '../../api/useCardsQuery';
import { usePickCardMutation } from '../../api/usePickCardMutation';
import type { Distribution, Game } from '../../types/game.types';
import { getPhaseLabel, getPhaseVariant } from '../../utils/game.utils';
import { DistributionList } from '../DistributionList/DistributionList';
import styles from './StorytellerDistribution.module.scss';

interface StorytellerDistributionProps {
  game: Game;
}

// Une carte libre au hasard (le conteur choisit pour un joueur absent)
const randomFreePosition = (distribution: Distribution) => {
  const free = distribution.cards.filter((c) => !c.picked_by);
  return free[Math.floor(Math.random() * free.length)]?.position;
};

// Écrans 09a et 09b (C2-Lobby-Distribution) : le conteur suit la distribution, rôles visibles
export const StorytellerDistribution = ({ game }: StorytellerDistributionProps) => {
  const navigate = useNavigate();
  const isDistributing = game.status === 'Distribution';
  const { data: players } = usePlayersQuery(game.id);
  const { data: distribution, isLoading, refetch } = useCardsQuery(game.id, isDistributing);
  const { mutateAsync: pickCard, isPending: isPicking } = usePickCardMutation();
  const [isDealingAll, setIsDealingAll] = useState(false);

  const cards = distribution?.cards ?? [];
  const picked = cards.filter((c) => c.picked_by).length;
  const currentPicker = players?.find((p) => p.id === distribution?.current_picker_id);
  const isDone = !!distribution && !distribution.current_picker_id;

  // Choisit une carte au hasard pour le joueur dont c'est le tour
  const pickFor = async (current: Distribution) => {
    const position = randomFreePosition(current);
    if (!current.current_picker_id || position === undefined) return false;
    await pickCard({ gameId: game.id, position, playerId: current.current_picker_id });
    return true;
  };

  const handlePickForCurrent = async () => {
    if (!distribution) return;
    try {
      await pickFor(distribution);
    } catch {
      // Toast affiché par la mutation
    }
  };

  // Développement : distribue toutes les cartes restantes d'un coup
  const handleDealAll = async () => {
    setIsDealingAll(true);
    try {
      for (;;) {
        const { data } = await refetch();
        if (!data || !(await pickFor(data))) break;
      }
    } catch {
      // Toast affiché par la mutation
    } finally {
      setIsDealingAll(false);
    }
  };

  const header = (
    <PhaseBar
      title="Distribution"
      variant={getPhaseVariant(game.status)}
      tag={getPhaseLabel(game)}
      meta={cards.length > 0 ? `${picked} / ${cards.length}` : undefined}
      actions={
        <PhaseBarAction
          aria-label="Retour à mes parties"
          onClick={() => void navigate(AUTH_ROUTES.GAMES)}
        >
          <ArrowLeft aria-hidden="true" />
        </PhaseBarAction>
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

  const busy = isPicking || isDealingAll;

  return (
    <Screen
      header={header}
      footer={
        isDone ? (
          <>
            <p className={styles.footnote}>Le déroulé de la nuit arrive à la prochaine étape.</p>
            <Button size="xl" disabled>
              Commencer la première nuit
            </Button>
          </>
        ) : (
          <>
            {currentPicker && (
              <Button
                variant="secondary"
                isLoading={isPicking && !isDealingAll}
                disabled={busy}
                onClick={() => void handlePickForCurrent()}
              >
                Choisir au hasard pour {currentPicker.pseudo}
              </Button>
            )}
            {ENV === 'DEV' && (
              <Button
                variant="ghost"
                isLoading={isDealingAll}
                disabled={busy}
                onClick={() => void handleDealAll()}
              >
                Tout distribuer (test)
              </Button>
            )}
          </>
        )
      }
    >
      {isDone ? (
        <Card tone="accent" row>
          <span className={styles.check}>
            <Check aria-hidden="true" />
          </span>
          <div>
            <h2 className={styles.subtitle}>Tout le monde a sa carte</h2>
            <p className={styles.text}>Vérifiez la répartition avant de continuer.</p>
          </div>
        </Card>
      ) : (
        <>
          <div className={styles.picker}>
            {currentPicker && <PlayerDisc name={currentPicker.pseudo} size="large" />}
            <div>
              <h2 className={styles.subtitle}>
                {currentPicker ? `${currentPicker.pseudo} choisit…` : 'Distribution'}
              </h2>
              <p className={styles.text}>
                {picked + 1}ᵉ sur {cards.length} · rôles visibles par vous seul
              </p>
            </div>
          </div>
          <ProgressBar value={picked} max={cards.length} label="Cartes choisies" />
        </>
      )}

      <DistributionList
        players={players ?? []}
        cards={cards}
        currentPickerId={distribution.current_picker_id}
        showRoles
      />
    </Screen>
  );
};
