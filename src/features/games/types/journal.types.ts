import type { ApiSchemas } from '@common/api/api.types';

// Famille d'une ligne du journal
export type JournalCategory = ApiSchemas['JournalCategory'];

// Une ligne du journal, rédigée pour le conteur : il y voit tout, secret compris
export type JournalEntry = ApiSchemas['JournalEntry'];

// Journal, du plus récent au plus ancien, et dernière action annulable
export type Journal = ApiSchemas['JournalResponse'];
