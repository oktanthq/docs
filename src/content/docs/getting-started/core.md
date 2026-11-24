---
title: Platform Core
description: Run the Go Platform Core API locally.
sidebar:
  order: 2
---

Source: [oktanthq/core](https://github.com/oktanthq/core)

## Run

```bash
cp .env.example .env
go run ./cmd/core
```

The server listens on `:8080`. Ctrl-C stops it; in-flight requests get `CORE_SHUTDOWN_TIMEOUT` to finish.

```bash
curl -s localhost:8080/healthz
curl -s localhost:8080/v1/meta
```

Build a binary with `make build` (version defaults to `dev`; set it with `make build VERSION=1.2.3`).

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `CORE_ADDR` | `:8080` | HTTP listen address |
| `CORE_LOG_LEVEL` | `info` | `debug`, `info`, `warn`, or `error` |
| `CORE_SHUTDOWN_TIMEOUT` | `10s` | Graceful shutdown budget |
| `CORE_APP_ORIGIN` | | Web app origin allowed in GitHub callback redirects |
| `CORE_STATE_SECRET` | `SUPABASE_JWT_SECRET` | HMAC secret for the GitHub connect `state` |
| `SUPABASE_URL` | | Project URL; the JWT issuer becomes `{url}/auth/v1` |
| `SUPABASE_JWT_SECRET` | | HS256 secret for access tokens |
| `SUPABASE_SERVICE_ROLE_KEY` | | Service-role key (not used on user request paths) |
| `DATABASE_URL` | | Postgres URL. `SUPABASE_DB_URL` is an alias |
| `GITHUB_APP_ID` | | GitHub App id |
| `GITHUB_APP_PRIVATE_KEY` | | App PEM (PEM, `\n`-escaped PEM, or base64). Never logged |
| `GITHUB_APP_SLUG` | | Used to build the install URL |
| `GITHUB_APP_CALLBACK_URL` | | Public callback set on the GitHub App |
| `GITHUB_API_URL` | `https://api.github.com` | GitHub API base |
| `GITHUB_WEB_URL` | `https://github.com` | GitHub web base for install and clone URLs |

Logs are JSON on stderr. Each request line has `method`, `path`, `status`, `duration`, and `request_id`. Tokens, `Authorization` headers, and private keys are redacted.

## Database migrations

SQL lives in `supabase/migrations/`. Do not apply it from the service to a live project. Use the Supabase CLI or the SQL editor:

```bash
supabase db reset          # local only
supabase db push           # linked project, when you intend to
psql "$DATABASE_URL" -f supabase/migrations/20261114000100_platform.sql
```

Apply in order: `platform`, `analysis`, `rls`, `pgmq_realtime`.

## Development

```bash
make test
make vet
make build
```

CI runs `go build`, `go vet`, `go test -race`, and golangci-lint.

## Layout

```text
cmd/core              process entrypoint
internal/config       environment configuration
internal/auth         Supabase JWT verification
internal/githubapp    App JWT and installation tokens
internal/platform     org/project/analysis persistence
internal/queue        analysis.requested envelope
internal/project      in-memory scaffold project store
internal/httpapi      routes, middleware, JSON responses
supabase/migrations   Postgres / RLS / pgmq
```
