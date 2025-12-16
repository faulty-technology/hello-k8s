## Architecture Overview

```mermaid
flowchart TB
    subgraph Internet
        GH[GitHub Actions]
        CF[Cloudflare Edge]
    end

    subgraph Unraid["Unraid Server (NUC)"]
        subgraph ExistingServices["Existing Services (Untouched)"]
            DC[Docker Compose Services]
        end

        subgraph K3sVM["k3s VM (Ubuntu)"]
            TS[Tailscale]

            subgraph K3s["k3s Cluster"]
                Traefik[Traefik Ingress]
                CFT[Cloudflare Tunnel Pod]

                subgraph Namespaces
                    Prod[production namespace]
                    PR1[hello-k8s-pr-123 namespace]
                    PR2[hello-k8s-pr-456 namespace]
                end

                PG[(PostgreSQL)]
            end
        end
    end

    CF -->|Public Traffic| CFT
    CFT --> Traefik
    Traefik --> Namespaces
    GH -.->|Joins Tailnet| TS
    TS -->|kubectl deploy| K3s
```

### Cloudflare Tunnel Deployment

Cloudflare Tunnel creates an outbound-only connection from the cluster to Cloudflare's edge. No ports to open, no IP to expose.

```mermaid
sequenceDiagram
    participant User
    participant Cloudflare
    participant Tunnel Pod
    participant Traefik
    participant App Pod

    User->>Cloudflare: https://app.yourdomain.com
    Note over Cloudflare: DNS points to Cloudflare
    Cloudflare->>Tunnel Pod: Route via tunnel
    Tunnel Pod->>Traefik: Forward to ingress
    Traefik->>App Pod: Route based on Host header
    App Pod-->>User: Response flows back
```

### Preview Environment Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant GA as GitHub Actions
    participant K8s as k3s Cluster
    participant CF as Cloudflare

    Dev->>GH: Open PR #123
    GH->>GA: Trigger preview workflow
    GA->>GA: Build image (tag: pr-123)
    GA->>K8s: Create namespace {app-name}-pr-123
    GA->>K8s: Deploy app to {app-name}-pr-123
    GA->>CF: Tunnel routes {app-name}-pr-123-preview.*
    GA->>GH: Comment with preview URL

    Note over Dev,CF: Developer tests at {app-name}-pr-123-preview.yourdomain.com

    Dev->>GH: Merge PR
    GH->>GA: Trigger cleanup workflow
    GA->>K8s: Delete namespace {app-name}-pr-123
```
