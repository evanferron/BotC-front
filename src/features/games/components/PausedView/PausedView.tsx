import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Screen } from '@common/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@common/components/PhaseBar/PhaseBar';
import { Button } from '@common/components/Button/Button';
import { AUTH_ROUTES } from '@common/config/routes.config';
import { usePlayersQuery } from '../../api/usePlayersQuery';
import { useResumeMutation } from '../../api/useTableMutations';
import type { Game } from '../../types/game.types';
import { GrimoireAction } from '../GrimoireAction/GrimoireAction';
import { LeaveTableSheet } from '../LeaveTableSheet/LeaveTableSheet';
import { ScriptRolesAction } from '../ScriptRolesAction/ScriptRolesAction';
import styles from './PausedView.module.scss';

interface PausedViewProps {
  game: Game;
  isStoryteller: boolean;
}

/**
 * Partie en pause (design/C7 23e côté conteur, J6 24g côté joueur). Le conteur reprend ou quitte
 * la partie ; le grimoire reste ouvert pour corriger la table pendant la pause.
 */
export const PausedView = ({ game, isStoryteller }: PausedViewProps) => {
  const navigate = useNavigate();
  const { data: players = [] } = usePlayersQuery(game.id);
  const { mutate: resume, isPending: isResuming } = useResumeMutation();
  const [isLeaving, setIsLeaving] = useState(false);
  const alive = players.filter((p) => p.is_alive).length;

  return (
    <Screen
      header={
        <PhaseBar
          title="Pause"
          meta={`${alive} en vie`}
          actions={
            <>
              {isStoryteller ? <GrimoireAction game={game} /> : <ScriptRolesAction game={game} />}
              <PhaseBarAction
                aria-label="Retour à mes parties"
                onClick={() => void navigate(AUTH_ROUTES.GAMES)}
              >
                <ArrowLeft aria-hidden="true" />
              </PhaseBarAction>
            </>
          }
        />
      }
      footer={
        isStoryteller ? (
          <>
            <Button size="xl" isLoading={isResuming} onClick={() => resume(game.id)}>
              Reprendre la partie
            </Button>
            <Button variant="secondary" onClick={() => setIsLeaving(true)}>
              Quitter la partie
            </Button>
          </>
        ) : undefined
      }
      centered
    >
      <h2 className={styles.title}>Partie en pause.</h2>
      <p className={styles.text}>
        {isStoryteller
          ? 'Les joueurs attendent. Reprenez quand tout le monde est prêt.'
          : 'Le Conteur reprendra bientôt. Vous pouvez poser votre téléphone.'}
      </p>
      {isLeaving && <LeaveTableSheet game={game} onClose={() => setIsLeaving(false)} />}
    </Screen>
  );
};
