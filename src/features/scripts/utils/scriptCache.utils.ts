// Copie locale du catalogue (localStorage) : la liste des rôles reste consultable hors connexion
// (design/R1-Roles-du-script, écran R9). Le stockage peut être plein ou interdit : on l'ignore alors.

const PREFIX = 'botc.scripts.';

interface CachedEntry<T> {
  data: T;
  savedAt: number;
}

export const readCache = <T>(key: string): CachedEntry<T> | undefined => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as CachedEntry<T>) : undefined;
  } catch {
    return undefined;
  }
};

export const writeCache = <T>(key: string, data: T) => {
  try {
    const entry: CachedEntry<T> = { data, savedAt: Date.now() };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // Stockage indisponible : la liste restera en mémoire seulement
  }
};
