# Agent Guidance

## Project

- This is an Angular 21 standalone application. The browser entry point is `src/main.ts` and the app source lives under `src/app/`.
- Prefer standalone components and direct `imports` over NgModules. Keep routing in `src/app/app.routes.ts` and global providers in `src/app/app.config.ts`.
- Static assets belong in `public/`; global styles belong in `src/styles.css`; component styles should stay with their component.

## Commands

- Install dependencies with `npm install`.
- Start the development server with `npm start`.
- Build with `npm run build`.
- Run unit tests with `npm test`.
- Run a development watch build with `npm run watch`.
- Check formatting with `npx prettier --check .`; format with `npx prettier --write .`.
- There is no configured lint script or end-to-end test framework. The `ng e2e` example in `README.md` is not currently runnable without adding tooling.

## Conventions

- TypeScript and Angular templates are strict. Preserve type safety and fix template type errors rather than weakening compiler options.
- Use two-space indentation, single quotes in TypeScript, and a 100-character Prettier print width. Follow `.editorconfig` and `.prettierrc`.
- Add or update focused Vitest/TestBed coverage for behavior changes. Keep tests close to the component or service they exercise.
- Use Angular CLI generators for new Angular artifacts when practical, then keep generated files consistent with the existing standalone style.

## Validation

- For source changes, run the narrowest relevant unit test first, then `npm run build` when the change affects compilation, templates, routing, or production configuration.
- The starter `src/app/app.spec.ts` still expects an `h1` containing `Hello, unv-cmms-web`, while the current root template only renders a router outlet. Treat that as baseline test debt and update the test or template only when the task requires it.

See [README.md](README.md) for the standard Angular CLI project overview.
