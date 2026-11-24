import type { components } from './schema';

/**
 * Schémas de l'API, générés depuis `openapi.json` du back (`npm run gen:api`, ne jamais modifier
 * `schema.d.ts` à la main). Les types des features en sont des alias : un changement de DTO côté
 * Rust casse la compilation du front au lieu de passer inaperçu.
 *
 * Un champ `Option<T>` du back apparaît facultatif (`champ?: T | null`) : l'API l'envoie toujours,
 * à `null` s'il est vide, mais le schéma ne le dit pas.
 */
export type ApiSchemas = components['schemas'];
