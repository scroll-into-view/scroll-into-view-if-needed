---
'scroll-into-view-if-needed': patch
---

Declare the supported browsers as [Baseline 2019](https://web.dev/baseline) in the `browserslist` field of `package.json`, and build for it. The bundle stays free of optional chaining and nullish coalescing, and is now checked against ES2017, the syntax level of legacy Edge 18. `src/` and `dist/index.d.ts.map` are no longer published. `dist/index.js.map` still embeds the source.
