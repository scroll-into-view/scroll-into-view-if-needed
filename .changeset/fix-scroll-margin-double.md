---
'scroll-into-view-if-needed': patch
---

Fix `scroll-margin` being applied twice. `compute-scroll-into-view` v3.1.0 and later already accounts for `scroll-margin`, so the extra adjustment made the scroll position wrong for every `block` and `inline` value.
