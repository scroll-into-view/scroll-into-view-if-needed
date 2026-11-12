---
'scroll-into-view-if-needed': patch
---

Remove the `engines.node` requirement added in the previous release. Requiring Node.js 26 was unintentionally breaking for consumers on older Node.js versions, and as a browser library this package has no Node.js runtime requirement ([compute-scroll-into-view#928](https://github.com/scroll-into-view/compute-scroll-into-view/issues/928))
