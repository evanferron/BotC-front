import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Screen } from '@/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@/components/PhaseBar/PhaseBar';
import { Button } from '@/components/Button/Button';
import { Dial } from '@/components/Dial/Dial';
import { AUTH_ROUTES } from '@/config/routes.config';
import { getPhaseLabel, getPhaseVariant, getWinnerLabel } from '../../utils/game.utils';
import type { Game } from '../../types/game.types';
import styles from './GameStarted.module.scss';

interface GameStartedProps {
  game: Game;
}

// Partie lancée : les écrans de distribution, nuit et jour arrivent aux prochaines étapes
export const GameStarted = ({ game }: GameStartedProps) => {
  const navigate = useNavigate();
  const isEnded = game.status === 'Ended';

  return (
    <Screen
      header={
        <PhaseBar
          title="Partie"
          variant={getPhaseVariant(game.status)}
          tag={getPhaseLabel(game)}
          actions={
            <PhaseBarAction
              aria-label="Retour à mes parties"
              onClick={() => void navigate(AUTH_ROUTES.GAMES)}
            >
              <ArrowLeft aria-hidden="true" />
            </PhaseBarAction>
          }
        />
      }
      centered
      footer={
        <Button variant="secondary" onClick={() => void navigate(AUTH_ROUTES.GAMES)}>
          Mes parties
        </Button>
      }
    >
      <Dial size="xl" angle={isEnded ? 330 : 0} />
      <h2 className={styles.title}>
        {isEnded ? 'La partie est terminée' : 'La partie a commencé'}
      </h2>
      <p className={styles.text}>
        {getWinnerLabel(game) ??
          `Table ${game.room_code}. Les écrans de cette phase arrivent bientôt.`}
      </p>
    </Screen>
  );
};
