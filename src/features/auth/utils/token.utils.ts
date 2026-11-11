// Access token gardé en mémoire uniquement (jamais en localStorage).
// Au rechargement de la page, il est reconstruit grâce au cookie HttpOnly de refresh.
let accessToken: string | null = null;

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

/**
 * Lit l'UUID de l'utilisateur (`sub`) dans le JWT, sans vérifier la signature :
 * c'est le serveur qui fait foi, le client s'en sert seulement pour charger le profil.
 */
export const getUserIdFromToken = (token: string): string | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(base64)) as { sub?: unknown };
    return typeof json.sub === 'string' ? json.sub : null;
  } catch {
    return null;
  }
};
