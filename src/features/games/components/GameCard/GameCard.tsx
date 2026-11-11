import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/Card/Card';
import { Pill } from '@/components/Pill/Pill';
import { Button } from '@/components/Button/Button';
import { buildGameRoute } from '@/config/routes.config';
import { useAuth } from '@auth/hooks/useAuth';
import { getScriptName } from '../../constants/SCRIPTS';
import {
  formatPlayerCount,
  getPhaseLabel,
  getWinnerLabel,
  isGameInProgress,
} from '../../utils/game.utils';
import type { Game } from '../../types/game.types';
import styles from './GameCard.module.scss';

interface GameCardProps {
  game: Game;
}

// Carte d'une partie dans « Mes parties » (écran 23c, C7-Journal-Parties-Cas)
export const GameCard = ({ game }: GameCardProps) => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const isEnded = game.status === 'Ended';
  const summary = [
    game.storyteller_id === userId ? 'Conteur' : 'Joueur',
    getScriptName(game.script_id),
    formatPlayerCount(game.player_count),
    getWinnerLabel(game) ?? (isGameInProgress(game.status) ? getPhaseLabel(game) : undefined),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <span className={styles.code} aria-label={`Code ${game.room_code.split('').join(' ')}`}>
          {game.room_code}
        </span>
        <Pill tone={isEnded ? 'default' : 'highlight'}>
          {isEnded ? 'Terminée' : getPhaseLabel(game)}
        </Pill>
      </div>
      <p className={styles.summary}>{summary}</p>
      <Button
        variant={isEnded ? 'secondary' : 'primary'}
        onClick={() => void navigate(buildGameRoute(game.id))}
      >
        {isEnded ? 'Voir la partie' : 'Reprendre'}
      </Button>
    </Card>
  );
};
