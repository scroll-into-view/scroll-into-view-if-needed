# You're looking at v2, [v1 is here](https://github.com/stipsan/scroll-into-view-if-needed/tree/v1)

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

If you're ok with a larger bundlesize and want the smooth scrolling behavior to be ponyfilled you can use the [`smooth-scroll-into-view-if-needed`](https://github.com/stipsan/smooth-scroll-into-view-if-needed) addon.

### Custom scrolling transition

If the default smooth scrolling ponyfill isn't the duration or easing you want,
you can provide your own scrolling logic by giving `behavior` a callback.

```js
import scrollIntoView from 'scroll-into-view-if-needed'
const node = document.getElementById('hero')

scrollIntoView(node, {
  // Your scroll actions will always be an array, even if there is nothing to scroll
  behavior: scrollActions =>
    // list is sorted from innermost (closest parent to your target) to outermost (often the document.body or viewport)
    scrollActions.forEach(({ el, top, left }) => {
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

# Related packages

* [`smooth-scroll-into-view-if-needed`](http://npmjs.com/package/smooth-scroll-into-view-if-needed) – ponyfills smooth scrolling.
* [react-scroll-into-view-if-needed](https://www.npmjs.com/package/react-scroll-into-view-if-needed) – A thin wrapper to scroll your component into view.
* [Don't be shy, add yours!](https://github.com/stipsan/scroll-into-view-if-needed/edit/master/README.md)

# Who's using this

* [Add yourself to the list 😉](https://github.com/stipsan/scroll-into-view-if-needed/edit/master/README.md)

[gzip-badge]: http://img.badgesize.io/https://unpkg.com/scroll-into-view-if-needed/umd-scroll-into-view-if-needed.min.js?compression=gzip&label=gzip%20size&style=flat-square
[size-badge]: http://img.badgesize.io/https://unpkg.com/scroll-into-view-if-needed/umd-scroll-into-view-if-needed.min.js?label=size&style=flat-square
[unpkg-dist]: https://unpkg.com/scroll-into-view-if-needed/umd/
[module-formats-badge]: https://img.shields.io/badge/module%20formats-umd%2C%20cjs%2C%20es-green.svg?style=flat-square
