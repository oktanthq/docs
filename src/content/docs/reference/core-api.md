---
title: Core HTTP API
description: Endpoints, request bodies, and error format for Platform Core.
sidebar:
  order: 2
---

Platform Core serves JSON over `net/http` on `:8080` by default. Source: [oktanthq/core](https://github.com/oktanthq/core).

The `/v1/projects` routes without an org are a scaffold backed by an in-memory store; they are not persisted. Org-scoped projects, GitHub installs, and analysis runs persist in Supabase Postgres.

## Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/healthz` | no | Process is up |
| `GET` | `/readyz` | no | Process can serve traffic |
| `GET` | `/v1/meta` | no | Service name and version |
| `GET` | `/v1/projects` | no | List in-memory scaffold projects |
| `POST` | `/v1/projects` | no | Create an in-memory scaffold project |
| `GET` | `/v1/projects/{id}` | no | Fetch one scaffold project |
| `PATCH` | `/v1/projects/{id}` | no | Update name, slug, or description |
| `DELETE` | `/v1/projects/{id}` | no | Delete a scaffold project |
| `POST` | `/v1/orgs/{orgId}/integrations/github/connect` | JWT, org admin | `{ redirect_to }` → `{ authorize_url }` |
| `GET` | `/v1/integrations/github/callback` | signed `state` | Stores the GitHub installation id, then redirects |
| `POST` | `/v1/orgs/{orgId}/projects` | JWT, org member | Persist project + repository |
| `POST` | `/v1/projects/{id}/analyses` | JWT, org member | Queue a scan (`202`) |

Protected routes expect `Authorization: Bearer <supabase access token>`.

`POST /v1/orgs/{orgId}/projects` body:

```json
{
  "name": "Web Platform",
  "slug": "web-platform",
  "description": "site",
  "integration_id": "uuid",
  "code_analysis": true,
  "repo": {
    "external_id": "123",
    "full_name": "acme/web",
    "default_branch": "main",
    "is_private": false
  }
}
```

`code_analysis` defaults to true and enqueues a `project_created` scan after insert.

`POST /v1/projects/{id}/analyses` body:

```json
{
  "repository_id": "uuid",
  "commit_sha": "abc123",
  "analysis_type": "security"
}
```

`analysis_type` is `full`, `security`, or `quality` (default `security`). Omit `commit_sha` to resolve `HEAD` of the repo default branch. A second request for the same repo + SHA + type while a run is `queued` or `running` returns the existing run.

The analysis handler inserts `analysis_runs` (`queued`) and `pgmq.send`s `analysis.requested` in one transaction, with a `contents:read` installation token in the payload. See the [queue contract](/reference/queue-contract/).

`POST` and `PATCH` require `Content-Type: application/json`. Unknown JSON fields are rejected.

Errors use one envelope:

```json
{"error":{"code":"invalid_request","message":"name is required"}}
```

`code` is `invalid_request`, `unauthorized`, `forbidden`, `conflict`, `not_found`, `not_ready`, or `internal`.

Set the GitHub App callback / setup URL to `{CORE public origin}/v1/integrations/github/callback`.


## Not exposed yet

Core does not have endpoints for these yet, so the frontend either reads Supabase directly or marks the feature Coming soon:

- Organization create/update and slug availability.
- Member invites, role changes, removal, and leaving an org.
- Analysis history, findings, and summaries (the frontend reads these tables through RLS).
- Pull request listing and review publishing, deployments, and monitored services.
- An OpenAPI spec for `/v1`.
