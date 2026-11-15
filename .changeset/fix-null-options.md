---
'scroll-into-view-if-needed': patch
---

Fix `scrollIntoView(target, null)` throwing a TypeError. Like the web platform tests expect, `null` now uses the default alignment (`block: 'start'`, `inline: 'nearest'`), the same as omitting the options.
