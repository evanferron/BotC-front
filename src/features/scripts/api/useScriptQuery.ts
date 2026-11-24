import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import type { ScriptDetail } from '../types/script.types';
import { readCache, writeCache } from '../utils/scriptCache.utils';
import { SCRIPTS_ENDPOINTS, SCRIPTS_KEYS, SCRIPTS_STALE_TIME } from './SCRIPTS_CONF';

const cacheKey = (id: string) => `detail.${id}`;

const getScript = async (id: string) => {
  const { data } = await axiosInstance.get<ScriptDetail>(SCRIPTS_ENDPOINTS.script(id));
  writeCache(cacheKey(id), data);
  return data;
};

/**
 * Rôles d'un script, indexés par script et non par partie : le même cache sert hors partie et
 * dans toutes les parties de ce script. Démarre sur la copie locale (hors connexion).
 */
export const useScriptQuery = (scriptId: string | undefined) =>
  useQuery({
    queryKey: SCRIPTS_KEYS.detail(scriptId ?? ''),
    queryFn: () => getScript(scriptId ?? ''),
    enabled: !!scriptId,
    staleTime: SCRIPTS_STALE_TIME,
    initialData: () => (scriptId ? readCache<ScriptDetail>(cacheKey(scriptId))?.data : undefined),
    initialDataUpdatedAt: () =>
      scriptId ? readCache<ScriptDetail>(cacheKey(scriptId))?.savedAt : undefined,
    meta: { errorMessage: 'Impossible de récupérer les rôles du script' },
  });

/**
 * Rôles d'un script, pour les écrans de partie : même source et même cache que la liste des
 * rôles consultable hors partie. `undefined` tant qu'ils ne sont pas chargés.
 */
export const useScriptRoles = (scriptId: string | undefined) =>
  useScriptQuery(scriptId).data?.roles;
