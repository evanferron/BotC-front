import { Button } from '@common/components/Button/Button';
import { Card } from '@common/components/Card/Card';
import { Loading } from '@common/components/Loading/Loading';
import { useIsOnline } from '@common/hooks/useIsOnline';
import { useScriptQuery } from '../../api/useScriptQuery';
import type { PinnedRole, RolesInPlay } from '../../types/script.types';
import { ScriptRoleList } from '../ScriptRoleList/ScriptRoleList';
import styles from './ScriptRoles.module.scss';

interface ScriptRolesProps {
  scriptId: string;
  pinned?: PinnedRole | null;
  inPlay?: RolesInPlay;
}

// Rôles d'un script avec chargement et erreur ; la copie locale sert hors connexion
export const ScriptRoles = ({ scriptId, pinned, inPlay }: ScriptRolesProps) => {
  const isOnline = useIsOnline();
  const { data, isPending, isError, isRefetchError, refetch } = useScriptQuery(scriptId);

  if (data) {
    return (
      <ScriptRoleList
        roles={data.roles}
        pinned={pinned}
        inPlay={inPlay}
        isOffline={!isOnline || isRefetchError}
      />
    );
  }

  if (isPending && isOnline) return <Loading label="Chargement des rôles…" />;

  return (
    <Card className={styles.error}>
      <p className={styles.text}>
        {isError
          ? "Les rôles de ce script n'ont pas pu être chargés."
          : 'Connexion perdue. Les rôles seront disponibles une fois chargés une première fois.'}
      </p>
      <Button variant="secondary" onClick={() => void refetch()}>
        Réessayer
      </Button>
    </Card>
  );
};
