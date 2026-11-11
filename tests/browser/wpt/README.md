# Native scroll promise WPT snapshot

These unmodified upstream fixtures and helpers are pinned in `manifest.json`; the upstream BSD license is included. Run `pnpm build && pnpm test:browser`.

The browser runner serves these files locally and substitutes only `Element.scrollIntoView` with the built ponyfill at runtime. It checks every scrollIntoView assertion, including completion, interruption through nested scrollers, and removal. Other scroll methods remain native: their failures are printed as diagnostics, not attributed to this package. Chrome 156 currently fails the native-only `Element.scrollBy promise after iframe removal` case; that method is never patched by the test adapter.

The tests skip with an explicit reason when native scroll promises are unavailable. `PUPPETEER_EXECUTABLE_PATH` selects a browser, and `PUPPETEER_NO_SANDBOX=1` supports environments that require it. `COMPUTE_SCROLL_INTO_VIEW_PATH` can point to a locally built engine for cross-repository integration testing.

Refresh the exact selection with `node scripts/update-web-platform.mjs <upstream-commit-sha>`, review changes, and rerun on a browser with native scroll promises. Geometry and animation promises are tested separately; passing these assertions does not mean the entire upstream CSSOM suite passes.
