# Longzhen Art Products

龍振藝品品牌形象、龍宮舍利知識內容、商品展示與購買導流平台。

## Architecture

- `apps/web`: Nuxt 4 public website and admin UI
- `apps/api`: NestJS REST API
- `packages/api-contract`: shared API types
- `docs/sa-lite.md`: single source of truth for requirements

## Requirements

- Node.js 24 LTS
- npm 11+
- Docker Desktop (for PostgreSQL and object storage)

## Setup

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Apply database migrations after PostgreSQL is available:

```powershell
npm run db:deploy --workspace=api
```

## Quality checks

```powershell
npm run typecheck
npm test
npm run build
```

Deployment provider is intentionally undecided. See `docs/deployment-guide.md`.
