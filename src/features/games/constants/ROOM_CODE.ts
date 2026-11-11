// Longueur des codes de partie générés par l'API (6 caractères hexadécimaux en majuscules)
export const ROOM_CODE_LENGTH = 6;

// Nom du paramètre d'URL qui pré-remplit le code : /rejoindre?code=K7QM2X
export const ROOM_CODE_QUERY_PARAM = 'code';

// Normalise une saisie : majuscules, sans espaces ni caractères hors code
export const normalizeRoomCode = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, ROOM_CODE_LENGTH);
