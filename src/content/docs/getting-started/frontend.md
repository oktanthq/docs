---
title: Frontend
description: Run the Oktant web app locally.
sidebar:
  order: 4
---

Source: [oktanthq/frontend](https://github.com/oktanthq/frontend)

## Requirements

- Node.js 20.9.0 or newer, npm 10 or newer
- A Supabase project with the platform tables and RLS (schema comes from Core)
- [Core](/getting-started/core/) for GitHub connect, project creation, and analysis requests
- The [Codehound worker](/getting-started/codehound/) to complete analysis runs

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Never commit `.env.local`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Public origin of the app, for example `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `CORE_API_URL` | Core origin used by server actions, for example `http://localhost:8080` |
| `NEXT_PUBLIC_CORE_API_URL` | Public alias for the same Core origin. Either is enough |
| `NEXT_PUBLIC_OKTANT_DEMO_MODE` | `true` fills dashboard nav with labelled sample projects. Off by default |
| `OKTANT_DEMO_MODE` | Server-side alias for the demo flag |

Sign-in needs only the two Supabase variables. Core is required to connect GitHub, create a project, and request an analysis.

## Commands

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` / `format:check` | Prettier |
| `npm run test` | Vitest |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |

CI runs lint, typecheck, format check, and build on every pull request.
