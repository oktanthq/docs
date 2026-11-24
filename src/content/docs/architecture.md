---
title: Architecture
description: How Platform Core, Codehound, Supabase, and the frontend fit together.
---

Oktant is split into a small number of services that share one Supabase project.

```text
            ┌──────────────────────────┐
            │   Frontend (Next.js 16)  │
            │  Supabase Auth + RLS     │
            └─────┬──────────────┬─────┘
       reads (RLS)│              │ privileged writes
                  │              ▼  Bearer <Supabase access token>
                  │     ┌──────────────────┐
                  │     │ Platform Core    │  Go, net/http, :8080
                  │     │ GitHub App owner │
                  │     └────────┬─────────┘
                  │              │ one transaction:
                  │              │ insert analysis_runs (queued)
                  ▼              ▼ + pgmq.send('oktant_analysis')
            ┌──────────────────────────────┐
            │      Supabase Postgres       │
            │ tables · RLS · pgmq · Realtime│
            └──────────────┬───────────────┘
                           │ pgmq.read / pgmq.delete
                           ▼
                 ┌────────────────────┐
                 │  Codehound worker  │  Node 22 + git
                 │  clone · scan ·    │
                 │  write findings    │
                 └────────────────────┘
```

## Supabase

Supabase provides authentication, the Postgres database, the queue, and Realtime.

- **Auth.** Users sign up with email. A `handle_new_user` trigger creates their profile and a personal organization.
- **Database.** Core owns the migrations in `core/supabase/migrations/`:
  1. `20261114000100_platform.sql`: `user_profiles`, `organizations`, `organization_members`, `projects`, `integrations`, `repositories`, and the sign-up trigger.
  2. `20261114000200_analysis.sql`: `analysis_runs`, `findings`, `project_summaries`.
  3. `20261114000300_rls.sql`: the `is_org_member` helper and row level security on every table.
  4. `20261114000400_pgmq_realtime.sql`: the `oktant_analysis` pgmq queue and Realtime on the analysis tables.
- **Queue.** Supabase Queues (pgmq) carries analysis jobs from Core to Codehound.
- **Realtime.** The frontend subscribes to `analysis_runs` to show live run status.

Migrations are applied by hand with the Supabase CLI or SQL editor, never from a running service.

## Platform Core

Core is a Go service (Go 1.26.3, standard library `net/http`). It is the single backend entry point for writes that need privileges the browser should not have.

- Verifies the Supabase access token (HS256, issuer `{SUPABASE_URL}/auth/v1`) on protected routes.
- Owns the GitHub App. The App private key and installation tokens live only in Core.
- Persists org-scoped projects and repositories.
- Queues analyses. It inserts an `analysis_runs` row with status `queued` and sends an `analysis.requested` message in the same Postgres transaction, so a failed send rolls the row back.

Core never calls Codehound over HTTP. The queue is the only link between them. See the [HTTP API reference](/reference/core-api/).

## Codehound

Codehound is a TypeScript library plus two processes:

- `codehound worker` reads `oktant_analysis`, clones the repository at the requested commit with the short-lived token from the job, runs the default security pipeline, and writes `analysis_runs`, `findings`, and `project_summaries`.
- `codehound serve` is a standalone GitHub webhook listener used for development and live tests. Production webhooks belong on Core.

See [Codehound architecture](/components/codehound/) and the [queue contract](/reference/queue-contract/).

## Frontend

The web app is Next.js 16 with the App Router, React 19, Tailwind CSS v4, and Supabase SSR auth.

- Reads go straight to Supabase and are filtered by RLS.
- GitHub connect, project creation, and analysis requests go through Core (`CORE_API_URL`).
- Route protection runs in `src/proxy.ts`.

See [Frontend](/components/frontend/).

## CI Forge

CI Forge is a Go library, not a service. It wraps GitHub Actions, GitLab CI, and CircleCI APIs and is meant to back the Deploy pillar. It is not wired into Core or the frontend yet. See [CI Forge](/components/ciforge/).

## Ownership rules

- Secrets (GitHub App key, installation tokens, service-role keys) never reach the browser and are redacted from logs.
- Tenant identity (`org_id`) always comes from the job or the token, never from a git remote.
- Field names and enums in the queue contract change in both repos together.
