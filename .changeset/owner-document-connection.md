---
'scroll-into-view-if-needed': patch
---

author: @feritcemkahraman

Scroll a target that is connected to another document, such as an iframe, including that document's open and closed shadow trees. The connection check uses the target's owner document, so a custom `behavior` runs for those targets. A target in a detached shadow tree still does nothing.
