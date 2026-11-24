// Famille d'une ligne du journal (JournalCategory côté API)
export type JournalCategory = 'Setup' | 'Night' | 'Day' | 'Correction' | 'End';

// Une ligne du journal, rédigée pour le conteur : il y voit tout, secret compris
export interface JournalEntry {
  seq: number;
  at: string;
  // « Nuit 2 », « Jour 2 », ou null hors partie
  phase: string | null;
  category: JournalCategory;
  title: string;
  detail: string | null;
  // Défait par une annulation
  undone: boolean;
}

export interface Journal {
  // Du plus récent au plus ancien
  entries: JournalEntry[];
  // Dernière action du conteur que l'on peut annuler
  undo: { label: string; at: string } | null;
}
