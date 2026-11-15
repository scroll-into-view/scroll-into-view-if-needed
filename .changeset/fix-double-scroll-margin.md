---
'scroll-into-view-if-needed': patch
---

Stop applying the target's `scroll-margin` twice. compute-scroll-into-view 3.1+ already accounts for it, so elements with a scroll margin ended up offset by double the margin.
