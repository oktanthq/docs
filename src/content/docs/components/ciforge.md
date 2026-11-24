---
title: CI Forge
description: The Go library Oktant uses to talk to CI provider APIs.
sidebar:
  order: 2
---

Source: [oktanthq/ciforge](https://github.com/oktanthq/ciforge)

CI Forge (`ciforge`) is a Go library for CI provider APIs. It is the groundwork for the Deploy pillar. Each provider is its own package, and they share an internal HTTP client (`provider/internal/httpclient`) for authentication, request execution, and error mapping. Common failures map to `ErrUnauthorized`, `ErrNotFound`, and `ErrRateLimited`.

It is a library, not a service. Nothing in Core or the frontend calls it yet; wiring the Deployments pages to CI Forge pipeline runs is planned.

## Providers

| Provider | Package | Status | Auth header |
| --- | --- | --- | --- |
| GitHub Actions | `provider/github` | Supported | `Authorization: Bearer` |
| GitLab CI | `provider/gitlab` | Supported | `PRIVATE-TOKEN` |
| CircleCI | `provider/circleci` | Supported | `Circle-Token` |
| Jenkins | `provider/jenkins` | Planned (empty placeholder) | |

There is no unified SDK interface yet. You import a provider and call its methods directly.

## Installation

```bash
go get github.com/oktanthq/ciforge
```

Import a provider:

```go
import (
    gh "github.com/oktanthq/ciforge/provider/github"
    gl "github.com/oktanthq/ciforge/provider/gitlab"
    cci "github.com/oktanthq/ciforge/provider/circleci"
)
```

Requires Go 1.26.3 or later (see `go.mod`).

## Quick start

Every provider is constructed with `New(token)` plus optional `WithHTTPClient` and `WithBaseURL`. A client is safe to reuse.

### GitHub Actions

```go
package main

import (
    "context"
    "fmt"
    "log"
    "os"

    gh "github.com/oktanthq/ciforge/provider/github"
)

func main() {
    client := gh.New(os.Getenv("GITHUB_TOKEN"))
    // Optional: gh.New(token, gh.WithHTTPClient(httpClient), gh.WithBaseURL("https://github.example.com/api/v3"))

    ctx := context.Background()
    owner, repo := "owner", "repo"

    workflows, err := client.ListWorkflows(ctx, repo, owner)
    if err != nil {
        log.Fatal(err)
    }
    for _, w := range workflows {
        fmt.Printf("%s (id=%d, state=%s)\n", w.Name, w.ID, w.State)
    }

    runs, err := client.ListRunsForWorkflow(ctx, repo, owner, workflows[0].ID, gh.ListRunsForWorkflowOptions{})
    if err != nil {
        log.Fatal(err)
    }
    for _, r := range runs {
        fmt.Printf("run #%d status=%s conclusion=%s\n", r.RunNumber, r.Status, r.Conclusion)
    }
}
```

See [`examples/github/main.go`](https://github.com/oktanthq/ciforge/tree/main/examples/github/main.go) and [`provider/github/README.md`](https://github.com/oktanthq/ciforge/tree/main/provider/github/README.md) for workflows, runs, jobs, artifacts, logs, and concurrency groups.

### GitLab CI

The GitLab client's default base URL is `https://gitlab.example.com/api/v4`. Point it at gitlab.com (or your instance) with `WithBaseURL`.

```go
package main

import (
    "context"
    "fmt"
    "log"
    "os"

    gl "github.com/oktanthq/ciforge/provider/gitlab"
)

func main() {
    client := gl.New(os.Getenv("GITLAB_TOKEN"),
        gl.WithBaseURL("https://gitlab.com/api/v4"),
    )

    ctx := context.Background()
    projectID := 12345

    pipelines, err := client.ListPipelines(ctx, projectID, &gl.ListPipelinesOptions{Ref: "main"})
    if err != nil {
        log.Fatal(err)
    }
    for _, p := range pipelines {
        fmt.Printf("pipeline #%d status=%s ref=%s\n", p.ID, p.Status, p.Ref)
    }

    created, err := client.CreatePipeline(ctx, projectID, "main")
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("created pipeline #%d\n", created.ID)
}
```

See [`examples/gitlab/main.go`](https://github.com/oktanthq/ciforge/tree/main/examples/gitlab/main.go) and [`provider/gitlab/README.md`](https://github.com/oktanthq/ciforge/tree/main/provider/gitlab/README.md) for pipelines, jobs, artifacts, schedules, trigger tokens, project variables, and runners.

### CircleCI

```go
package main

import (
    "context"
    "fmt"
    "log"
    "os"

    cci "github.com/oktanthq/ciforge/provider/circleci"
)

func main() {
    client := cci.New(os.Getenv("CIRCLECI_TOKEN"))
    // Optional: cci.New(token, cci.WithHTTPClient(httpClient), cci.WithBaseURL("https://circleci.com/api/v2"))

    ctx := context.Background()
    slug := "gh/org/project"

    project, err := client.GetProject(ctx, slug)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("project %s (%s)\n", project.Name, project.Slug)

    pipelines, err := client.GetAllPipelines(ctx, slug, cci.GetPipelineOptions{Branch: "main"})
    if err != nil {
        log.Fatal(err)
    }
    for _, p := range pipelines {
        fmt.Printf("pipeline #%d state=%s id=%s\n", p.Number, p.State, p.ID)
    }

    if err := client.TriggerPipeline(ctx, slug, cci.TriggerPipelineBody{Branch: "main"}); err != nil {
        log.Fatal(err)
    }
}
```

The CircleCI package also covers workflows, jobs, contexts, projects, webhooks, insights, usage, deploy, and rollback. A dedicated example and README are tracked in [#8](https://github.com/oktanthq/ciforge/issues/8).

## Tests

httptest coverage lives next to each provider:

- GitHub Actions: `provider/github/github_test`
- GitLab CI: `provider/gitlab/gitlab_test`
- CircleCI: `provider/circleci/circleci_test`

```bash
go test ./...
```

Race-detector run:

```bash
go test -race ./...
```

## Roadmap

Done: top-level README, MIT license, Go module path fixed to `github.com/oktanthq/ciforge`, httptest suites for GitLab and CircleCI, and a GitHub Actions workflow that builds, tests, and lints.

Open:

- [#7](https://github.com/oktanthq/ciforge/issues/7) Implement the Jenkins provider
- [#8](https://github.com/oktanthq/ciforge/issues/8) CircleCI example and README
- [#9](https://github.com/oktanthq/ciforge/issues/9) Rename `provider/circleci/tigger.go` to `trigger.go`
- [#10](https://github.com/oktanthq/ciforge/issues/10) Define a shared provider interface
