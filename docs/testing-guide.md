# Testing Guide

- Unit: domain rules including state visibility and recommendation order.
- Integration: database queries, pagination and public/admin DTO projections.
- E2E: health check, authentication, product visibility and non-public price leakage.
- UI: RWD viewports, keyboard navigation, reduced motion and critical GA4 events.

Migration validation includes Prisma format, schema validation, client generation, deterministic SQL generation, and successful application to the local PostgreSQL 17 development database.

The product API integration check creates a temporary category and product, uploads two images in one multipart request, reverses their order, selects a primary image, verifies media delivery, asserts that a LINE-offer public response contains no price fields, and removes all test records and files.

Authentication tests cover valid login, Bearer token creation, fifth-failure lockout, unauthenticated admin rejection, active-account lookup, and login audit records. The database integration check also performs authenticated category creation/deletion and verifies both audit actions before removing the temporary category.

The public storefront integration check creates temporary public-price and LINE-offer products, verifies category filtering and public-price-first sorting, confirms the LINE-offer response contains neither `publicPrice` nor `salePrice`, renders the Nuxt detail route through SSR, checks the homepage-only query, and removes all temporary records.

Product-detail review must also verify image order/primary-image changes, specification and tag rendering, manual recommendation priority, same-category fallback, featured fallback, and exclusion of sold-out recommendations unless explicitly enabled. Every related-product payload is passed through the same public price projection as catalog products.

Carousel review verifies that create requires distinct desktop and mobile images, invalid schedules are rejected, inactive/future/expired slides stay out of the public response, responsive images render through `<picture>`, and replacing or deleting a slide removes superseded local files.
