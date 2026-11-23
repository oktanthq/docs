---
title: What is built
description: Which parts of Oktant work today and which are still planned.
---

This page is the honest list. If a feature is not under **Working**, do not assume it works.

## Working

**Frontend**

- Email sign-up and sign-in with Supabase Auth, session in cookies, protected routes.
- Personal organization created on sign-up, and an organization switcher that scopes project lists.
- Connecting the GitHub App for an organization through Core.
- Six-step create-project wizard that persists the project and repository through Core.
- Running a Codehound analysis from the Code Analysis page, with live run status and findings.
- Project pages for pull requests, deployments, observability, insights, and settings, reading from Supabase tables.
- Labelled sample projects when an organization has none, plus an opt-in demo mode.

**Core**

- Go HTTP API with health, readiness, and meta endpoints.
- Supabase JWT verification on protected routes.
- Org-scoped project creation, GitHub App connect and callback, and analysis requests.
- GitHub App installation tokens minted in Core only.
- Supabase migrations for platform tables, analysis tables, RLS, and the `oktant_analysis` queue.

**Codehound**

- GitHub App integration, ingestion, language detection, and webhooks.
- Static analysis for TypeScript and JavaScript.
- Retrieval (semantic, BM25, hybrid), the Code Intelligence Model graph, and an MCP server over stdio.
- Pull request review, code-change suggestions, and a vulnerability assessment pipeline.
- The pgmq worker that runs the security pipeline for `analysis.requested` jobs.

**CI Forge**

- Go clients for GitHub Actions, GitLab CI, and CircleCI, with httptest coverage and a CI workflow.

## Not built yet

- **Deploy:** triggering real deployments. Deploy, redeploy, and rollback buttons are disabled. Wiring Deployments to CI Forge pipeline runs is planned.
- **Observe:** real health checks and metrics charts. The pages show stored rows only.
- **Team organizations:** creating team orgs, invites, role changes, and removing members. Core has no endpoints for these yet, so the UI marks them Coming soon.
- **Project persistence gaps:** the live slug availability check and saving project settings are still in progress.
- **Integrations:** GitLab, Bitbucket, and MCP tokens are marked Coming soon.
- **In-app pull request review flow** and an **ask-the-codebase** panel on Insights.
- **Hosted backends for Codehound:** embeddings, vector storage, and the CIM store use local in-memory implementations. Only TypeScript and JavaScript have a language adapter.
- **CI Forge:** the Jenkins provider and a shared provider interface.
- **Core:** an event bus beyond the analysis queue, an OpenAPI spec, and analysis history endpoints. The frontend reads history and findings directly from Supabase for now.
