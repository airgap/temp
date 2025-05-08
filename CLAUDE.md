# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

- Build: `nx run-many --target=build --skip-nx-cache --parallel=99`
- Lint: `nx run-many --target=lint --skip-nx-cache --parallel=99`
- Test all: `nx run-many --target=test --skip-nx-cache --parallel=99`
- Run single test: `nx test project-name --testFile=filename.spec.ts`
- Format code: `prettier -w .`

## Code Style Guidelines

- **Formatting**: Uses Prettier with single quotes, tab width 2, and trailing commas
- **TypeScript**: Strict mode enabled; ESNext features; use proper type annotations
- **Imports**: Follow NX module boundaries; group imports by type/source
- **Naming**: Use camelCase for variables/functions, PascalCase for classes/interfaces
- **Components**: Svelte components use .svelte extension; React components use JSX
- **Error Handling**: Use typed error handling; prefer Either pattern over exceptions
- **Testing**: Jest for unit tests, Playwright for E2E tests, Vitest for component tests

## Project Structure

- NX monorepo with apps/, libs/ structure
- Module boundaries enforced by ESLint
- Routes follow consistent file/folder structure
