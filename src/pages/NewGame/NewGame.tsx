import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Screen } from '@common/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@common/components/PhaseBar/PhaseBar';
import { Button } from '@common/components/Button/Button';
import { ChoiceRow } from '@common/components/ChoiceRow/ChoiceRow';
import { Pill } from '@common/components/Pill/Pill';
import { Stepper } from '@common/components/Stepper/Stepper';
import { Loading } from '@common/components/Loading/Loading';
import { AUTH_ROUTES, buildGameRoute, buildScriptRolesRoute } from '@common/config/routes.config';
import { useCreateGameMutation } from '@games/api/games.api';
import {
  DEFAULT_PLAYERS,
  DEFAULT_SCRIPT_ID,
  MAX_PLAYERS,
  MIN_PLAYERS,
} from '@games/constants/SCRIPTS';
import { useScriptsQuery } from '@scripts/api/useScriptsQuery';
import styles from './NewGame.module.scss';

/**
 * Écran 02a (C1-Creation) : script et nombre de joueurs.
 * L'étape « composition » (02b/02c) attend que l'API expose les rôles et accepte une composition.
 */
export const NewGame = () => {
  const navigate = useNavigate();
  const { mutateAsync: createGame, isPending } = useCreateGameMutation();
  const { data: scripts, isPending: isLoadingScripts } = useScriptsQuery();

  const [scriptId, setScriptId] = useState<string>(DEFAULT_SCRIPT_ID);
  const [playerCount, setPlayerCount] = useState(DEFAULT_PLAYERS);
  const selectedScript = scripts?.find((script) => script.id === scriptId);

  useEffect(() => {
    document.title = 'Nouvelle partie · BotC';
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const game = await createGame({ script_id: scriptId, player_count: playerCount });
      void navigate(buildGameRoute(game.id), { replace: true });
    } catch {
      // Toast affiché par la mutation
    }
  };

  return (
    <Screen
      header={
        <PhaseBar
          title="Nouvelle partie"
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
        <Button type="submit" size="xl" isLoading={isPending} disabled={!selectedScript}>
          Créer la partie
        </Button>
      }
    >
      <section className={styles.section} aria-labelledby="script-title">
        <h2 id="script-title" className={styles.title}>
          Choisissez un script
        </h2>
        <div role="radiogroup" aria-labelledby="script-title" className={styles.choices}>
          {isLoadingScripts && !scripts && <Loading label="Chargement des scripts…" />}
          {scripts?.map((script) => (
            <ChoiceRow
              key={script.id}
              title={script.name}
              description={script.description ?? undefined}
              selected={scriptId === script.id}
              onClick={() => setScriptId(script.id)}
            />
          ))}
          <ChoiceRow title="Autres scripts" disabled trailing={<Pill>Bientôt</Pill>} />
        </div>
        {selectedScript && (
          <Button
            variant="ghost"
            leadingIcon={<BookOpen aria-hidden="true" />}
            onClick={() => void navigate(buildScriptRolesRoute(selectedScript.id))}
          >
            Voir les rôles de {selectedScript.name}
          </Button>
        )}
      </section>

      <hr className={styles.separator} />

      <section className={styles.section} aria-labelledby="players-title">
        <h2 id="players-title" className={styles.title}>
          Nombre de joueurs
        </h2>
        <Stepper
          value={playerCount}
          min={MIN_PLAYERS}
          max={MAX_PLAYERS}
          onChange={setPlayerCount}
          unitLabel="joueur"
          caption={`joueurs, de ${MIN_PLAYERS} à ${MAX_PLAYERS}`}
        />
        <p className={styles.hint}>Sans compter le Conteur.</p>
      </section>
    </Screen>
  );
};
