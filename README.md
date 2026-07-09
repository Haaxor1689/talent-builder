# Talent Builder

Talent Builder is a Next.js app for building, sharing, and browsing custom WoW talent trees and related collections.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Bun (package manager and runtime)
- Better Auth (Discord auth integration)
- Drizzle ORM / Drizzle Kit

## Requirements

- Bun 1.3+
- A configured database URL and auth token

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Create your local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

3. Fill in values in .env.

4. Start development server:

```bash
bun dev
```

The app runs on http://localhost:3000.

## Environment Variables

The app validates required environment variables in src/env.js at startup.

Required variables (see .env.example):

- DATABASE_URL
- DATABASE_AUTH_TOKEN
- BETTER_AUTH_SECRET
- AUTH_DISCORD_ID
- AUTH_DISCORD_SECRET
- DISCORD_BOT_TOKEN
- DEPLOY_URL

Notes:

- DEPLOY_URL should be your public app URL in production.
- During local development, DEPLOY_URL can stay http://localhost:3000.

## Scripts

- bun dev: Start Next.js in development mode
- bun build: Build production assets
- bun start: Run production server
- bun lint: Run oxlint
- bun lint:fix: Run oxlint with autofix
- bun format: Format code with oxfmt

## Project Layout

- src/app: App Router routes, API handlers, and page-level loading/error boundaries
- src/components: Reusable UI and feature components (builder, calculator, collection, layout, form)
- src/server: Server-side helpers, API layer, and DB logic
- src/hooks: Custom React hooks
- src/utils: Shared utility helpers
- public: Static assets (icons, backgrounds, metadata resources)

## Linting and Formatting

Use the built-in lint and format scripts before opening a PR:

```bash
bun lint
bun format
```

## License

GPL-3.0-only. See LICENSE for details.
