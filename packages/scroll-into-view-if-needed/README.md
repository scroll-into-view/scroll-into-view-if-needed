[![CircleCI Status](https://img.shields.io/circleci/project/github/stipsan/scroll-into-view-if-needed.svg?style=flat-square)](https://circleci.com/gh/stipsan/scroll-into-view-if-needed) [![npm stat](https://img.shields.io/npm/dm/scroll-into-view-if-needed.svg?style=flat-square)](https://npm-stat.com/charts.html?package=scroll-into-view-if-needed) [![npm version](https://img.shields.io/npm/v/scroll-into-view-if-needed.svg?style=flat-square)](https://www.npmjs.com/package/scroll-into-view-if-needed) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
![scroll-into-view-if-needed](https://user-images.githubusercontent.com/81981/36357426-2f0f3152-14fe-11e8-892a-915d06488171.png)

This is a [ponyfill](https://ponyfill.com) with the added ability of animating
the scroll itself.

## [Demo](https://stipsan.github.io/scroll-into-view-if-needed/)

Kudos to [@hsablonniere](https://github.com/hsablonniere) for sharing the
[original polyfill](https://gist.github.com/hsablonniere/2581101) and
[@jocki84](https://github.com/jocki84) for
[improving](https://gist.github.com/jocki84/6ffafd003387179a988e) it!

## Install

```bash
yarn add scroll-into-view-if-needed
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
scrollIntoView(node, {scrollMode: 'if-needed', block: "nearest", inline: "nearest"})

// same behavior as Element.scrollIntoViewIfNeeded(true) without the "IfNeeded" behavior
// see: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded
scrollIntoView(node, {block: "center", inline: "center"})
// scrollMode is "always" by default

// smooth scroll if the browser supports it and if the element isn't visible
scrollIntoView(node, {behavior: 'smooth', scrollMode: 'if-needed'})
```

### Ponyfill smooth scrolling

If you're ok with a larger bundlesize, you can use the ponyfill version so all your users experience smooth scrolling.

```js
import scrollIntoView from 'scroll-into-view-if-needed/ponyfill'
const node = document.getElementById('hero')

// If all you want is for all your users to have stuff smooth scroll into view
scrollIntoView(node, {behavior: 'smooth'})

// combine it with any of the other options
scrollIntoView(node, {behavior: 'smooth', scrollMode: 'if-needed', block: 'nearest', inline: 'nearest'})

// It returns a promise that is resolved when the animation is finished
const sequence = async () => {
  const slide = document.getElementById('slide-3')
  // First smooth scroll to hero
  await scrollIntoView(node, {behavior: 'smooth'})
  // Then we scroll to a slide in a slideshow
  return scrollIntoView(slide, {behavior: 'smooth'})
}
```

### Custom scrolling transition

If the default smooth scrolling ponyfill isn't the duration or easing you want,  you can provide your own scrolling logic by giving `behavior` a callback.

```js
import scrollIntoView from 'scroll-into-view-if-needed'
const node = document.getElementById('hero')

scrollIntoView(node, {
// Your scroll actions will always be an array, even if there is nothing to scroll
  behavior: scrollActions =>
    // list is sorted from innermost (closest parent to your target) to outermost (often the document.body or viewport)
    scrollActions.forEach(([el, scrollTop, scrollLeft]) => {
      // implement the scroll anyway you want
      el.scrollTop = scrollTop;
      el.scrollLeft = scrollLeft;

      // If you need the relative scroll coordinates, for things like window.scrollBy style logic, just do the math
      const offsetTop = el.scrollTop - scrollTop
      const offsetLeft = el.scrollLeft - scrollLeft;
    }),
    // all the other options (scrollMode, block, inline) still work, so you don't need to reimplement them (unless you really really want to)
});
```

## More documentation will be added (hang in there)