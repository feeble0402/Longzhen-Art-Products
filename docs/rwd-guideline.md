# RWD Guideline

Use mobile-first Tailwind breakpoints as the single breakpoint system. Test 375, 390, 430, 768, 1024, 1280 and 1440 px plus 200% browser zoom. Mobile navigation becomes a drawer; admin tables become cards or controlled horizontal scrollers; forms become single-column; images use `srcset`, `sizes`, fixed dimensions and lazy loading.

The admin layout uses Element Plus only under `/admin`. At 760 px and below, the fixed sidebar becomes a top navigation strip, content returns to full width, forms collapse from two columns to one, and tables retain controlled horizontal scrolling rather than shrinking fields below usable sizes.
