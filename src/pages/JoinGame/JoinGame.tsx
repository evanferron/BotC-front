import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Screen } from '@/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@/components/PhaseBar/PhaseBar';
import { TextField } from '@/components/TextField/TextField';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { PlayerDisc } from '@/components/PlayerDisc/PlayerDisc';
import { AUTH_ROUTES, buildGameRoute } from '@/config/routes.config';
import { useAuth } from '@auth/hooks/useAuth';
import { useJoinGameMutation } from '@games/api/useJoinGameMutation';
import {
  normalizeRoomCode,
  ROOM_CODE_LENGTH,
  ROOM_CODE_QUERY_PARAM,
} from '@games/constants/ROOM_CODE';
import { getJoinErrorMessage } from '@games/utils/joinError.utils';
import styles from './JoinGame.module.scss';

// Écran 04a (J1-Rejoindre) : le joueur entre avec son compte, son pseudo est repris
export const JoinGame = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { mutateAsync: joinGame, isPending } = useJoinGameMutation();

  // Le lien partagé par le conteur pré-remplit le code
  const [code, setCode] = useState(() =>
    normalizeRoomCode(searchParams.get(ROOM_CODE_QUERY_PARAM) ?? '')
  );
  const [error, setError] = useState<string>();

  useEffect(() => {
    document.title = 'Rejoindre une table · Cadran';
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    if (!code) return;

    try {
      const { game } = await joinGame(code);
      void navigate(buildGameRoute(game.id), { replace: true });
    } catch (err) {
      setError(getJoinErrorMessage(err));
    }
  };

  return (
    <Screen
      header={
        <PhaseBar
          title="Rejoindre"
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
      onSubmit={handleSubmit}
      footer={
        <Button type="submit" size="xl" disabled={!code} isLoading={isPending}>
          Rejoindre la table
        </Button>
      }
    >
      <h2 className={styles.title}>Rejoindre une table</h2>

      <Card row>
        <PlayerDisc name={user?.pseudo} />
        <div className={styles.account}>
          <span className={styles.pseudo}>{user?.pseudo ?? '…'}</span>
          <span className={styles.hint}>Pseudo de votre compte</span>
        </div>
        {/* Changer de compte : la déconnexion ramène ici après la connexion */}
        <Button variant="ghost" fullWidth={false} onClick={() => void logout()}>
          Changer
        </Button>
      </Card>

      <TextField
        id="join-code"
        label="Code de la partie"
        variant="code"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        inputMode="text"
        showCount
        maxLength={ROOM_CODE_LENGTH}
        placeholder="······"
        value={code}
        onChange={(e) => {
          setCode(normalizeRoomCode(e.target.value));
          setError(undefined);
        }}
        hint="Demandez-le au Conteur."
        error={error}
      />
    </Screen>
  );
};
