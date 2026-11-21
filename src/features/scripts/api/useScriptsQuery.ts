import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import type { ScriptSummary } from '../types/script.types';
import { readCache, writeCache } from '../utils/scriptCache.utils';
import { SCRIPTS_ENDPOINTS, SCRIPTS_KEYS, SCRIPTS_STALE_TIME } from './SCRIPTS_CONF';

const CACHE_KEY = 'list';

const getScripts = async () => {
  const { data } = await axiosInstance.get<ScriptSummary[]>(SCRIPTS_ENDPOINTS.list);
  writeCache(CACHE_KEY, data);
  return data;
};

/**
 * Catalogue des scripts. Démarre sur la copie locale (hors connexion), puis se rafraîchit.
 * Pas de toast d'erreur : l'écran affiche lui-même l'état (copie locale ou message).
 */
export const useScriptsQuery = () =>
  useQuery({
    queryKey: SCRIPTS_KEYS.list(),
    queryFn: getScripts,
    staleTime: SCRIPTS_STALE_TIME,
    initialData: () => readCache<ScriptSummary[]>(CACHE_KEY)?.data,
    initialDataUpdatedAt: () => readCache<ScriptSummary[]>(CACHE_KEY)?.savedAt,
  });

// Nom affichable d'un script (l'identifiant tant que le catalogue n'est pas chargé)
export const useScriptName = (scriptId: string) => {
  const { data } = useScriptsQuery();
  return data?.find((script) => script.id === scriptId)?.name ?? scriptId;
};
