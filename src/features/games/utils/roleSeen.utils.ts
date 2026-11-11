// Le joueur a déjà découvert sa carte dans cet onglet : on ne la lui remontre pas à chaque
// rechargement. Le stockage peut être indisponible (navigation privée) : on retombe sur « pas vue ».
const key = (gameId: string) => `botc:role-seen:${gameId}`;

export const hasSeenRole = (gameId: string): boolean => {
  try {
    return sessionStorage.getItem(key(gameId)) === '1';
  } catch {
    return false;
  }
};

export const markRoleSeen = (gameId: string) => {
  try {
    sessionStorage.setItem(key(gameId), '1');
  } catch {
    // Sans stockage, la carte sera simplement remontrée au prochain chargement
  }
};
