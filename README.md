# BotC-front

PWA compagnon de **Blood on the Clocktower** (React 19 · Vite · TanStack Query · SCSS modules).
L'API est dans le dépôt `BotC-back`.

## Architecture

```
src/
├── main.tsx      point d'entrée : branche l'authentification sur le client HTTP, monte l'app
├── app/          assemblage : router, layouts (AuthLayout, PublicLayout), client TanStack Query
├── pages/        écrans routés, minces : ils composent les features
├── features/
│   ├── auth/     session, connexion, profil
│   ├── scripts/  catalogue : scripts, rôles et leur vocabulaire (types, équipes, libellés, icônes)
│   └── games/    parties : lobby, distribution, nuit, jour
│       ├── api/        un fichier par domaine (games, lobby, night, day, table…) : <domaine>.api.ts
│       ├── components/ un dossier par phase : list, lobby, distribution, night, day, end,
│       │               table (outils du conteur), shared (sélecteurs, carte de rôle, messages)
│       └── types/      alias des schémas de l'API, et types propres au front
└── common/       partagé, sans aucune notion de jeu
    ├── api/        client HTTP (http.ts), erreurs de l'API (errors.ts), durées de cache (query.ts),
    │               schéma généré de l'API (schema.d.ts, api.types.ts)
    ├── components/ design system « Cadran » (design/)
    ├── config/     variables d'environnement, routes
    ├── hooks/
    ├── styles/     tokens SCSS, injectés dans chaque module par vite.config.ts
    └── utils/
```

### Règles de dépendance

Même principe que `src/common` du back : une couche n'importe que les couches en dessous d'elle.

- `app → pages → features → common`. **`common` n'importe jamais une feature** : ce qu'une feature
  doit lui fournir passe par une fonction de configuration appelée depuis `main.tsx`
  (ex. `configureHttpAuth(httpAuth)`).
- Entre features, un seul sens : `auth ← scripts ← games`.
- Le vocabulaire métier partagé (rôles, équipes) vit dans la feature qui le possède (`scripts`),
  pas dans `common`.
- Les routes sont dans `common/config` : les features naviguent sans dépendre de `app/`.

Ces règles sont vérifiées par ESLint (`no-restricted-imports`, section « Couches » de
`eslint.config.js`) : `npm run lint` échoue sur un import qui remonte les couches.

### Imports

Un alias par couche : `@app`, `@pages`, `@auth`, `@scripts`, `@games`, `@common`. Il n'y a pas
d'alias global : chaque import montre la couche qu'il vise. À l'intérieur d'une même zone (une
feature, un dossier de `common`), les imports proches sont relatifs ; un import relatif qui remonte
de trois niveaux est refusé par le lint et passe par l'alias de la zone. Dans
`games/components`, un composant importe ceux de sa phase en relatif (`../NominationCard/…`) et
tout le reste par `@games/…`.

### Types de l'API

Les types des réponses, des corps de requête et des codes d'erreur sont générés depuis la
spécification OpenAPI du back (`BotC-back/openapi.json`, écrite par `cargo run --bin openapi`) :

```bash
npm run gen:api     # BotC-back/openapi.json → src/common/api/schema.d.ts (dépôts côte à côte)
```

`schema.d.ts` est versionné et ne se modifie jamais à la main. Les features n'en exposent que des
alias (`export type Game = ApiSchemas['GameResponse']`) : un DTO modifié côté Rust casse la
compilation du front au lieu de passer inaperçu. Après un changement de l'API : `cargo run --bin
openapi` dans le back, puis `npm run gen:api` ici, et commiter les deux fichiers. Restent écrits à
la main : les types propres au front (payloads des hooks, `Session`…), le contenu JSON libre des
messages (`MessagePayload`) et les messages du WebSocket, absents de la spécification.

### Erreurs de l'API

L'API répond au format RFC 9457 avec un `code` stable (`ErrorCode`, généré depuis `error_codes!`
du back). Le front teste le code (`getErrorCode`), jamais le message, qui reste en anglais et peut
changer.

## Commandes

```bash
npm run dev         # Vite sur :5173, /api relayé vers l'API sur :8080
npm run build       # tsc + build de production
npm run gen:api     # régénère les types de l'API depuis ../BotC-back/openapi.json
npm test            # tests unitaires des fonctions pures (Vitest, fichiers *.test.ts à côté du code)
npm run validate    # lint + vérification des types + tests (comme la CI, .github/workflows/ci.yml)
npm run format      # Prettier
```
