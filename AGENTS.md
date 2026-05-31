<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Workout Record Project Instructions

Use these instructions for all work in this repository.

## Product Goal

Workout Record is a private fitness tracking app intended for Vercel deployment. It should let the user record workout dates, exercise names, weight, reps, sets, and related notes, then inspect trends by exercise.

## Stack And Architecture

- Use Next.js App Router, React, TypeScript, and Vercel-friendly patterns.
- Keep the `src/app` structure unless there is a strong reason to change it.
- Use SCSS files (`.scss` or `.module.scss`) for styling. Do not introduce Tailwind CSS unless the user explicitly asks to change this decision.
- Prefer server components by default. Add client components only when browser state, effects, event handlers, or client-only APIs are required.

## Workflow Requirements

- Keep commits as small as practical while preserving a complete topic in each commit. Do not create commits unless the user explicitly asks.
- Keep components reusable. Except for truly tiny components, place each component in its own file.
- Split readable utility functions into `src/lib` or another clear utility area when that keeps the code human readable.
- Maintain `memory.md`. Whenever the user mentions a new project rule, preference, decision, or constraint during development, append or update a concise note there.
- After each feature is added or each bug is fixed, review the result against the user's original project prompt and the current `memory.md` notes.
- Components and utility functions need unit tests. After each code change, run lint and the relevant tests before handing work back.
- If tests fail in an area unrelated to the current change, investigate the real cause and verify existing behavior was not broken. Do not change tests only to make them pass.

## Quality Bar

- Keep changes focused and avoid unrelated refactors.
- Prefer clear data shapes and named helpers over dense inline logic.
- Preserve user-entered workout data carefully once persistence is introduced.
- For charting, choose a library only after comparing fit for time-series exercise trends, responsive rendering, accessibility, and testability.
