---
title: Overview
description: What Oktant is, the three pillars, and the repositories that make up the platform.
---

Oktant is an engineering platform for the complete software lifecycle. It brings building, deploying, and understanding software into one environment instead of spreading the workflow across disconnected tools.

The name comes from the **octant**, an old navigational instrument used to measure angles between the horizon and objects in the sky. It stands for orientation, measurement, and finding a clear direction.

## The three pillars

| Pillar | Covers | Where it lives today |
| --- | --- | --- |
| **Build** | Code, repositories, pull request reviews, code analysis | Codehound, Core, the frontend project pages |
| **Deploy** | Infrastructure, environments, releases, production | CI Forge (library), Deployments pages in the frontend |
| **Observe** | Logs, metrics, traces, alerts, system health | Observability pages in the frontend |

Build is the most complete pillar. Deploy and Observe have their screens and data model in place, but they are not yet connected to real pipelines or health checks. The [status page](/status/) lists what works and what does not.

## Repositories

All code lives in the [oktanthq](https://github.com/oktanthq) GitHub organization.

| Repository | Language | Purpose |
| --- | --- | --- |
| [`core`](https://github.com/oktanthq/core) | Go | Platform Core: the HTTP API in front of orgs, projects, the GitHub App, and analysis jobs |
| [`codehound`](https://github.com/oktanthq/codehound) | TypeScript | Code intelligence engine and the pgmq analysis worker |
| [`frontend`](https://github.com/oktanthq/frontend) | TypeScript (Next.js) | The Oktant web app |
| [`ciforge`](https://github.com/oktanthq/ciforge) | Go | Library for CI provider APIs (GitHub Actions, GitLab CI, CircleCI) |
| [`devlogs`](https://github.com/oktanthq/devlogs) | Astro | Weekly development logs at [dev.oktant.tech](https://dev.oktant.tech) |
| [`docs`](https://github.com/oktanthq/docs) | Astro Starlight | This site |

## How the pieces talk

- The **frontend** signs users in with Supabase Auth and reads data from Supabase Postgres through row level security.
- Writes that need privileged access (connecting GitHub, creating a project, requesting an analysis) go through **Core**.
- Core puts analysis jobs on a Supabase Queues (pgmq) queue named `oktant_analysis`.
- The **Codehound worker** reads that queue, clones the repository, scans it, and writes results back to Postgres.
- The frontend shows run status live through Supabase Realtime.

The [architecture page](/architecture/) goes through this in more detail.
