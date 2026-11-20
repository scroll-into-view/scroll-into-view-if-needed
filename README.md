[![npm stat](https://img.shields.io/npm/dm/scroll-into-view-if-needed.svg?style=flat-square)](https://npm-stat.com/charts.html?package=scroll-into-view-if-needed)
[![npm version](https://img.shields.io/npm/v/scroll-into-view-if-needed.svg?style=flat-square)](https://www.npmjs.com/package/scroll-into-view-if-needed)
[![gzip size][gzip-badge]][unpkg-dist]
[![size][size-badge]][unpkg-dist]

![scroll-into-view-if-needed](https://user-images.githubusercontent.com/81981/39476436-34a4f3ae-4d5c-11e8-9d1c-7fa2fa6288a0.png)

This used to be a [ponyfill](https://ponyfill.com) for
`Element.scrollIntoViewIfNeeded`. Since then the CSS working group have decided to implement its features in `Element.scrollIntoView` as the option `scrollMode: "if-needed"`. Thus this library got rewritten to implement that spec instead of the non-standard one. The option is called `scroll: 'if-needed'` here.

Besides ponyfilling `Element.scrollIntoView`, the [`middleware`](#middleware) option is the escape hatch for everything the spec doesn't cover. It is where features that go beyond ponyfilling official spec proposals live, like `boundary`, `skipOverflowHiddenElements` and scrolling a text range into view, and where your own customizations go.

- [Demo](#demo)
- [Install](#install)
- [Usage](#usage)
  - [Ponyfill smooth scrolling](#ponyfill-smooth-scrolling)
    - [Load time](#load-time)
    - [Consistency](#consistency)
    - [Quality](#quality)
- [API](#api)
  - [scrollIntoView(target, \[options\])](#scrollintoviewtarget-options)
  - [options](#options)
    - [scroll](#scroll)
    - [block](#block)
    - [inline](#inline)
    - [container](#container)
    - [behavior](#behavior)
      - [`'auto'`](#auto)
      - [`'smooth'`](#smooth)
      - [`'instant'`](#instant)
    - [middleware](#middleware)
  - [scroll-margin](#scroll-margin)
  - [scroll-padding](#scroll-padding)
- [Middleware](#middleware-1)
  - [Scroll a text range into view](#scroll-a-text-range-into-view)
  - [Write your own middleware](#write-your-own-middleware)
- [TypeScript support](#typescript-support)
- [Migrate](#migrate)
  - [Breaking API changes from v3](#breaking-api-changes-from-v3)
    - [`behavior: Function`](#behavior-function)
    - [`boundary`](#boundary)
    - [`skipOverflowHiddenElements`](#skipoverflowhiddenelements)
    - [`scrollMode`](#scrollmode)
  - [Breaking API changes from v2](#breaking-api-changes-from-v2)
    - [UMD build](#umd-build)
    - [Modern syntax](#modern-syntax)
    - [TypeScript `Options`](#typescript-options)
  - [Breaking API changes from v1](#breaking-api-changes-from-v1)
    - [v1](#v1)
    - [v2](#v2)
    - [centerIfNeeded](#centerifneeded)
      - [v1](#v1-1)
      - [v2](#v2-1)
    - [duration](#duration)
      - [v1](#v1-2)
      - [v2](#v2-2)
    - [easing](#easing)
    - [handleScroll](#handlescroll)
    - [offset](#offset)
    - [scrollIntoViewIfNeeded(target, \[centerIfNeeded\], \[animateOptions\], \[finalElement\], \[offsetOptions\])](#scrollintoviewifneededtarget-centerifneeded-animateoptions-finalelement-offsetoptions)
- [Related packages](#related-packages)
- [Who's using this](#whos-using-this)
- [Development](#development)

# [Demo](https://scroll-into-view.dev)

# Install

```bash
npm i scroll-into-view-if-needed
```

The package is ESM-only. CommonJS code can still `require()` it on Node.js 20.19, 22.12 and later, through `require('scroll-into-view-if-needed').default`.

You can also use it from a CDN:

```js
const { default: scrollIntoView } =
  await import('https://esm.sh/scroll-into-view-if-needed')
```

The published code supports [Baseline 2019](https://web.dev/baseline) browsers (Chrome 66, Edge 18, Firefox 65 and Safari 13, and newer), as declared in the `browserslist` field of `package.json`. It's compiled to ES2017 syntax, without optional chaining or nullish coalescing, so it works in older bundlers like Webpack 4 without transpiling it.

# Usage

```js
import scrollIntoView from 'scroll-into-view-if-needed'

const node = document.getElementById('hero')

// similar behavior as Element.scrollIntoView({block: "nearest", inline: "nearest"})
// only that it is a no-op if `node` is already visible
// see: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
// same behavior as Element.scrollIntoViewIfNeeded()
// see: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded
scrollIntoView(node, {
  scroll: 'if-needed',
  block: 'nearest',
  inline: 'nearest',
})

// same behavior as Element.scrollIntoViewIfNeeded(true) without the "IfNeeded" behavior
// see: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded
scrollIntoView(node, { block: 'center', inline: 'center' })
// scroll is "always" by default

// smooth scroll if the browser supports it and if the element isn't visible
scrollIntoView(node, { behavior: 'smooth', scroll: 'if-needed' })
```

## Ponyfill smooth scrolling

What does ponyfilling smooth scrolling mean, and why is it implemented in [`smooth-scroll-into-view-if-needed`](https://github.com/scroll-into-view/smooth-scroll-into-view-if-needed) instead?
The answer is bundlesize. If this package adds smooth scrolling to browsers that are missing it then the overall bundlesize increases regardless of whether you use this feature or not.

Put it this way:

```js
import scrollIntoView from 'scroll-into-view-if-needed'
// Even if all you do is this
scrollIntoView(node, { scroll: 'if-needed' })
// You would end up with the same bundlesize as people who need
// smooth scrolling to work in browsers that don't support it natively
scrollIntoView(node, { behavior: 'smooth', scroll: 'if-needed' })
```

That's why only native smooth scrolling is supported out of the box. Native smooth scrolling is supported in all modern browsers (Safari added it in 15.4), but the way it animates differs between browsers. Below are three ways to approach it, which one is best for you depends on what is the most important to your use case: load time, consistency or quality.

### Load time

In many scenarios smooth scrolling can be used as a progressive enhancement. If the user is on a browser that doesn't implement smooth scrolling it'll simply scroll instantly and your bundlesize is only as large as it has to be.

```js
import scrollIntoView from 'scroll-into-view-if-needed'

scrollIntoView(node, { behavior: 'smooth' })
```

### Consistency

If a consistent smooth scrolling experience is a priority and you really don't want any surprises between different browsers and environments. In other words don't want to be affected by how a vendor might implement native smooth scrolling, then [`smooth-scroll-into-view-if-needed`](https://github.com/scroll-into-view/smooth-scroll-into-view-if-needed) is your best option. It ensures the same smooth scrolling experience for every browser.

```js
import smoothScrollIntoView from 'smooth-scroll-into-view-if-needed'

smoothScrollIntoView(node, { behavior: 'smooth' })
```

### Quality

If you want to use native smooth scrolling when it's available, and fallback to the smooth scrolling ponyfill:

```js
import scrollIntoView from 'scroll-into-view-if-needed'
import smoothScrollIntoView from 'smooth-scroll-into-view-if-needed'

const scrollIntoViewSmoothly =
  'scrollBehavior' in document.documentElement.style
    ? scrollIntoView
    : smoothScrollIntoView

scrollIntoViewSmoothly(node, { behavior: 'smooth' })
```

# API

## scrollIntoView(target, [options])

> New API introduced in `v1.3.0`

## options

Type: `Object`

### [scroll](https://scroll-into-view.dev/#scrolling-if-needed)

Type: `'always' | 'if-needed'`<br> Default: `'always'`

> Introduced in `v4.0.0`

`'if-needed'` only scrolls when the target isn't fully visible, like `Element.scrollIntoViewIfNeeded`. It runs after your [`middleware`](#middleware), so it checks what is left to scroll.

`scrollMode` does the same thing and still works. It is deprecated and will be removed in the next major version. Use `scroll` instead. When both are set, `scroll` is used.

### [block](https://scroll-into-view.dev/#scroll-alignment)

Type: `'start' | 'center' | 'end' | 'nearest'`<br> Default: `'center'`

> Introduced in `v2.1.0`

If `options` is omitted, `true`, or an empty object, then `block: 'start'` is used to match `Element.scrollIntoView()`. If `options` is `false` then `block: 'end'` is used (the legacy `alignToTop` argument).

[More info.](https://github.com/scroll-into-view/compute-scroll-into-view#block)

### [inline](https://scroll-into-view.dev/#scroll-alignment)

Type: `'start' | 'center' | 'end' | 'nearest'`<br> Default: `'nearest'`

> Introduced in `v2.1.0`

[More info.](https://github.com/scroll-into-view/compute-scroll-into-view#inline)

### container

Type: `'all' | 'nearest'`<br> Default: `'all'`

> Introduced in `v4.0.0`

`'nearest'` only scrolls the nearest scroll container, like the `container` option of `Element.scrollIntoView`.

### behavior

Type: `'auto' | 'smooth' | 'instant'`<br> Default: `'auto'`

> Introduced in `v2.1.0`

#### `'auto'`

The auto option unlocks a few interesting opportunities.
The browser will decide based on user preferences whether it should smooth scroll or not.
On top of that you can control/override scrolling behavior through the [`scroll-behavior`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior) CSS property.

Some people get [motion sick from animations](https://css-tricks.com/smooth-scrolling-accessibility/#article-header-id-5). You can use CSS to turn off smooth scrolling in those cases to avoid making them dizzy:

```css
html,
.scroll-container {
  overflow: scroll;
}

html,
.scroll-container {
  scroll-behavior: smooth;
}
@media (prefers-reduced-motion) {
  html,
  .scroll-container {
    scroll-behavior: auto;
  }
}
```

#### `'smooth'`

Using `behavior: 'smooth'` is the easiest way to smooth scroll an element as it does not require any CSS, just a browser that implements it. [More information.](#ponyfill-smooth-scrolling)

#### `'instant'`

Scrolls in a single jump, even when the `scroll-behavior` CSS property is `smooth`.

To scroll with your own animation, use [`compute-scroll-into-view`](https://github.com/scroll-into-view/compute-scroll-into-view) and apply the actions it returns. See [`behavior: Function`](#behavior-function).

### middleware

Type: `Middleware[]`<br> Default: `[]`

> Introduced in `v4.0.0`

Change which scroll containers are scrolled, how they are measured, or what is aligned. Import the built-in ones, and the types for your own, from `scroll-into-view-if-needed/middleware`. [More info.](#middleware-1)

## scroll-margin

> Introduced in `v3.1.0`

The [`scroll-margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin) CSS property on the target element is respected, just like it is with the native `Element.scrollIntoView()`. This is useful for things like offsetting a sticky header:

```css
.target {
  scroll-margin-top: 64px;
}
```

## scroll-padding

> Introduced in `v4.0.0`

The [`scroll-padding`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding) CSS property on a scroll container is respected too, just like it is with the native `Element.scrollIntoView()`. Where `scroll-margin` outsets the target, `scroll-padding` insets the scrollport, the visible area of the scroll container without its scrollbars. The target's `scroll-margin` box is then aligned inside that smaller area. This is useful for things like keeping targets clear of a fixed header that covers the top of the page:

```css
html {
  scroll-padding-top: 64px;
}
```

Every scroll container uses its own `scroll-padding`. For the viewport, set it on the root element (`html`), also when the body is the element that scrolls. Lengths and percentages work. Percentages are relative to the width of the scrollport for `left` and `right`, and to its height for `top` and `bottom`. `auto` is `0`.

[`scroll: 'if-needed'`](#scroll) measures the same way, so a target only counts as visible when its `scroll-margin` box is inside the scrollport inset by `scroll-padding`. A target behind a header covered by `scroll-padding-top` is scrolled into view.

# Middleware

The core of this library follows the spec for `Element.scrollIntoView`, plus the `if-needed` proposal. Anything beyond that is middleware. It's the preferred place to extend scrolling, so features that aren't in the spec don't need their own options.

Middleware runs for each ancestor of the target, innermost first, up to the viewport. It can skip a scroll container, stop climbing, or change what is measured. Then the target is aligned with the `block` and `inline` you passed, and `behavior` does the scrolling.

```js
import scrollIntoView from 'scroll-into-view-if-needed'
import { skipOverflowHiddenElements } from 'scroll-into-view-if-needed/middleware'

scrollIntoView(node, {
  block: 'nearest',
  scroll: 'if-needed',
  middleware: [skipOverflowHiddenElements()],
})
```

They run in the order you list them, and `scroll: 'if-needed'` adds `onlyIfNeeded()` last. That means you never need to import `onlyIfNeeded` yourself, unless you want it somewhere else in the order.

Built in:

- `boundary(limit)` stops at an element, or at the first ancestor a function returns `false` for. The boundary itself is scrolled if it's a scroll container.
- `skipOverflowHiddenElements()` leaves `overflow: hidden` scroll containers alone, like Firefox's `scrollIntoView` does.
- `onlyIfNeeded()` is what `scroll: 'if-needed'` adds.
- `selection(selection, options)` aligns a text selection instead of the target.

## Scroll a text range into view

`selection()` is for editors and anything else that has to keep the caret in view. It takes a `Range` or a `Selection`, and defaults to `document.getSelection()`. A collapsed caret is measured as the character or node next to it, so empty lines and carets next to images work too.

The ancestors that get scrolled are still the target's. Pass an element inside the scroll container, like the parent element of the range, and not the scroll container itself.

```js
import scrollIntoView from 'scroll-into-view-if-needed'
import { selection } from 'scroll-into-view-if-needed/middleware'

const range = document.getSelection().getRangeAt(0)

scrollIntoView(range.startContainer.parentElement, {
  scroll: 'if-needed',
  block: 'nearest',
  inline: 'nearest',
  middleware: [selection(range)],
})
```

`scroll: 'if-needed'` runs after `selection()`, so it's the caret that decides if scrolling is needed. `options.align` picks what is aligned. `'focus'` is the default, the end of the selection where the caret is. A `Range` has no direction, so its focus is its end, pass the `Selection` for a backward one. `'bounds'` aligns the box around the whole selection:

```js
scrollIntoView(element, {
  block: 'nearest',
  middleware: [selection(range, { align: 'bounds' })],
})
```

## Write your own middleware

A middleware is an object with a `name` and an `fn`. `fn` is called for each ancestor of the target and returns `{}` to change nothing, or what to change:

- `scrollable: false` leaves this container alone. The target is still aligned in the containers outside of it.
- `stop: true` doesn't look at the ancestors of this container. The container itself is still scrolled.
- `rects` replaces measurements for the middleware after this one, and for aligning the target.

`fn` gets the `target`, the `container` it's looking at, whether that container is the `viewport`, whether it's `scrollable` so far, the `options`, and the `rects` it was measured with. `rects` has the `scrollport` of the container, the `target` box, and the `scrollPadding` and `scrollMargin` they are aligned with, as `{ top, right, bottom, left }` in pixels.

Stop at the closest element that marks a scroll root, without scrolling anything outside of it:

```ts
import scrollIntoView from 'scroll-into-view-if-needed'
import type { Middleware } from 'scroll-into-view-if-needed/middleware'

const stopAtScrollRoot: Middleware = {
  name: 'stopAtScrollRoot',
  fn: ({ container }) =>
    container.matches('[data-scroll-root]') ? { stop: true } : {},
}

scrollIntoView(node, { middleware: [stopAtScrollRoot] })
```

Keep the target clear of a sticky header, by adding to the viewport's `scroll-padding`:

```ts
import scrollIntoView from 'scroll-into-view-if-needed'
import type { Middleware } from 'scroll-into-view-if-needed/middleware'

const clearHeader = (header: Element): Middleware => ({
  name: 'clearHeader',
  fn: ({ viewport, rects }) =>
    viewport
      ? {
          rects: {
            scrollPadding: {
              ...rects.scrollPadding,
              top:
                rects.scrollPadding.top + header.getBoundingClientRect().bottom,
            },
          },
        }
      : {},
})

scrollIntoView(node, {
  scroll: 'if-needed',
  block: 'nearest',
  middleware: [clearHeader(document.querySelector('header'))],
})
```

Middleware that returns `rects` should be listed before `onlyIfNeeded()`, which then checks the changed measurements. Reading `viewportRects` calls the earlier middleware for the viewport early, so keep middleware free of side effects.

# TypeScript support

When the library itself is built on TypeScript there's no excuse for not publishing great library definitions!

TypeScript catches typos like `behavior: 'smoooth'`, and options that don't exist.

The options are available for you if you are wrapping this library in another abstraction (like a React component):

```typescript
import scrollIntoView, { type Options } from 'scroll-into-view-if-needed'

interface CustomOptions extends Options {
  onlyNearest?: boolean
}

function scrollToTarget(selector: string, options: CustomOptions = {}) {
  const { onlyNearest = false, ...scrollOptions } = options
  return scrollIntoView(document.querySelector(selector), {
    ...scrollOptions,
    container: onlyNearest ? 'nearest' : 'all',
  })
}
```

# Migrate

## Breaking API changes from v3

### `behavior: Function`

`behavior` no longer takes a function. It's `'auto'`, `'smooth'` or `'instant'`, like `Element.scrollIntoView()`. To do the scrolling yourself, call `compute()` from [`compute-scroll-into-view`](https://github.com/scroll-into-view/compute-scroll-into-view), the engine this library uses, and apply the actions it returns. Add it to your dependencies:

```bash
npm i compute-scroll-into-view
```

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
+  const actions = compute(node, {
+    block: 'nearest',
+    middleware: [onlyIfNeeded()],
+  })
+  // Innermost scroll container first, the viewport last
+  actions.forEach(({ el, top, left }) => {
+    el.scrollTop = top
+    el.scrollLeft = left
+  })
+}
```

- `compute()` returns the same actions the callback was given, and what you do with them is your own code, so return a Promise or anything else from your own function.
- `scroll: 'if-needed'` is `onlyIfNeeded()`, and goes last in `middleware`. `block`, `inline`, and `container` work the same as in `scrollIntoView()`.
- `compute()` defaults to `block: 'center'`. `scrollIntoView()` without options uses `block: 'start'`, so pass `block` to keep the same alignment.
- `scrollIntoView()` did nothing for targets that aren't in the document. `compute()` doesn't check, so check `isConnected` first.

### `boundary`

The `boundary` option is removed. Use [`container`](#container) instead. When the boundary was the target's nearest scroll container, like a list or a dialog, `container: 'nearest'` scrolls only that container and leaves the page alone:

```diff
-scrollIntoView(node, { boundary: list })
+scrollIntoView(node, { container: 'nearest' })
```

`container: 'nearest'` stops at the first scroll container. To stop further out, pass the `boundary()` middleware from `scroll-into-view-if-needed/middleware`, which takes the same element or function the option did:

```diff
+import { boundary } from 'scroll-into-view-if-needed/middleware'
-scrollIntoView(node, { boundary: dialog })
+scrollIntoView(node, { middleware: [boundary(dialog)] })
```

### `skipOverflowHiddenElements`

The `skipOverflowHiddenElements` option is removed. Pass the `skipOverflowHiddenElements()` middleware instead, it leaves `overflow: hidden` scroll containers alone the same way:

```diff
+import { skipOverflowHiddenElements } from 'scroll-into-view-if-needed/middleware'
-scrollIntoView(node, { skipOverflowHiddenElements: true })
+scrollIntoView(node, { middleware: [skipOverflowHiddenElements()] })
```

### `scrollMode`

`scrollMode` is deprecated and will be removed in the next major version. Use `scroll: 'if-needed'`:

```diff
-scrollIntoView(target, { scrollMode: 'if-needed' })
+scrollIntoView(target, { scroll: 'if-needed' })
```

## Breaking API changes from v2

v3 changed how the package is built and published, not how `scrollIntoView` behaves at runtime. Your calls keep working, but how you load the package and some type imports may need updating.

### UMD build

The UMD build is removed, and with it the `window.scrollIntoView` global. Use the ESM build from a CDN instead:

```diff
-<script src="https://unpkg.com/scroll-into-view-if-needed/umd/scroll-into-view-if-needed.min.js"></script>
+<script type="module">
+  import scrollIntoView from 'https://esm.sh/scroll-into-view-if-needed'
+</script>
```

### Modern syntax

v2 was compiled to ES5. v3 ships modern syntax with ESM as the baseline, and no longer targets Internet Explorer 11. If you still support browsers that don't understand ES modules, transpile the package in your bundler.

### TypeScript `Options`

`Options` is now a union of `StandardBehaviorOptions` and `CustomBehaviorOptions`, instead of an interface. An `interface` can't extend a union, so extend one of the two interfaces instead:

```diff
-import { Options } from 'scroll-into-view-if-needed'
+import { type StandardBehaviorOptions } from 'scroll-into-view-if-needed'

-interface CustomOptions extends Options {
+interface CustomOptions extends StandardBehaviorOptions {
   useBoundary?: boolean
 }
```

## Breaking API changes from v1

Since v1 ponyfilled Element.scrollIntoViewIfNeeded, while v2 ponyfills Element.scrollIntoView, there are breaking changes from the differences in their APIs.

The biggest difference is that the new behavior follows the spec, so the "if-needed" behavior is **not enabled by default:**

#### v1

```js
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

// Only scrolls into view if needed, and to the nearest edge
scrollIntoViewIfNeeded(target)
```

#### v2

```js
import scrollIntoView from 'scroll-into-view-if-needed'

// Must provide these options to behave the same way as v1 default
scrollIntoView(target, { block: 'nearest', scroll: 'if-needed' })
```

### centerIfNeeded

The old `Element.scrollIntoView` api only had two settings, align to top or bottom. [`Element.scrollIntoViewIfNeeded`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded) had two more, align to the center or nearest edge.
The `Element.scrollIntoView` spec now supports these two modes as `block: 'center'` and `block: 'nearest'`.
Breaking changes sucks, but on the plus side your code is now more portable and will make this library easier to delete from your codebase on the glorious day browser support is good enough.

#### v1

```js
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

// v1.3.x and later
scrollIntoViewIfNeeded(target, { centerIfNeeded: true })
scrollIntoViewIfNeeded(target, { centerIfNeeded: false })
// v1.2.x and earlier
scrollIntoViewIfNeeded(target, true)
scrollIntoViewIfNeeded(target, false)
```

#### v2

```js
import scrollIntoView from 'scroll-into-view-if-needed'

scrollIntoView(target, { block: 'center' })
scrollIntoView(target, { block: 'nearest' })
```

### duration

[More information.](#ponyfill-smooth-scrolling)

#### v1

```js
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

scrollIntoViewIfNeeded(target, { duration: 300 })
```

#### v2

```js
import scrollIntoView from 'scroll-into-view-if-needed'
// or
import scrollIntoView from 'smooth-scroll-into-view-if-needed'

scrollIntoView(target, { behavior: 'smooth' })
```

### easing

This feature is removed, but you can achieve the same thing by scrolling with the actions from [`compute()`](#behavior-function).

### handleScroll

This is replaced with [`compute()`](#behavior-function) from `compute-scroll-into-view`, with one key difference. Instead of firing once per element that should be scrolled, you get an array of every scroll at once, so you can batch and scroll multiple elements at the same time, or sync scrolling with another element.

```diff
-import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'
+import { compute } from 'compute-scroll-into-view'

-scrollIntoViewIfNeeded(node, {handleScroll: (el, {scrollTop, scrollLeft}) => {
-  el.scrollTop = scrollTop
-  el.scrollLeft = scrollLeft
-}})
+compute(node, { block: 'nearest' }).forEach(({ el, top, left }) => {
+  el.scrollTop = top
+  el.scrollLeft = left
+})
```

### offset

This was always a buggy feature and warned against using in v1 as it might get dropped.
It's much safer to use CSS wrapper elements for this kind of thing.

### scrollIntoViewIfNeeded(target, [centerIfNeeded], [animateOptions], [finalElement], [offsetOptions])

This API signature was warned to be dropped in `v2.0.0`, and it was.

# Related packages

- [compute-scroll-into-view](https://www.npmjs.com/package/compute-scroll-into-view) - the engine used by this library.
- [smooth-scroll-into-view-if-needed](https://www.npmjs.com/package/smooth-scroll-into-view-if-needed) – ponyfills smooth scrolling.
- [react-scroll-into-view-if-needed](https://www.npmjs.com/package/react-scroll-into-view-if-needed) – A thin wrapper to scroll your component into view.
- [scroll-polyfill](https://www.npmjs.com/package/scroll-polyfill) – polyfills smooth scrolling.
- [Don't be shy, add yours!](https://github.com/scroll-into-view/scroll-into-view-if-needed/edit/main/README.md)

# Who's using this

- [zeit.co/docs](https://github.com/zeit/docs) – Documentation of ZEIT Now and other services.
- [Selenium IDE](https://github.com/SeleniumHQ/selenium-ide) – An integrated development environment for Selenium scripts.
- [Box UI Elements](https://github.com/box/box-ui-elements) – Box UI Elements are pre-built UI components that allow developers to add elements of the main Box web application into their own applications.
- [react-responsive-ui](https://github.com/catamphetamine/react-responsive-ui) – Responsive React UI components.
- [Mineral UI](https://github.com/mineral-ui/mineral-ui) –
  A design system and React component library for the web that lets you quickly build high-quality, accessible apps.
- [Covalent](https://github.com/Teradata/covalent) – Teradata UI Platform built on Angular Material.
- [docs.expo.io](https://github.com/expo/expo-docs) – Documentation for Expo, its SDK, client and services.
- [Add yourself to the list 😉](https://github.com/scroll-into-view/scroll-into-view-if-needed/edit/main/README.md)

[gzip-badge]: https://img.shields.io/bundlephobia/minzip/scroll-into-view-if-needed?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/scroll-into-view-if-needed?label=size&style=flat-square
[unpkg-dist]: https://unpkg.com/scroll-into-view-if-needed/dist/

# Development

The project uses [Vite+](https://viteplus.dev). Install dependencies with `vp install`, then:

- `vp test` runs the unit tests (jsdom) and the browser tests (Chromium through Playwright, run `vp exec playwright install chromium` once first). Add `--coverage` for a coverage report.
- `vp check` formats, lints and type-checks the code, including the type tests in `tests/typescript`.
- `vp exec knip` reports unused files, exports and dependencies.
- `vp pack` builds the package into `dist`.
