---
'scroll-into-view-if-needed': major
---

Replace the `scrollMode: 'if-needed'` option with `scroll: 'if-needed'`, built on compute-scroll-into-view's middleware. The compute-scroll-into-view dependency moves from `^3.2.2` to `^4.0.0` before release, the first version with middleware.

- `compute` is imported from `compute-scroll-into-view`, and `boundary`, `skipOverflowHiddenElements` and `onlyIfNeeded` from `compute-scroll-into-view/middleware`.
- `compute` now gets only `block`, `inline` and `container`, plus a `middleware` array built from the options. In order: `boundary(boundary)` when `boundary` is set, `skipOverflowHiddenElements()` when that option is `true`, and `onlyIfNeeded()` last for `scroll: 'if-needed'`.
- `scrollMode` is no longer accepted. `boundary` and `skipOverflowHiddenElements` work as before.
- A custom `behavior` callback gets the actions after the middleware has run.
- The new `container` option (`'all' | 'nearest'`) from compute-scroll-into-view 4.0.0 is passed on.
- `src` is no longer published, and neither are declaration maps, which pointed at it. `dist/index.js.map` still embeds the source.

```diff
-scrollIntoView(target, { scrollMode: 'if-needed' })
+scrollIntoView(target, { scroll: 'if-needed' })
```
