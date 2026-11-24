import type { CharacterType, ScriptRole, Team } from '../types/script.types';

// Ordre d'affichage des groupes, comme sur la feuille de script
export const CHARACTER_TYPES: CharacterType[] = ['Townsfolk', 'Outsider', 'Minion', 'Demon'];

const TYPE_LABELS: Record<CharacterType, { one: string; many: string }> = {
  Townsfolk: { one: 'Villageois', many: 'Villageois' },
  Outsider: { one: 'Étranger', many: 'Étrangers' },
  Minion: { one: 'Sbire', many: 'Sbires' },
  Demon: { one: 'Démon', many: 'Démons' },
};

export const getTypeLabel = (type: CharacterType) => TYPE_LABELS[type].one;

// Libellé d'en-tête de groupe et de filtre : « Étrangers », mais « Démon » s'il n'y en a qu'un
export const getGroupLabel = (type: CharacterType, count: number) =>
  count > 1 ? TYPE_LABELS[type].many : TYPE_LABELS[type].one;

export const getTeamLabel = (team: Team) => (team === 'Evil' ? 'Mauvaise équipe' : 'Bonne équipe');

// Équipe d'un type : les Sbires et le Démon sont dans la mauvaise équipe
export const getTypeTeam = (type: CharacterType): Team =>
  type === 'Minion' || type === 'Demon' ? 'Evil' : 'Good';

export const isEvilType = (type: CharacterType) => getTypeTeam(type) === 'Evil';

// Recherche insensible à la casse et aux accents : « ecuyer » trouve « Écuyer »
const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const matchesSearch = (role: ScriptRole, search: string) => {
  const query = normalize(search);
  return query === '' || normalize(role.name).includes(query);
};

export interface RoleGroup {
  type: CharacterType;
  roles: ScriptRole[];
}

// Groupes par type, rôles triés par nom ; les groupes vides sont retirés
export const groupByType = (roles: ScriptRole[]): RoleGroup[] =>
  CHARACTER_TYPES.map((type) => ({
    type,
    roles: roles
      .filter((role) => role.character_type === type)
      .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  })).filter((group) => group.roles.length > 0);
