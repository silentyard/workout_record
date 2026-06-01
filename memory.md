# Development Memory

- 2026-05-31: Initial scaffold uses Next.js 16, React 19, TypeScript, App Router, SCSS, and Vercel deployment assumptions.
- 2026-05-31: User wants no Tailwind CSS; styling should be written directly in SCSS files.
- 2026-05-31: Initial placeholder routes are `/`, `/workouts/new`, and `/trends`.
- 2026-05-31: Project workflow should favor small topic-complete commits, reusable components, readable utilities, ongoing memory updates, prompt alignment reviews, and unit tests for components/utilities.
- 2026-06-02: Replaced local `data/db.json` with Supabase (PostgreSQL) + Vercel Blob.
  - Supabase tables: `body`, `exercise`, `workout_record`.
  - `configs` (SetConfig[]) stored as `jsonb` in `workout_record`; no separate sets table.
  - `notes` field added to `WorkoutRecord`.
  - Exercise images uploaded to Vercel Blob; `image_url` stored in `exercise` table.
  - DB types use snake_case matching Supabase columns (e.g. `body_id`, `exercise_id`).
  - Required env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `BLOB_READ_WRITE_TOKEN`.
  - API routes: `GET/POST /api/bodies`, `GET/POST /api/exercises`, `GET/POST /api/workout-records`.
  - `GET /api/exercises?bodyId=<uuid>` and `GET /api/workout-records?exerciseId=<uuid>` for filtered queries.
  - Server actions in `actions.ts` now delegate to `src/lib/{body,exercise,workoutRecord}.ts`.
  - Supabase SQL migration lives in `supabase/migrations/001_initial_schema.sql`.
- 2026-06-02: Implemented mobile-first RWD (primary target: mobile users).
  - Viewport: `viewportFit: 'cover'` exported from `layout.tsx` for notched phones (iPhone safe-area).
  - Safe-area insets: `.app-shell` uses `env(safe-area-inset-*)` for notched device support.
  - Touch targets: all interactive elements (buttons, inputs, selects) are ≥ 44px (Apple/Google minimum).
  - iOS zoom prevention: all inputs/selects use `font-size: 1rem` (16px) to prevent iOS auto-zoom on focus.
  - `min-height: 100dvh` used on `.app-shell` to handle browser chrome on mobile.
  - `touch-action: manipulation` on form elements removes the 300ms tap delay.
  - Breakpoint strategy: mobile-first (base = mobile), desktop enhanced at `min-width: 480px / 520px / 600px / 640px`.
  - Form layout: stacked (column) on mobile → side-by-side row at `min-width: 520px`.
  - Set-config row: CSS Grid `1fr 1fr 1fr` on mobile → `1fr 1fr 1fr auto` at `min-width: 480px`.
  - Buttons: full-width on mobile → `width: auto` at `min-width: 520px`.
