# Expo + TypeScript Starter (SDK 51)

This repo bootstraps an Expo SDK 51 app with TypeScript and foundational tooling.

## Features

- TypeScript with strict tsconfig
- React Navigation (Native Stack + Bottom Tabs)
- Tamagui UI with light/dark themes
- Data: Apollo GraphQL, TanStack Query, Zustand + MMKV persistence
- Expo modules: Image, Image Picker, File System, Secure Store, Notifications (stub)
- MSW GraphQL mocks toggled by env (`USE_MOCKS`)
- Sentry (sentry-expo)
- DevX: ESLint, Prettier, Husky + lint-staged, Jest + RTL, Detox scaffold
- CI/CD: EAS config and GitHub Actions workflow skeleton

## Getting started

1. Prerequisites: Node 18+, pnpm/npm, Expo CLI (`npm i -g expo`), EAS CLI (`npm i -g eas-cli`) if you plan to build.
2. Install deps:

```bash
npm install
```

3. Configure environment:

Create `.env` from the example and adjust values.

```bash
cp .env.example .env
```

Env variables consumed by the app (via `app.config.ts` -> `Constants.expoConfig.extra`):

- `USE_MOCKS` ("true" | "false") — start MSW GraphQL mocks in development/web
- `GRAPHQL_ENDPOINT` — your GraphQL endpoint
- `SENTRY_DSN` — Sentry DSN (optional)
- `EAS_PROJECT_ID` — EAS project id
- `SENTRY_ORG`, `SENTRY_PROJECT` — for the sentry-expo config plugin

4. Run the app:

```bash
# start metro/dev server
npm run dev

# run platform
npm run ios
npm run android
npm run web
```

## Scripts

- `dev` — expo start
- `lint` — ESLint
- `type-check` — TypeScript noEmit check
- `test` — Jest + RTL
- `codegen` — GraphQL Code Generator (using `codegen.ts`)
- `build:ios` / `build:android` — EAS build preview profile

## Project structure

- `app.config.ts` — Expo config with `extra` env values
- `src/` — source
  - `features/` — screens (Home, Topics, Compose, Notifications, Profile, PostDetail, Settings)
  - `navigation/` — navigator setup
  - `lib/` — apollo, query client, storage, env, sentry, notifications
  - `state/` — Zustand stores
  - `graphql/` — schema, operations and generated types
  - `mocks/` — MSW GraphQL mocks
  - `test/` — unit tests
- `assets/` — icons/splash and media
- `scripts/` — place your scripts here

## MSW mocks

Set `USE_MOCKS=true` in `.env` to enable MSW. In this scaffold, MSW is started only for web platform. On native, the mock startup is a no-op; you can add a custom Apollo link if needed.

## Sentry

Configure `SENTRY_DSN` in `.env` or project secrets. The `sentry-expo` config plugin is included in `app.config.ts`.

## Testing

- Unit: `npm test`
- E2E: Detox scaffold is provided, but no build pipeline is configured by default.

## CI/CD

- `eas.json` defines preview build profile
- `.github/workflows/ci.yml` lint + type-check + tests + Expo build preview (skeleton)

