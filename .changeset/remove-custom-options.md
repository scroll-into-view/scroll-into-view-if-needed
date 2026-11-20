---
'scroll-into-view-if-needed': major
---

Remove `behavior: Function`, and the `boundary` and `skipOverflowHiddenElements` options.

- `behavior` is `'auto'`, `'smooth'` or `'instant'`, like `Element.scrollIntoView()`, and `scrollIntoView()` always returns `undefined`. The `CustomBehaviorOptions` and `CustomScrollBehaviorCallback` types are removed, `Options` is no longer generic, and `scrollIntoView` no longer takes a type argument. To do the scrolling yourself, call `compute()` from `compute-scroll-into-view` and apply the actions it returns.
- `boundary` is removed. Use `container: 'nearest'` to scroll only the nearest scroll container, or the `boundary()` middleware from `scroll-into-view-if-needed/middleware` to stop further out.
- `skipOverflowHiddenElements` is removed. Use the `skipOverflowHiddenElements()` middleware from `scroll-into-view-if-needed/middleware`.

```diff
-import scrollIntoView from 'scroll-into-view-if-needed'
+import { compute } from 'compute-scroll-into-view'
+import { onlyIfNeeded } from 'compute-scroll-into-view/middleware'

-scrollIntoView(node, {
-  block: 'nearest',
-  scroll: 'if-needed',
-  behavior: (actions) =>
-    actions.forEach(({ el, top, left }) => {
-      el.scrollTop = top
-      el.scrollLeft = left
-    }),
-})
+if (node.isConnected) {
+  compute(node, { block: 'nearest', middleware: [onlyIfNeeded()] }).forEach(
+    ({ el, top, left }) => {
+      el.scrollTop = top
+      el.scrollLeft = left
+    },
+  )
+}
```

```diff
+import { skipOverflowHiddenElements } from 'scroll-into-view-if-needed/middleware'
-scrollIntoView(node, { boundary: list, skipOverflowHiddenElements: true })
+scrollIntoView(node, {
+  container: 'nearest',
+  middleware: [skipOverflowHiddenElements()],
+})
```
