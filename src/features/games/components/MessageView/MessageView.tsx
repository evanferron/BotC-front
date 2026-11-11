import { PlayerDisc } from '@/components/PlayerDisc/PlayerDisc';
import type { Player, RoleSummary } from '../../types/game.types';
import type { PlayerMessage } from '../../types/night.types';
import { getCharacterTypeLabel } from '../../utils/role.utils';
import styles from './MessageView.module.scss';

interface MessageViewProps {
  message: PlayerMessage;
  players: Player[];
  roles: RoleSummary[];
}

const PlayerChips = ({ ids, players }: { ids: string[]; players: Player[] }) => (
  <ul className={styles.players}>
    {ids.map((id) => {
      const pseudo = players.find((p) => p.id === id)?.pseudo ?? '?';
      return (
        <li key={id} className={styles.player}>
          <PlayerDisc name={pseudo} size="large" />
          <span>{pseudo}</span>
        </li>
      );
    })}
  </ul>
);

const RoleChips = ({ ids, roles }: { ids: string[]; roles: RoleSummary[] }) => (
  <ul className={styles.roles}>
    {ids.map((id) => {
      const role = roles.find((r) => r.id === id);
      return (
        <li key={id} className={styles.role}>
          <span className={styles.role_name}>{role?.name ?? id}</span>
          {role && (
            <span className={styles.role_type}>{getCharacterTypeLabel(role.character_type)}</span>
          )}
        </li>
      );
    })}
  </ul>
);

// Écran 11b : information du Conteur, en lecture seule
export const MessageView = ({ message, players, roles }: MessageViewProps) => {
  const { payload } = message;
  return (
    <div className={styles.view}>
      <span className={styles.eyebrow}>Le Conteur vous montre</span>
      {message.content && <p className={styles.content}>{message.content}</p>}

      {message.kind === 'Players' && (
        <PlayerChips ids={payload.player_ids ?? []} players={players} />
      )}
      {message.kind === 'Roles' && <RoleChips ids={payload.role_ids ?? []} roles={roles} />}
      {message.kind === 'Number' && <p className={styles.big}>{payload.number}</p>}
      {message.kind === 'YesNo' && <p className={styles.big}>{payload.answer ? 'Oui' : 'Non'}</p>}

      {message.kind === 'TeamInfo' && (
        <div className={styles.team}>
          {payload.demon_ids && (
            <section>
              <h3 className={styles.section}>Votre Démon</h3>
              <PlayerChips ids={payload.demon_ids} players={players} />
            </section>
          )}
          {payload.minion_ids && (
            <section>
              <h3 className={styles.section}>{payload.demon_ids ? 'Vos alliés' : 'Vos Sbires'}</h3>
              {payload.minion_ids.length > 0 ? (
                <PlayerChips ids={payload.minion_ids} players={players} />
              ) : (
                <p className={styles.text}>Aucun.</p>
              )}
            </section>
          )}
          {payload.bluff_role_ids && (
            <section>
              <h3 className={styles.section}>Rôles absents, pour bluffer</h3>
              <RoleChips ids={payload.bluff_role_ids} roles={roles} />
            </section>
          )}
        </div>
      )}
    </div>
  );
};
