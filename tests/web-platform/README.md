# Historical browser fixtures

These fixtures predate the current ESM builds and retain their original UMD/Cypress wiring for reference. They are not the active conformance suite.

Current browser geometry tests and a pinned selection of upstream Web Platform Tests run in [compute-scroll-into-view](https://github.com/scroll-into-view/compute-scroll-into-view/tree/main/integration/web-platform), including margin/padding, container selection, writing modes, RTL, nearest alignment, borders, SVG, and shadow/slot traversal. That repository includes a refresh script and upstream revision/license.

This package runs `pnpm build && pnpm test` for its calling-layer regressions and `pnpm typecheck` for public types. CI now runs that test suite.
