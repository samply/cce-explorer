# AGENTS.md

Instructions for AI coding agents working in this repo.

## Project

cce-explorer — the CCE Explorer based on Lens 2: SvelteKit 2 + Svelte 5 +
TypeScript, deployed with adapter-node via Docker. Sends CQL queries to a
Beam/Focus backend (run it with `docker compose up`, see NOTES.md).

## Commands

- Dev server: `npm run dev` (backend: `docker compose up` first)
- Lint: `npm run lint` (prettier --check + eslint)
- Format: `npm run format`
- Type-check: `npm run check` (runs `svelte-kit sync` first)
- JSON schema validation: `bash scripts/validate-json-schema.bash`
- Lint + format together: `just beautify`

## Required before every commit/push

```bash
npm run lint
npm run format
npm run check
bash scripts/validate-json-schema.bash
```

CI (Node 24, `.github/workflows/ci.yml`) runs exactly these on every push and
PR — a red CI means one of them was skipped.

## Conventions

- Formatting is enforced by prettier + eslint (`.prettierrc`,
  `eslint.config.js`); never hand-format or fight the linter — run
  `npm run format`.
- Client-exposed env vars must be `PUBLIC_*` and read via
  `src/lib/env-options.ts` (see `.env.example`). When adding a var, update
  `.env.example` with a placeholder too.
- Shared constants live in `src/lib/constants.ts`.
- `catalogue.json` is generated from old Lens `.ts` assets via
  lens-catalogue-transformer. Hand-edits are allowed but must be recorded in
  NOTES.md → Catalogue → Changes, with a date.
- `.svelte-kit/` and `build/` are generated output — never edit or commit them.
- Secrets (`LOCAL_BEAM_SECRET_SPOT` etc.) live in `.env` (gitignored). Never
  commit real values.

## Domain background

- Query pipeline: query store → AST → CQL (see NOTES.md → Analysis).
- Stratifiers/measures come from FHIR CQL libraries — background in NOTES.md.
- NOTES.md is the knowledge base: append durable findings there instead of
  creating scattered notes.
