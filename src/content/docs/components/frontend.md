---
title: Frontend
description: Pages, organizations, project sections, and demo mode in the Oktant web app.
sidebar:
  order: 3
---

Source: [oktanthq/frontend](https://github.com/oktanthq/frontend) · setup in [Getting started → Frontend](/getting-started/frontend/)

The web app is Next.js 16 (App Router, Server Components by default), React 19, strict TypeScript, Tailwind CSS v4, and shadcn/ui-compatible components. Typography is Manrope for body text and Space Grotesk for display. Supabase email auth keeps the session in cookies, and route protection runs in `src/proxy.ts` using the Next.js 16 `proxy` convention.

## Pages

| Route                                     | Purpose                                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `/`                                       | Landing page: brand, theme toggle, account actions, tagline, pillars, and context layer                |
| `/login`                                  | Email sign-in; continues to the safe `next` path or `/dashboard`                                       |
| `/signup`                                 | Email sign-up; sets the session cookie when a session is issued, otherwise asks for email confirmation |
| `/invite`                                 | Public invite accept page. Team invites are not issued yet                                             |
| `/auth/callback`                          | OAuth callback for Google and GitHub; preserves a relative `next` path                                 |
| `/dashboard`                              | Protected signed-in home: sidebar of projects, org switcher, and recent projects                       |
| `/dashboard/projects/new`                 | Six-step wizard (details, repository, configuration, analysis, deployment, review)                     |
| `/projects`                               | Protected project list; labelled samples when the org has no rows                                      |
| `/projects/:id`                           | Project overview in a project sidebar                                                                  |
| `/projects/:id/analysis`                  | Run analysis, live run status, findings, and summaries                                                 |
| `/projects/:id/pull-requests`             | GitHub pull requests for the connected repo, joined with stored reviews                              |
| `/projects/:id/pull-requests/:prId`       | Pull request detail, reviews, and comments                                                             |
| `/projects/:id/deployments`               | Deployment history                                                                                     |
| `/projects/:id/deployments/:deploymentId` | Deployment detail and events                                                                           |
| `/projects/:id/observability`             | Monitored services                                                                                     |
| `/projects/:id/observability/:serviceId`  | Service detail and observations                                                                        |
| `/projects/:id/insights`                  | Stored insight runs, summaries, and retrieval references                                                     |
| `/projects/:id/settings`                  | Project name, description, status, and delete                                                          |


`/dashboard`, `/projects`, and everything under them are protected. A request without a valid session is redirected to `/login`.

## Organizations

- Sign-up creates a personal organization through Core's `handle_new_user` trigger.
- Team organizations appear beside it when `organization_members` has a row.
- The top bar has an organization switcher. The selected org id is kept in `localStorage` and in the `oktant-org` cookie so server components can scope project queries to `organization_id`.
- The org dashboard and the personal dashboard use the same layout; the switcher decides which organization's projects, members, and integrations are shown. Member settings are hidden on personal organizations.
- Settings → Integrations connects the org's GitHub App through Core (`POST /v1/orgs/{orgId}/integrations/github/connect`). Google sign-in linking uses Supabase Auth.

**Coming soon:** creating team organizations, sending invites, changing roles, removing members, and leaving an org. Core has no endpoints for these, and RLS does not allow authenticated inserts on `organizations` or `organization_members`. GitLab, Bitbucket, and MCP tokens are also marked Coming soon.

## Project sections

Opening a project swaps the dashboard project list for a project sidebar:

**Overview · Code Analysis · Pull Requests · Deployments · Observability · Insights · Settings**

- **Code Analysis** queues a run through Core (`POST /v1/projects/{id}/analyses`). Run history, findings, and summaries are read from Supabase, and live status comes from Realtime on `analysis_runs`.
- **Pull Requests** lists the connected repository's pull requests with any stored reviews.
- **Deployments** and **Observability** show stored rows. Deploy, redeploy, and rollback are disabled until the Deploy pillar is wired to CI Forge.
- **Settings** shows the project name, description, and status.

## Sample data and demo mode

When the current organization has no projects, `/projects` shows labelled sample cards. They are never saved.

Set `NEXT_PUBLIC_OKTANT_DEMO_MODE=true` (or the server-side `OKTANT_DEMO_MODE=true`) to also fill the dashboard navigation with those sample projects. The flag is off by default, so a fresh deployment shows only real data. It is useful for screenshots and walkthroughs without a connected repository.

## Layout notes

The signed-in app frame is a fixed-height shell (`h-dvh overflow-hidden`). The main column scrolls on its own (`min-h-0 overflow-y-auto`) and the sidebar stays full height, so long pages do not push the sidebar or the account block out of view.
