# Project Guidelines

## Code Style
- Use TypeScript and the existing `@/*` import alias for code under `src/`.
- Follow the current separation of concerns: UI in `src/components`, data-fetching logic in `src/hooks`, external service clients in `src/lib`, shared types in `src/types`, and client state in `src/store`.
- Keep changes small and consistent with the surrounding file style; do not reformat unrelated code.

## Architecture
- This project uses Next.js App Router. Page routes live in `src/app`, including admin routes under `src/app/admin` and API routes under `src/app/api`.
- Keep Supabase service-role access and Hermes MySQL access on the server only. Do not expose credentials or direct database access in client components or hooks.
- Mercado Pago flows are handled through server routes and server-side helpers. Reuse the existing patterns in `src/app/api/mercadopago` and `src/lib/mercadoPago.ts` when extending payments.

## Build And Test
- Install dependencies with `npm install`.
- Use `npm run dev` for local development.
- Use `npm run lint` to validate changes.
- Use `npm run build` to catch production build issues when changes affect routing, server code, or environment-dependent flows.
- There is currently no automated test suite configured; do not claim tests were run unless you actually ran lint or build.

## Conventions
- Prefer extending existing hooks and API routes over introducing duplicate fetching layers.
- For cart behavior and other client-side shared state, follow the Zustand pattern already used in `src/store/useCartStore.ts`.
- Treat Supabase Row Level Security as part of the feature. If a change requires new tables or mutations, call out the required policies and keep production security restrictions in mind.
- Preserve the current visual direction instead of inventing a new design system. See `docs/NOTAS.MD` for design notes and project constraints.
- Link to existing docs instead of duplicating setup details:
  - `README.md` for local setup and Mercado Pago environment requirements.
  - `docs/Integracion-Hermes-notas.MD` for current Hermes integration context.
  - `docs/mercadopago-supabase.sql` for Mercado Pago persistence schema.
  - `docs/NOTAS.MD` for project notes, roadmap, and Supabase policy reminders.