// Retour haptique d'un geste (design/Navigation-Vibrations.dc.html). Seules les réponses au toucher
// de l'utilisateur vibrent, jamais une arrivée d'information : la nuit, un téléphone qui vibre trahit.
export const HAPTICS = {
  tap: 10,
  select: 8,
  reveal: 20,
} as const;

export const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
};
