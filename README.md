[![CircleCI Status](https://img.shields.io/circleci/project/github/stipsan/scroll-into-view-if-needed.svg?style=flat-square)](https://circleci.com/gh/stipsan/scroll-into-view-if-needed)
[![npm stat](https://img.shields.io/npm/dm/scroll-into-view-if-needed.svg?style=flat-square)](https://npm-stat.com/charts.html?package=scroll-into-view-if-needed)
[![npm version](https://img.shields.io/npm/v/scroll-into-view-if-needed.svg?style=flat-square)](https://www.npmjs.com/package/scroll-into-view-if-needed)
[![gzip size][gzip-badge]][unpkg-dist]
[![size][size-badge]][unpkg-dist]
[![module formats: umd, cjs, and es][module-formats-badge]][unpkg-dist]
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
![scroll-into-view-if-needed](https://user-images.githubusercontent.com/81981/39476436-34a4f3ae-4d5c-11e8-9d1c-7fa2fa6288a0.png)

This used to be just a [ponyfill](https://ponyfill.com) for
`Element.scrollIntoViewIfNeeded` but is currently being rewritten to cover
`Element.scrollIntoView(ScrollIntoViewOptions)` including the new `scrollMode: "if-needed"` option. This readme will be updated when it's ready for stable
release.

## [Demo](https://scroll-into-view-if-needed.netlify.com)

## Install

```bash
yarn add scroll-into-view-if-needed
```

## Usage

```js
// es6 import
import scrollIntoView from 'scroll-into-view-if-needed'
// or es5
const scrollIntoView = require('scroll-into-view-if-needed')

const node = document.getElementById('hero')

// similar behavior as Element.scrollIntoView({block: "nearest", inline: "nearest"})
// only that it is a no-op if `node` is already visible
// see: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
// same behavior as Element.scrollIntoViewIfNeeded()
// see: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded
scrollIntoView(node, {
  scrollMode: 'if-needed',
  block: 'nearest',
  inline: 'nearest',
})

// same behavior as Element.scrollIntoViewIfNeeded(true) without the "IfNeeded" behavior
// see: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded
scrollIntoView(node, { block: 'center', inline: 'center' })
// scrollMode is "always" by default

// smooth scroll if the browser supports it and if the element isn't visible
scrollIntoView(node, { behavior: 'smooth', scrollMode: 'if-needed' })
```

### Ponyfill smooth scrolling

What does ponyfilling smooth scrolling mean, and why is it implemented in [`smooth-scroll-into-view-if-needed`](https://github.com/stipsan/smooth-scroll-into-view-if-needed) instead?
The answer is bundlesize. If this package adds smooth scrolling to browsers that's missing it then the overall bundlesize increases regardless of wether you use this feature or not.

In plain english:

```js
import scrollIntoView from 'scroll-into-view-if-needed'
// Even if all you do is this
scrollIntoIntoView(node, { scrollMode: 'if-needed' })
// You end up with the same bundlesize as people who need
// smooth scrolling to work in browsers that don't support it natively
scrollIntoIntoView(node, { behavior: 'smooth', scrollMode: 'if-needed' })
```

Because of this you need to choose a strategy that matches your priorities: load time, consistency or quality.

##### Load time

In many scenarios smooth scrolling can be used as a progressive enhancement. If the user is on a browser that don't implement smooth scrolling it'll simply scroll instantly and your bundlesize is only as large as it has to be.

```js
import scrollIntoView from 'scroll-into-view-if-needed'

scrollIntoView(node, { behavior: 'smooth' })
```

##### Consistency

If a consistent smooth scrolling experience is a priority and you really don't want any surprises between different browsers and enviroments. In other words don't want to be affected by how a vendor might implement native smooth scrolling, then [`smooth-scroll-into-view-if-needed`](https://github.com/stipsan/smooth-scroll-into-view-if-needed) is your best option. It ensures the same smooth scrolling experience for every browser.

```js
import smoothScrollIntoView from 'smooth-scroll-into-view-if-needed'

smoothScrollIntoView(node, { behavior: 'smooth' })
```

##### Quality

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

## API

### scrollIntoView(target, [options])

> New API introduced in `v1.3.0`

### options

Type: `Object`

#### behavior

Type: `'auto' | 'smooth' | 'instant' | Function`<br> Default: `'auto'`

> Introduced in `v2.1.0`

##### auto

The auto option unlocks a few interesting opportunities.
The browser will decide based on user preferences wether it should smooth scroll or not.
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

Quick note, in the CSS property the `auto` keyword equals `behavior: 'instant'`, not `behavior: 'auto'` on `scrollIntoView`. **Yes**, this is confusing.

Using `behavior: 'smooth'` is the easiest way to smooth scroll an element as it does not require any CSS, just a browser that implements it. (Check this for information on what to do about browsers that don't.)[#ponyfill-smooth-scrolling]

```js
scrollIntoView(target, {
  boundary: parent => {
    // By default `overflow: hidden` elements are allowed, only `overflow: visible | clip` is skipped as
    // this is required by the CSSOM spec
    if (getComputedStyle(parent)['overflow'] === 'hidden') {
      return false
    }

    return true
  },
})
```

#### boundary

Type: `Element | Function`

> `Function` introduced in `v2.1.0`

By default there is no boundary. All the parent elements of your target is checked until it reaches the viewport (`document.documentElement`) when calculating layout and what to scroll.
You can use this option to do things like:

* Prevent the browser window from scrolling.
* Scroll things into view below the fold without scrolling to it.
* Scroll elements into view in a list, without scrolling container elements.
* Prematurely optimizing performance instead of code-splitting your app.

You can also pass a function to do more dynamic checks to override the scroll scoping:

```js
scrollIntoView(target, {
  boundary: parent => {
    // By default `overflow: hidden` elements are allowed, only `overflow: visible | clip` is skipped as
    // this is required by the CSSOM spec
    if (getComputedStyle(parent)['overflow'] === 'hidden') {
      return false
    }

    return true
  },
})
```

#### centerIfNeeded

Type: `boolean`<br> Default: `false`

Center the `target` if possible, and if it's not already visible. If it's not
centered but still visible it will _not_ scroll.

#### duration

Type: `number`

Set a duration in milliseconds to animate the transition between scroll
positions on the x and/or y axis.

#### easing

Type: `'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'linear'`

Change the easing mechanism. This option takes effect when `duration` is set. In
`v2.0.0` it'll be possible to set your own
[bezier easing](https://www.npmjs.com/package/bezier-easing) similar to CSS
[`cubic-bezier()`](<https://developer.mozilla.org/en-US/docs/Web/CSS/single-transition-timing-function#cubic-bezier()>).

#### handleScroll(parent, {scrollLeft, scrollTop}, options)

> Introduced in `v1.4.0`

Type: `Function`

Take control over how the target is scrolled into view. This function is called
for each parent node that need scrolling. `scrollLeft` and `scrollTop` are
destination coordinates. The from coordinates you'll have to get yourself if you
want to animate the transition using a different library.

When using this option you likely don't need the built in animation feature. To
cut down on filesize you can do the following adjustment if you are using a
recent version of webpack or rollbar (and use ES6 imports):

```diff
-import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'
+import maybeScrollIntoView from 'scroll-into-view-if-needed/dist/calculate'

-scrollIntoViewIfNeeded(node)
+maybeScrollIntoView(node, {handleScroll: (parent, {scrollLeft, scrollTop}, config) => {
+  // The following is actually the default implementation
+  // if this is all you need you can skip passing this option
+  parent.scrollLeft = scrollLeft
+  parent.scrollTop = scrollTop
+}})
```

#### offset

Type: `Object`

Used for creating whitespace between the `target` and the scroll container.
Useful in scenarios where a `position: fixed` element might overlay the scroll
container to "offset" the `target`.

However this option has known bugs and may be dropped or replaced in `v2.0.0`.
If possible wrap your `target` in an element and create spacing using `CSS padding` or similar. This way you won't be affected by breaking changes here or
the current bugs.

##### top

Type: `number`<br> Default: `0`

Behaves similarily to `margin-top`. A negative value will "pull" the target
upward, while a positive value will "push" it downwards.

##### right

Type: `number`<br> Default: `0`

##### bottom

Type: `number`<br> Default: `0`

##### left

Type: `number`<br> Default: `0`

### scrollIntoViewIfNeeded(target, [centerIfNeeded], [animateOptions], [finalElement], [offsetOptions])

> Legacy API, will be deprecated in `v2.0.0`

#### centerIfNeeded

Type: `boolean`<br> Default: `false`

Legacy alias for [`options.centerIfNeeded`](#centerifneeded)

#### animateOptions

Type: `Object`

##### duration

Type: `number`

Legacy alias for [`options.duration`](#duration)

##### easing

Type: `string`

Legacy alias for [`options.easing`](#easing)

#### finalElement

Type: `string`

Legacy alias for [`options.boundary`](#boundary)

#### offsetOptions

Type: `Object`

##### offsetTop

Type: `number`

Legacy alias for [`options.offset.top`](#top)

##### offsetRight

Type: `number`

Legacy alias for [`options.offset.right`](#right)

##### offsetBottom

Type: `number`

Legacy alias for [`options.offset.bottom`](#bottom)

##### offsetLeft

Type: `number`

Legacy alias for [`options.offset.left`](#left)

### Custom scrolling transition

If the default smooth scrolling ponyfill isn't the duration or easing you want,
you can provide your own scrolling logic by giving `behavior` a callback.

```js
import scrollIntoView from 'scroll-into-view-if-needed'
const node = document.getElementById('hero')

scrollIntoView(node, {
  // Your scroll actions will always be an array, even if there is nothing to scroll
  behavior: actions =>
    // list is sorted from innermost (closest parent to your target) to outermost (often the document.body or viewport)
    actions.forEach(({ el, top, left }) => {
      // implement the scroll anyway you want
      el.scrollTop = top
      el.scrollLeft = left

      // If you need the relative scroll coordinates, for things like window.scrollBy style logic or whatever, just do the math
      const offsetTop = el.scrollTop - top
      const offsetLeft = el.scrollLeft - left
    }),
  // all the other options (scrollMode, block, inline) still work, so you don't need to reimplement them (unless you really really want to)
})
```

# Breaking API changes from v1

Since v1 ponyfilled Element.scrollIntoViewIfNeeded, while v2 ponyfills Element.scrollIntoView, there are breaking changes from the differences in their APIs.

# Related packages

* [`smooth-scroll-into-view-if-needed`](http://npmjs.com/package/smooth-scroll-into-view-if-needed) – ponyfills smooth scrolling.
* [react-scroll-into-view-if-needed](https://www.npmjs.com/package/react-scroll-into-view-if-needed) – A thin wrapper to scroll your component into view.
* [Don't be shy, add yours!](https://github.com/stipsan/scroll-into-view-if-needed/edit/master/README.md)

# Who's using this

* [zeit.co/docs](https://github.com/zeit/docs) – Documentation of ZEIT Now and other services.
* [Selenium IDE](https://github.com/SeleniumHQ/selenium-ide) – An integrated development environment for Selenium scripts.
* [Box UI Elements](https://github.com/box/box-ui-elements) – Box UI Elements are pre-built UI components that allow developers to add elements of the main Box web application into their own applications.
* [react-responsive-ui](https://github.com/catamphetamine/react-responsive-ui) – Responsive React UI components.
* [Mineral UI](https://github.com/mineral-ui/mineral-ui) –
  A design system and React component library for the web that lets you quickly build high-quality, accessible apps.
* [Covalent](https://github.com/Teradata/covalent) – Teradata UI Platform built on Angular Material.
* [docs.expo.io](https://github.com/expo/expo-docs) – Documentation for Expo, its SDK, client and services.
* [Add yourself to the list 😉](https://github.com/stipsan/scroll-into-view-if-needed/edit/master/README.md)

[gzip-badge]: http://img.badgesize.io/https://unpkg.com/scroll-into-view-if-needed/umd-scroll-into-view-if-needed.min.js?compression=gzip&label=gzip%20size&style=flat-square
[size-badge]: http://img.badgesize.io/https://unpkg.com/scroll-into-view-if-needed/umd-scroll-into-view-if-needed.min.js?label=size&style=flat-square
[unpkg-dist]: https://unpkg.com/scroll-into-view-if-needed/umd/
[module-formats-badge]: https://img.shields.io/badge/module%20formats-umd%2C%20cjs%2C%20es-green.svg?style=flat-square
