---
title: Run the full stack
description: Run the frontend, Platform Core, and the Codehound worker together against one Supabase project.
sidebar:
  order: 1
---

To see an analysis go from a button click to findings on screen you need four things running against the same Supabase project: the database, Core, the Codehound worker, and the frontend.

## Requirements

| Tool | Version | Used by |
| --- | --- | --- |
| Go | 1.26.3 or later | Core, CI Forge |
| Node.js | 20.9.0 or later (22 recommended for Codehound) | Frontend, Codehound, this site |
| npm | 10 or later | Frontend, Codehound |
| git | any recent version | Codehound worker (clones repositories) |
| Supabase project | with `pgmq` enabled | everything |
| GitHub App | id, private key, slug | Core |

## Steps

1. **Database.** Apply Core's migrations to your Supabase project in order (`core/supabase/migrations/`). Enable the `pgmq` extension in the Supabase dashboard if `CREATE EXTENSION pgmq` is denied. See [Core setup](/getting-started/core/).
2. **Core.** Copy `.env.example` to `.env`, set `SUPABASE_URL`, `SUPABASE_JWT_SECRET`, `DATABASE_URL`, `CORE_APP_ORIGIN=http://localhost:3000`, and the GitHub App variables, then run `go run ./cmd/core`. It listens on `:8080`.
3. **GitHub App.** Set the App's callback / setup URL to `{Core public origin}/v1/integrations/github/callback`.
4. **Codehound worker.** Set `CODEHOUND_DATABASE_URL` to the Supabase pooler URI (service role / postgres user), then `npm run build && npm run worker`. See [Codehound setup](/getting-started/codehound/).
5. **Frontend.** In `.env.local`, set the Supabase URL and publishable key and `CORE_API_URL=http://localhost:8080`, then `npm run dev`. See [Frontend setup](/getting-started/frontend/).
6. Open `http://localhost:3000`, sign up, connect GitHub for your personal organization, create a project, open **Code Analysis**, and click **Run analysis**.

## What fails when a piece is missing

- **No Core:** GitHub connect and project creation fail with a configuration error.
- **No worker:** a run stays `queued` until something reads `oktant_analysis`.
- **No `DATABASE_URL` or `SUPABASE_JWT_SECRET` in Core:** health and meta endpoints work, but org, GitHub, and analysis routes return `503`.

## Optional seed data

To fill the deployments, observability, and insight pages for a project you already created, run `frontend/supabase/seed.sql` in the SQL editor. Call `set_config('oktant.seed_project_id', '<uuid>', true)` first to target a specific project; otherwise it uses the latest `projects` row.
