# Worklog

## 2026-07-15

### Done
- Confirmed RFP mapping and Full specification track.
- Selected Nuxt 4, NestJS 11, PostgreSQL and S3-compatible storage.
- Created initial workspace, requirement source and architecture documents.

### Decisions
- Deployment provider remains undecided.
- Public and admin visual systems have strict boundaries.

### Next
- Complete visual reference gate.
- Implement database schema and authentication in requirement-ID-sized increments.

## 2026-07-15 — PostgreSQL model

### Done
- Added Prisma 7 PostgreSQL schema, generated client integration, and initial SQL migration.
- Added database constraints for price, Shopee URL, recommendation, carousel window, and primary image invariants.

### Issues
- Docker is not installed; PostgreSQL 17 is used for local integration testing instead.

## 2026-07-15 — Product and multi-image API

### Done
- Added validated, paginated public/admin product APIs and admin category CRUD.
- Added multipart upload for up to 10 product images per request, verified image metadata, ordering, primary-image selection, media delivery, and file cleanup.
- Added public DTO projection tests enforcing `BR-001` for non-public prices.
- Completed a real PostgreSQL integration check with two uploaded images and removed the test data afterward.

### Decisions
- Local uploads use `apps/api/uploads/products` behind an isolated storage service.
- JPEG, PNG, WebP, 10 MB per file, and 10 files per request are provisional defaults pending the owner decision in `docs/sa-lite.md`.

### Next
- Build the administrator login UI and connect it to the protected API.

## 2026-07-15 — Administrator authentication

### Done
- Added Argon2id password hashing, 30-minute JWT authentication, active-account verification, and password-reset token invalidation.
- Protected all `/api/v1/admin/*` routes and added administrator list/create/update/reset-password endpoints.
- Added five-failure/15-minute account locking and login success/failure audit records.
- Added paginated audit-log queries and synchronous audit persistence for successful admin mutations.
- Added a CLI for safely bootstrapping independent administrator accounts without committing credentials.

### Verification
- Confirmed public health remains available and unauthenticated admin requests return 401.
- Confirmed real login, current-admin lookup, admin listing, and audit-log retrieval against PostgreSQL.
- Confirmed authenticated category create/delete produces matching audit records and cleans test data.

## 2026-07-15 — Nuxt administrator UI

### Done
- Added a standalone Element Plus admin visual system without changing the public Tailwind pages.
- Added login, session-scoped Bearer token storage, client route protection, automatic 401 logout, and responsive admin navigation.
- Added product CRUD with pagination, multi-category selection, price/status settings, image gallery actions, and a single-request multi-image uploader.
- Added category CRUD, administrator account management/password reset, and paginated audit-log pages.
- Added configured CORS between the local Nuxt and NestJS development origins.

### Verification
- Nuxt typecheck passes with strict Element Plus table/upload types.
- API health returns 200, CORS preflight returns 204, and all five admin routes return 200 from Nuxt.

### Next
- Conduct owner UI review at `/admin/login`, then refine copy, field grouping, and confirmed image limits before adding CMS/FAQ/carousel management.

## 2026-07-16 — Public storefront API integration

### Done
- Replaced static product fixtures on the homepage, product catalog, cards, and product detail with PostgreSQL-backed public APIs.
- Added active public categories, search, category filtering, pagination, newest/price sorting, and homepage selection.
- Added multi-image gallery, sale-status messaging, public price formatting, Shopee routing, LINE inquiry copy with fallback, and contact fallback.
- Added product SEO metadata, Open Graph image, and price-safe Product structured data.
- Added a database constraint and data migration ensuring non-public products cannot retain `sale_price`.

### Verification
- Confirmed public-price products sort before LINE-offer products for ascending price.
- Confirmed LINE-offer public payloads contain no public or internal price fields.
- Confirmed homepage filtering, slug detail API, and Nuxt SSR detail rendering.
- Removed all integration-test products and categories after verification.

## 2026-07-16 — Complete product content and recommendations

### Done
- Expanded the administrator product form for specifications, notices, original price, LINE inquiry copy, tags, merchandising flags, SEO fields, sold-out recommendation policy, and manual recommendations.
- Added dependency-free image ordering controls using the existing complete-order API and retained independent primary-image selection.
- Added tag persistence and recommendation persistence with validation against missing or self-referenced products.
- Added public product specifications, notices, tags, original-price display, native sharing fallback, and related-product cards.
- Implemented `BR-005` recommendation priority: manual selection, same category, then other featured products; all public related products use the price-safe projection.

### Verification
- Root Nuxt typecheck passes.
- Nest API production compilation passes.
- API unit tests pass (7/7, including related-product price privacy) and E2E tests pass (1/1).
