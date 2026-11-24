import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Screen } from '@common/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@common/components/PhaseBar/PhaseBar';
import { Button } from '@common/components/Button/Button';
import { Card } from '@common/components/Card/Card';
import { Loading } from '@common/components/Loading/Loading';
import { PlayerDisc } from '@common/components/PlayerDisc/PlayerDisc';
import { AUTH_ROUTES } from '@common/config/routes.config';
import { cx } from '@common/utils/className.utils';
import { TEAM_ICONS } from '@scripts/constants/ROLE_ICONS';
import { getTeamLabel } from '@scripts/utils/role.utils';
import { useSummaryQuery } from '@games/api/end.api';
import type { Game } from '@games/types/game.types';
import { EndGameSheet } from '../EndGameSheet/EndGameSheet';
import { GrimoireAction } from '@games/components/table/GrimoireAction/GrimoireAction';
import styles from './EndView.module.scss';

interface EndViewProps {
  game: Game;
  isStoryteller: boolean;
}

/**
 * Fin de partie (design/C6-Fin, écrans 18a et 18b) : le camp vainqueur, sa raison, puis tous les
 * rôles révélés. Le conteur peut encore changer le camp et consulter le grimoire.
 */
export const EndView = ({ game, isStoryteller }: EndViewProps) => {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useSummaryQuery(game.id);
  const [isEditing, setIsEditing] = useState(false);
  const winner = summary?.winner ?? game.winner;
  const WinnerIcon = winner ? TEAM_ICONS[winner] : undefined;

  return (
    <Screen
      header={
        <PhaseBar
          title="Fin de partie"
          variant="end"
          actions={
            <>
              {isStoryteller && <GrimoireAction game={game} />}
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
        <Button variant="secondary" onClick={() => void navigate(AUTH_ROUTES.GAMES)}>
          Quitter la table
        </Button>
      }
    >
      <Card className={cx(styles.winner, winner === 'Evil' ? styles.evil : styles.good)}>
        {WinnerIcon && <WinnerIcon aria-hidden="true" className={styles.winner_icon} />}
        <span className={styles.eyebrow}>Camp vainqueur</span>
        <h2 className={styles.team}>{winner ? getTeamLabel(winner) : 'Non déclaré'}</h2>
        {(summary?.reason ?? game.end_reason) && (
          <p className={styles.reason}>{summary?.reason ?? game.end_reason}</p>
        )}
        {isStoryteller && (
          <>
            <small className={styles.hint}>Corrigeable tant que la table est ouverte.</small>
            <Button variant="secondary" fullWidth={false} onClick={() => setIsEditing(true)}>
              Changer le camp
            </Button>
          </>
        )}
      </Card>

      <h3 className={styles.section}>Rôles révélés</h3>
      {isLoading || !summary ? (
        <Loading label="Révélation des rôles…" />
      ) : (
        <ul className={styles.list} aria-label="Rôles révélés">
          {summary.players.map((player) => {
            const TeamIcon = player.alignment ? TEAM_ICONS[player.alignment] : undefined;
            return (
              <li key={player.id} className={cx(styles.row, !player.is_alive && styles.dead)}>
                <PlayerDisc name={player.pseudo} dead={!player.is_alive} />
                <span className={styles.text}>
                  <span className={styles.name}>
                    {player.pseudo}
                    {!player.is_alive && <small> · mort</small>}
                  </span>
                  <span className={styles.role}>{player.role?.name ?? 'Sans rôle'}</span>
                  {player.shown_role && <small>Croyait être {player.shown_role.name}</small>}
                </span>
                {player.alignment && TeamIcon && (
                  <span
                    className={cx(
                      styles.player_team,
                      player.alignment === 'Evil' ? styles.evil : styles.good
                    )}
                  >
                    <TeamIcon aria-hidden="true" />
                    {getTeamLabel(player.alignment)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {isEditing && <EndGameSheet game={game} onClose={() => setIsEditing(false)} />}
    </Screen>
  );
};
