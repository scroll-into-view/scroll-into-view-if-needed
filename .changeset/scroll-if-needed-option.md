---
'scroll-into-view-if-needed': major
---

`scrollMode` is replaced by `scroll`. `scroll: 'if-needed'` scrolls only when the target isn't fully visible. `boundary` and `skipOverflowHiddenElements` work as before.

```diff
-scrollIntoView(target, { scrollMode: 'if-needed' })
+scrollIntoView(target, { scroll: 'if-needed' })
```

### Features

- `container: 'nearest'` scrolls only the target's nearest scroll container, or the viewport when it has none. The default, `'all'`, scrolls every scroll container, as before.

### Fixes

Scrolling now follows `Element.scrollIntoView()`:

- `scroll-padding` on a scroll container, and on the root element for the viewport, is part of the alignment. Percentage values are supported.
- The target's `scroll-margin` works with `block: 'center'` and `'nearest'`, and together with `scroll-padding`.
- `scroll: 'if-needed'` treats a target as visible only when its `scroll-margin` box is inside the `scroll-padding`. A target behind a fixed header covered by `scroll-padding-top` is scrolled into view.
- `nearest` is measured from the padding edge of a scroll container that has borders.
- `block` and `inline` follow the target's `writing-mode` and `direction`. For example, `inline: 'start'` aligns a right-to-left target to its right edge, and `block: 'start'` aligns a `vertical-rl` target to its right edge. Horizontal left-to-right targets are unchanged.
- Scroll containers that overflow to the left or the top use the negative `left` and `top` offsets browsers use, and a scrollbar on the left is accounted for.
- A target in a same-origin iframe also scrolls the parent document, up to the top-level page. Cross-origin parents are left alone. A `position: fixed` target inside a frame scrolls only the parent document.
- In a scroll snap container, the target lands on its own snap position, and outer scroll containers align it from there.
- The document body is scrolled when it is the scroll container, including when the root element's overflow is not `visible`.
- `overflow: visible` elements inside an iframe are no longer scrolled. Only the frame's viewport is.
- Only scroll containers in the target's containing block chain are scrolled. An absolutely or fixed positioned target no longer moves ancestors it isn't laid out in, and the viewport is not scrolled for a fixed target.
- The viewport is scrolled when the target is the scrolling element, or the root element in quirks mode.
- A slotted target also scrolls the scroll containers in the shadow tree it is laid out in.
- A target inside a frame is measured against that frame's viewport, including when the scroll is started from the parent document.
