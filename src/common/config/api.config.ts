export const ENV = import.meta.env.VITE_ENV ?? (import.meta.env.DEV ? 'DEV' : 'PROD');

// Préfixe de l'API Rust (BotC-back). En dev, Vite le redirige vers http://127.0.0.1:8080.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
