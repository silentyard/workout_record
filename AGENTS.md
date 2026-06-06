# Workout Record

## Project Overview
Workout Record is a private fitness tracking web application built with Next.js (App Router), React, and TypeScript. It is designed to be deployed on Vercel. The application allows users to record workout details (date, exercise, weight, reps, sets, notes) and view training trends for different exercises. Currently, it consists of a placeholder skeleton structure.

### Stack & Architecture
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Language:** TypeScript
- **Styling:** SCSS (Vanilla SCSS / Modules). **Strictly NO Tailwind CSS.**
- **Deployment:** Vercel

### Critical Framework Notice
- **Next.js Breaking Changes:** The current Next.js version may include breaking changes compared to older versions. Consult `node_modules/next/dist/docs/` for API changes and adhere to deprecation notices.

## Building and Running
To work locally with this project:

```powershell
# Install dependencies
npm install

# Run the development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Start the production server
npm run start

# Run linter
npm run lint
```

## Directory Structure Overview
- `src/proxy.ts`: Next.js 16 route protection and session refresh middleware.
- `src/app/`: Contains the Next.js App Router structure (`page.tsx`, `layout.tsx`, `globals.scss`).
  - `/`: Dashboard placeholder.
  - `/login`: Email & password login and sign up form (`page.tsx`, `AuthForm.tsx`).
  - `/auth/callback`: OAuth / Email confirmation callback handler.
  - `/settings/exercises`: Body and exercise management forms.
    - `page.tsx` — server component; fetches bodies & exercises
    - `ExerciseManager.tsx` — client component
    - `ExerciseManager.module.scss` — styles
    - `actions.ts` — server actions
  - `/workouts/new`: Workout entry form (record only).
    - `page.tsx` — server component; fetches bodies & exercises
    - `NewWorkoutForms.tsx` — client component
    - `NewWorkoutForms.module.scss` — form styles
    - `actions.ts` — server actions delegating to lib functions
  - `/trends`: Trends charts page.
    - `page.tsx` — server component; fetches all records/exercises/bodies
    - `actions.ts` — `getTrendsData()` server action
    - `TrendsPage.tsx` — client component; date filter, quick presets, tab switcher
    - `TrendsPage.module.scss` — styles
    - `charts/WeeklyFrequencyChart.tsx` — bar chart: training days per week
    - `charts/ExerciseVolumeChart.tsx` — line chart: daily volume by exercise
    - `charts/BodyVolumeChart.tsx` — line chart: daily volume by body part
  - `/api/bodies` — `GET` list / `POST` create body
  - `/api/bodies/[id]` — `PATCH` update / `DELETE` body
  - `/api/exercises` — `GET` list (optional `?bodyId`) / `POST` create (JSON or multipart+image)
  - `/api/exercises/[id]` — `PATCH` update / `DELETE` exercise
  - `/api/workout-records` — `GET` list (optional `?exerciseId`) / `POST` create
  - `/api/workout-records/[id]` — `PATCH` update / `DELETE` workout record
- `src/lib/`: Server-side utility functions.
  - `supabase/`: Sub-folder for auth clients.
    - `server.ts` — SSR client (uses cookies).
    - `client.ts` — Browser client.
  - `body.ts` — `createBody`, `listBodies`
  - `exercise.ts` — `createExercise`, `listExercises`, `listExercisesByBody`
  - `workoutRecord.ts` — `createWorkoutRecord`, `listWorkoutRecords`, `listWorkoutRecordsByExercise`
- `src/types/workout.ts`: Shared TypeScript types (`Body`, `Exercise`, `SetConfig`, `WorkoutRecord`, `Create*` inputs).
- `supabase/migrations/001_initial_schema.sql`: Initial DB schema (run in Supabase SQL editor).
- `AGENTS.md` & `CLAUDE.md`: The source of truth for agent system prompts across different tools.
- `memory.md`: An ongoing development memory log.

## Workflow
Checkout a feature branch from master, create commits while coding, and merge back using --no-ff which summarizes the work. You MUST keep commits small and topically complete.

## Development Conventions
1. **Component Design:** Prioritize Server Components by default. Use Client Components only when browser state, effects, or events are required. Keep components reusable and isolated into separate files.
2. **Styling:** Exclusively use `.scss` or `.module.scss` for styles. Do not introduce Tailwind. Use class instead of adding style props directly on elements.
3. **Utilities:** Keep utility functions readable and place them in a dedicated folder like `src/lib/`.
4. **Testing:** Write unit tests for new components and utility functions. After every code change, execute linting and tests to verify. Ensure E2E candidates (like Playwright) are evaluated for forms and charts.
5. **Memory Syncing:** Any new project rules, preferences, constraints, or findings MUST be continuously documented in `memory.md`. Categorize and update relevant sections as needed. Do not just log everything. Logs should go to changelog.md.
6. **Quality:** Avoid unrelated refactoring. Preserve data shapes and focus on high readability over terse logic. Ensure charting tools are accessible, responsive, and testable.
7. **Repository Structure**: After each feature or bug fix, update the repository structure to reflect the changes. The structure is recorded in the `Directory Structure Overview` section in AGENTS.md.