# This is the work-in-progress, the current stable version is [here](https://github.com/stipsan/scroll-into-view-if-needed/tree/v1)

[![CircleCI Status](https://img.shields.io/circleci/project/github/stipsan/scroll-into-view-if-needed.svg?style=flat-square)](https://circleci.com/gh/stipsan/scroll-into-view-if-needed)
[![npm stat](https://img.shields.io/npm/dm/scroll-into-view-if-needed.svg?style=flat-square)](https://npm-stat.com/charts.html?package=scroll-into-view-if-needed)
[![npm version](https://img.shields.io/npm/v/scroll-into-view-if-needed.svg?style=flat-square)](https://www.npmjs.com/package/scroll-into-view-if-needed)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
![scroll-into-view-if-needed](https://user-images.githubusercontent.com/81981/39338772-34165fb2-49c5-11e8-9d29-38acb6842db8.png)

This used to be just a [ponyfill](https://ponyfill.com) for
`Element.scrollIntoViewIfNeeded` but is currently being rewritten to cover
`Element.scrollIntoView(ScrollIntoViewOptions)` including the new `scrollMode: "if-needed"` option. This readme will be updated when it's ready for stable
release.

## [Demo](https://scroll-into-view-if-needed.netlify.com)

## Install

```bash
yarn add scroll-into-view-if-needed@next
```

## Usage

```js
import scrollIntoView from 'scroll-into-view-if-needed'
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
    scrollActions.forEach(([el, scrollTop, scrollLeft]) => {
      // implement the scroll anyway you want
      el.scrollTop = scrollTop
      el.scrollLeft = scrollLeft

      // If you need the relative scroll coordinates, for things like window.scrollBy style logic, just do the math
      const offsetTop = el.scrollTop - scrollTop
      const offsetLeft = el.scrollLeft - scrollLeft
    }),
  // all the other options (scrollMode, block, inline) still work, so you don't need to reimplement them (unless you really really want to)
})
```

## More documentation will be added (hang in there)
