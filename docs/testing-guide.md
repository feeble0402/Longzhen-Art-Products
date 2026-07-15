# Testing Guide

- Unit: domain rules including state visibility and recommendation order.
- Integration: database queries, pagination and public/admin DTO projections.
- E2E: health check, authentication, product visibility and non-public price leakage.
- UI: RWD viewports, keyboard navigation, reduced motion and critical GA4 events.

Migration validation includes Prisma format, schema validation, client generation, deterministic SQL generation, and successful application to the local PostgreSQL 17 development database.

The product API integration check creates a temporary category and product, uploads two images in one multipart request, reverses their order, selects a primary image, verifies media delivery, asserts that a LINE-offer public response contains no price fields, and removes all test records and files.

Authentication tests cover valid login, Bearer token creation, fifth-failure lockout, unauthenticated admin rejection, active-account lookup, and login audit records. The database integration check also performs authenticated category creation/deletion and verifies both audit actions before removing the temporary category.
