---
title: Codehound
description: Install Codehound, run its tests, and start the analysis worker.
sidebar:
  order: 3
---

Source: [oktanthq/codehound](https://github.com/oktanthq/codehound)

## Requirements

- Node.js 20 or later (22 recommended, see `.nvmrc`)
- npm 10 or later
- git (the worker clones repositories)

## Setup

```bash
npm install
cp .env.example .env
```

Default tests are offline. They script GitHub HTTP with `MockHttp` or talk to a local server, so they do not need a real GitHub App.

```bash
npm test
npm run typecheck
npm run lint
```

## Run the analysis worker

```bash
# set CODEHOUND_DATABASE_URL to the Supabase pooler URI (service role / postgres user)
npm run build
npm run worker        # or: node dist/cli.js worker
```

The worker exposes `GET /health` and `GET /healthz` on `CODEHOUND_HEALTH_PORT` (default `8080`).

With Docker (Node 22 + git):

```bash
docker build -t codehound .
docker run --env-file .env -p 8080:8080 codehound
```

Codehound does not apply Supabase migrations. Enable `pgmq` and create the analysis tables from Core.

## Worker settings

| Variable | Default | Purpose |
| --- | --- | --- |
| `CODEHOUND_DATABASE_URL` | | Postgres URI that bypasses RLS. Falls back to `SUPABASE_DB_URL`, then `DATABASE_URL` |
| `CODEHOUND_QUEUE_NAME` | `oktant_analysis` | pgmq queue |
| `CODEHOUND_VISIBILITY_TIMEOUT_SECONDS` | `600` | `pgmq.read` visibility timeout |
| `CODEHOUND_POLL_INTERVAL_MS` | `2000` | Idle poll interval |
| `CODEHOUND_MAX_ATTEMPTS` | `3` | Fail the run after this many reads |
| `CODEHOUND_JOB_TIMEOUT_MS` | `600000` | Per-scan wall clock cap |
| `CODEHOUND_MAX_FILE_COUNT` | `10000` | Abort the scan above this many files |
| `CODEHOUND_MAX_REPO_BYTES` | `104857600` | Abort the scan above this size |
| `CODEHOUND_MAX_FILE_BYTES` | `524288` | Skip individual files larger than this |
| `CODEHOUND_HEALTH_PORT` | `8080` | Health port (`PORT` fallback) |

Repositories over the file-count or byte caps fail with `repo_too_large`.

## Webhook server (development)

```bash
npm run build
npm start             # same as: codehound serve
```

`POST /webhooks/github` verifies `X-Hub-Signature-256`, returns `401` for a bad signature and `202` for accepted or duplicate deliveries, and sends `pull_request` events (`opened`, `synchronize`, `reopened`, `ready_for_review`) to ingestion and review. It listens on `CODEHOUND_PORT` (default `3000`). Production GitHub webhooks belong on Core.

Set `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, and `GITHUB_APP_WEBHOOK_SECRET` for this mode.

## Live GitHub tests

`npm run test:live` runs against the real GitHub API. It is skipped unless `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_APP_WEBHOOK_SECRET`, and `GITHUB_TEST_REPO` are set. When they are, it mints an installation token, lists repositories, ingests a pull request, and posts a `COMMENT` review on the sandbox repo.
