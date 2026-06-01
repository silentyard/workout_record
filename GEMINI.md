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
- `src/app/`: Contains the Next.js App Router structure (`page.tsx`, `layout.tsx`, `globals.scss`).
  - `/`: Dashboard placeholder.
  - `/workouts/new`: Form placeholder for new workout entry.
  - `/trends`: Chart/trends placeholder.
- `AGENTS.md` & `CLAUDE.md`: The source of truth for agent system prompts across different tools.
- `memory.md`: An ongoing development memory log.

## Development Conventions
1. **Component Design:** Prioritize Server Components by default. Use Client Components only when browser state, effects, or events are required. Keep components reusable and isolated into separate files.
2. **Styling:** Exclusively use `.scss` or `.module.scss` for styles. Do not introduce Tailwind.
3. **Utilities:** Keep utility functions readable and place them in a dedicated folder like `src/lib/`.
4. **Testing:** Write unit tests for new components and utility functions. After every code change, execute linting and tests to verify. Ensure E2E candidates (like Playwright) are evaluated for forms and charts.
5. **Workflow:** Keep commits small and topically complete. Do not commit unless explicitly asked by the user. 
6. **Memory Syncing:** Any new project rules, preferences, constraints, or findings MUST be continuously documented in `memory.md`.
7. **Quality:** Avoid unrelated refactoring. Preserve data shapes and focus on high readability over terse logic. Ensure charting tools are accessible, responsive, and testable.
