[![CircleCI Status](https://img.shields.io/circleci/project/github/stipsan/scroll-into-view-if-needed.svg?style=flat-square)](https://circleci.com/gh/stipsan/scroll-into-view-if-needed)
[![npm stat](https://img.shields.io/npm/dm/scroll-into-view-if-needed.svg?style=flat-square)](https://npm-stat.com/charts.html?package=scroll-into-view-if-needed)
[![npm version](https://img.shields.io/npm/v/scroll-into-view-if-needed.svg?style=flat-square)](https://www.npmjs.com/package/scroll-into-view-if-needed)
[![gzip size][gzip-badge]][unpkg-dist]
[![size][size-badge]][unpkg-dist]
[![module formats: umd, cjs, and es][module-formats-badge]][unpkg-dist]
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?style=flat-square&badge_key=ejZ6OUtTaS9rZFFOYzlkeHlwTzMwSWxpR0FzWFcwOW5TS3ROTmlSdXMrVT0tLVhrVk9La2lCb1o4Y05mcmNXVnAvdkE9PQ==--d17668b8aba5091e4ef3a58927b8209e50b0a788)](https://www.browserstack.com/automate/public-build/ejZ6OUtTaS9rZFFOYzlkeHlwTzMwSWxpR0FzWFcwOW5TS3ROTmlSdXMrVT0tLVhrVk9La2lCb1o4Y05mcmNXVnAvdkE9PQ==--d17668b8aba5091e4ef3a58927b8209e50b0a788)

![scroll-into-view-if-needed](https://user-images.githubusercontent.com/81981/39476436-34a4f3ae-4d5c-11e8-9d1c-7fa2fa6288a0.png)

This used to be a [ponyfill](https://ponyfill.com) for
`Element.scrollIntoViewIfNeeded`. Since then the CSS working group have decided to implement its features in `Element.scrollIntoView` as the option `scrollMode: "if-needed"`. Thus this library got rewritten to implement that spec instead of the soon to be deprecated one.

## [Demo](https://scroll-into-view-if-needed.netlify.com)

## Install

```bash
yarn add scroll-into-view-if-needed
```

The UMD build is also available on [unpkg](https://unpkg.com/scroll-into-view-if-needed/umd/):

```html
<script src="https://unpkg.com/scroll-into-view-if-needed/umd/scroll-into-view-if-needed.min.js"></script>
```

You can find the library on `window.scrollIntoView`.

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

Put it this way:

```js
import scrollIntoView from 'scroll-into-view-if-needed'
// Even if all you do is this
scrollIntoView(node, { scrollMode: 'if-needed' })
// You end up with the same bundlesize as people who need
// smooth scrolling to work in browsers that don't support it natively
scrollIntoView(node, { behavior: 'smooth', scrollMode: 'if-needed' })
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

##### `'auto'`

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

##### `'smooth'`

Using `behavior: 'smooth'` is the easiest way to smooth scroll an element as it does not require any CSS, just a browser that implements it. [More information.](#ponyfill-smooth-scrolling)

##### `'instant'`

This is useful for scenarios where it's certain that smooth scrolling would make an interaction feel sluggish. Like keyboard navigation and other user experiences where the end user expect things to move _instantly_.

##### `Function`

When given a function then this library will only calculate what should be scrolled and leave it up to you to perform the actual scrolling.

The callback is given an array over actions. Each action contain a reference to an element that should be scrolled, with its top and left scrolling coordinates.
What you return is passed through, allowing you to implement a Promise interface if you want to (check [`smooth-scroll-into-view-if-needed`](https://github.com/stipsan/smooth-scroll-into-view-if-needed) to see an example of that).

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

Check the demo to see an [example with popmotion and a spring transition](https://scroll-into-view-if-needed.netlify.com/#custom-transition).

> If you only need the custom behavior you might be better off by using the compute library directly: https://github.com/stipsan/compute-scroll-into-view

#### [block](https://scroll-into-view-if-needed.netlify.com/#scroll-alignment)

Type: `'start' | 'center' | 'end' | 'nearest'`<br> Default: `'center'`

> Introduced in `v2.1.0`

[More info.](https://github.com/stipsan/compute-scroll-into-view#block)

#### [inline](https://scroll-into-view-if-needed.netlify.com/#scroll-alignment)

Type: `'start' | 'center' | 'end' | 'nearest'`<br> Default: `'nearest'`

> Introduced in `v2.1.0`

[More info.](https://github.com/stipsan/compute-scroll-into-view#inline)

#### [scrollMode](https://scroll-into-view-if-needed.netlify.com/#scrolling-if-needed)

Type: `'always' | 'if-needed'`<br> Default: `'always'`

> Introduced in `v2.1.0`

[More info.](https://github.com/stipsan/compute-scroll-into-view#scrollmode)

#### [boundary](https://scroll-into-view-if-needed.netlify.com/#limit-propagation)

Type: `Element | Function`

> `Function` introduced in `v2.1.0`, `Element` introduced in `v1.1.0`

[More info.](https://github.com/stipsan/compute-scroll-into-view#boundary)

#### skipOverflowHiddenElements

Type: `Boolean`<br> Default: `false`

> Introduced in `v2.2.0`

[More info.](https://github.com/stipsan/compute-scroll-into-view#skipoverflowhiddenelements)

# TypeScript support

When the library itself is built on TypeScript there's no excuse for not publishing great library definitions!

This goes beyond just checking if you misspelled `behavior: 'smoooth'` to the return type of a custom behavior:

```typescript
const scrolling = scrollIntoView(document.body, {
  behavior: actions => {
    return new Promise(
      ...
    )
  },
})
// TypeScript understands that scrolling is a Promise, you can safely await on it
scrolling.then(() => console.log('done scrolling'))
```

You can optionally use a generic to ensure that `options.behavior` is the expected type.
It can be useful if the custom behavior is implemented in another module:

```typescript
const customBehavior = actions => {
    return new Promise(
      ...
    )
  }

const scrolling = scrollIntoView<Promise<any>>(document.body, {
  behavior: customBehavior
})
// throws if customBehavior does not return a promise
```

The options are available for you if you are wrapping this libary in another abstraction (like a React component):

```typescript
import scrollIntoView, { Options } from 'scroll-into-view-if-needed'

interface CustomOptions extends Options {
  useBoundary?: boolean
}

function scrollToTarget(selector, options: Options = {}) {
  const { useBoundary = false, ...scrollOptions } = options
  return scrollIntoView(document.querySelector(selector), scrollOptions)
}
```

# Breaking API changes from v1

Since v1 ponyfilled Element.scrollIntoViewIfNeeded, while v2 ponyfills Element.scrollIntoView, there are breaking changes from the differences in their APIs.

The biggest difference is that the new behavior follows the spec, so the "if-needed" behavior is **not enabled by default:**

##### v1

```js
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

// Only scrolls into view if needed, and to the nearest edge
scrollIntoViewIfNeeded(target)
```

##### v2

```js
import scrollIntoView from 'scroll-into-view-if-needed'

// Must provide these options to behave the same way as v1 default
scrollIntoView(target, { block: 'nearest', scrollMode: 'if-needed' })
```

#### centerIfNeeded

The old `Element.scrollIntoView` api only had two settings, align to top or bottom. [`Element.scrollIntoViewIfNeeded`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded) had two more, align to the center or nearest edge.
The `Element.scrollIntoView` spec now supports these two modes as `block: 'center'` and `block: 'nearest'`.
Breaking changes sucks, but on the plus side your code is now more portable and will make this library easier to delete from your codebase on the glorious day browser support is good enough.

##### v1

```js
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

// v1.3.x and later
scrollIntoViewIfNeeded(target, { centerIfNeeded: true })
scrollIntoViewIfNeeded(target, { centerIfNeeded: false })
// v1.2.x and earlier
scrollIntoViewIfNeeded(target, true)
scrollIntoViewIfNeeded(target, false)
```

##### v2

```js
import scrollIntoView from 'scroll-into-view-if-needed'

scrollIntoView(target, { block: 'center' })
scrollIntoView(target, { block: 'nearest' })
```

#### duration

[More information.](#ponyfill-smooth-scrolling)

##### v1

```js
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

scrollIntoViewIfNeeded(target, { duration: 300 })
```

##### v2

```js
import scrollIntoView from 'scroll-into-view-if-needed'
// or
import scrollIntoView from 'smooth-scroll-into-view-if-needed'

scrollIntoView(target, { behavior: 'smooth' })
```

#### easing

This feature is removed, but you can achieve the same thing by implementing [`behavior: Function`](#function).

#### handleScroll

This is replaced with [`behavior: Function`](#function) with one key difference. Instead of firing once per element that should be scrolled, the new API only fire once and instead give you an array so you can much easier batch and scroll multiple elements at the same time. Or sync scrolling with another element if that's the kind of stuff you're into, I don't judge.

```diff
-import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'
+import scrollIntoView from 'scroll-into-view-if-needed'

-scrollIntoViewIfNeeded(node, {handleScroll: (el, {scrollTop, scrollLeft}) => {
-  el.scrollTop = scrollTop
-  el.scrollLeft = scrollLeft
-}})
+scrollIntoView(node, {behavior: actions.forEach(({el, top, left}) => {
+  el.scrollTop = top
+  el.scrollLeft = left
+})})
```

#### offset

This was always a buggy feature and warned against using in v1 as it might get dropped.
It's much safer to use CSS wrapper elements for this kind of thing.

### scrollIntoViewIfNeeded(target, [centerIfNeeded], [animateOptions], [finalElement], [offsetOptions])

This API signature were warned to be dropped in `v2.0.0`, and it was.

# Related packages

- [compute-scroll-into-view](http://npmjs.com/package/compute-scroll-into-view) - the engine used by this library.
- [smooth-scroll-into-view-if-needed](http://npmjs.com/package/smooth-scroll-into-view-if-needed) – ponyfills smooth scrolling.
- [react-scroll-into-view-if-needed](https://www.npmjs.com/package/react-scroll-into-view-if-needed) – A thin wrapper to scroll your component into view.
- [Don't be shy, add yours!](https://github.com/stipsan/scroll-into-view-if-needed/edit/master/README.md)

# Who's using this

- [zeit.co/docs](https://github.com/zeit/docs) – Documentation of ZEIT Now and other services.
- [Selenium IDE](https://github.com/SeleniumHQ/selenium-ide) – An integrated development environment for Selenium scripts.
- [Box UI Elements](https://github.com/box/box-ui-elements) – Box UI Elements are pre-built UI components that allow developers to add elements of the main Box web application into their own applications.
- [react-responsive-ui](https://github.com/catamphetamine/react-responsive-ui) – Responsive React UI components.
- [Mineral UI](https://github.com/mineral-ui/mineral-ui) –
  A design system and React component library for the web that lets you quickly build high-quality, accessible apps.
- [Covalent](https://github.com/Teradata/covalent) – Teradata UI Platform built on Angular Material.
- [docs.expo.io](https://github.com/expo/expo-docs) – Documentation for Expo, its SDK, client and services.
- [Add yourself to the list 😉](https://github.com/stipsan/scroll-into-view-if-needed/edit/master/README.md)

[gzip-badge]: http://img.badgesize.io/https://unpkg.com/scroll-into-view-if-needed/umd/scroll-into-view-if-needed.min.js?compression=gzip&label=gzip%20size&style=flat-square
[size-badge]: http://img.badgesize.io/https://unpkg.com/scroll-into-view-if-needed/umd/scroll-into-view-if-needed.min.js?label=size&style=flat-square
[unpkg-dist]: https://unpkg.com/scroll-into-view-if-needed/umd/
[module-formats-badge]: https://img.shields.io/badge/module%20formats-umd%2C%20cjs%2C%20es-green.svg?style=flat-square

## Sponsors

Thanks to [BrowserStack](https://www.browserstack.com) for sponsoring cross browser and device testing 😄

<a href="https://www.browserstack.com" target="_blank"><img src="https://www.browserstack.com/images/layout/logo.svg"></a>
