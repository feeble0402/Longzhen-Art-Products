# Architecture

Requirements: `FR-001`–`FR-014`, with the data minimization invariant `BR-001`.

```mermaid
flowchart LR
  Visitor --> Web[Nuxt SSR Web]
  Admin --> Web
  Web --> API[NestJS REST API]
  API --> DB[(PostgreSQL)]
  API --> Media[S3-compatible storage]
  Web --> GA[GA4]
  Visitor --> LINE[Official LINE]
  Visitor --> Shopee[Shopee product page]
```

Public response DTOs are separate from admin DTOs so `BR-001` is enforced server-side. Deployment adapters keep compute, database, and storage provider-neutral.
