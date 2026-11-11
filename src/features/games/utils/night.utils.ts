import type { ActionKind, ActionStatus, NightStep, StepChoice } from '../types/night.types';

// Ajoute ou retire un élément. Avec max = 1, le nouvel élément remplace le précédent.
export const toggleSelection = (selected: string[], id: string, max: number): string[] => {
  if (selected.includes(id)) return selected.filter((s) => s !== id);
  if (max === 1) return [id];
  return selected.length < max ? [...selected, id] : selected;
};

// Nombre de joueurs et de rôles à choisir pour chaque gabarit
export const getChoiceShape = (kind: ActionKind): { players: number; roles: number } => {
  switch (kind) {
    case 'ChooseOnePlayer':
      return { players: 1, roles: 0 };
    case 'ChooseTwoPlayers':
      return { players: 2, roles: 0 };
    case 'ChooseRole':
      return { players: 0, roles: 1 };
    default:
      return { players: 0, roles: 0 };
  }
};

export const isChoiceComplete = (kind: ActionKind, playerIds: string[], roleIds: string[]) => {
  const shape = getChoiceShape(kind);
  return playerIds.length === shape.players && roleIds.length === shape.roles;
};

// Corps envoyé à l'API à partir de la sélection
export const toStepChoice = (playerIds: string[], roleIds: string[]): StepChoice => ({
  target_id: playerIds[0],
  second_target_id: playerIds[1],
  target_role_id: roleIds[0],
});

// Étapes encore à traiter par le conteur
export const isOpenStatus = (status: ActionStatus) =>
  status === 'Pending' || status === 'WaitingPlayer' || status === 'Received';

export const getStepStatusLabel = (status: ActionStatus): string => {
  const labels: Record<ActionStatus, string> = {
    Pending: 'À venir',
    WaitingPlayer: 'Réveillé',
    Received: 'Choix reçu',
    Accepted: 'Fait',
    Modified: 'Modifié',
    Ignored: 'Ignoré',
    Skipped: 'Passé',
  };
  return labels[status];
};

// Titre d'une étape : nom du rôle, ou étape d'équipe
export const getStepTitle = (step: NightStep): string => {
  if (step.role) return step.role.name;
  if (step.action_type === 'minion_info') return 'Sbires : se reconnaître';
  if (step.action_type === 'demon_info') return 'Démon : Sbires et bluffs';
  return 'Étape ajoutée';
};

export const isTeamInfoStep = (step: NightStep) =>
  step.action_type === 'minion_info' || step.action_type === 'demon_info';

// Ce que le joueur réveillé doit faire, à dire à voix basse ou à lire
export const getActionHint = (kind: ActionKind): string => {
  switch (kind) {
    case 'ChooseOnePlayer':
      return 'Il désigne un joueur.';
    case 'ChooseTwoPlayers':
      return 'Il désigne deux joueurs.';
    case 'ChooseRole':
      return 'Il choisit un rôle.';
    case 'Confirm':
      return 'Il reçoit une information, puis confirme.';
    default:
      return "Il n'a rien à choisir.";
  }
};
