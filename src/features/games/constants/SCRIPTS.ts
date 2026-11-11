// Scripts proposés à la création. L'API n'expose pas encore le catalogue (table `scripts`) :
// la liste est ici en attendant un endpoint.
export const SCRIPTS = [
  { id: 'trouble_brewing', name: 'Trouble Brewing', description: 'Script de départ' },
] as const;

export const DEFAULT_SCRIPT_ID = SCRIPTS[0].id;

// Bornes acceptées par l'API (CreateGameRequest)
export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 15;
export const DEFAULT_PLAYERS = 10;

export const getScriptName = (scriptId: string) =>
  SCRIPTS.find((script) => script.id === scriptId)?.name ?? scriptId;
