---
'scroll-into-view-if-needed': major
---

Ship ESM only.

- The CommonJS build (`dist/index.cjs`) is removed. CommonJS code can still `require()` the package on Node.js 20.19, 22.12 and later, through `require(esm)`. That returns the module namespace, so use `require('scroll-into-view-if-needed').default`.
- `exports` now maps `.` straight to `dist/index.js`, with its `dist/index.d.ts` declarations. For tools that don't read `exports`, `main`, `module` and `types` point at the same files.
- The `source` export condition and the `source` and `typings` fields are removed.
