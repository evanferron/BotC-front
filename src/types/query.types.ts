import '@tanstack/react-query';

// Message d'erreur affiché en toast par le QueryCache quand une lecture échoue
interface QueryMeta extends Record<string, unknown> {
  errorMessage?: string;
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: QueryMeta;
  }
}
