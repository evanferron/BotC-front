import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Screen } from '@common/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@common/components/PhaseBar/PhaseBar';
import { AUTH_ROUTES } from '@common/config/routes.config';
import { useScriptName } from '@scripts/api/useScriptsQuery';
import { ScriptRoles } from '@scripts/components/ScriptRoles/ScriptRoles';

/**
 * Rôles d'un script, hors partie (design/R1-Roles-du-script.dc.html, sans rôle épinglé).
 * Adresse partageable : la table peut découvrir le script avant la partie.
 */
export const ScriptRolesPage = () => {
  const { scriptId = '' } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const name = useScriptName(scriptId);

  useEffect(() => {
    document.title = `${name} · Rôles · BotC`;
  }, [name]);

  // Retour à l'écran d'origine (création de partie, catalogue), ou au catalogue sur un lien direct
  const goBack = () => {
    if (location.key !== 'default') void navigate(-1);
    else void navigate(AUTH_ROUTES.SCRIPTS);
  };

  return (
    <Screen
      header={
        <PhaseBar
          title={name}
          variant="night"
          actions={
            <PhaseBarAction aria-label="Retour" onClick={goBack}>
              <ArrowLeft aria-hidden="true" />
            </PhaseBarAction>
          }
        />
      }
    >
      <ScriptRoles scriptId={scriptId} />
    </Screen>
  );
};
