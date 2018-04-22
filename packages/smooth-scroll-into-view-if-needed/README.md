[![CircleCI Status](https://img.shields.io/circleci/project/github/stipsan/scroll-into-view-if-needed.svg?style=flat-square)](https://circleci.com/gh/stipsan/scroll-into-view-if-needed) [![npm stat](https://img.shields.io/npm/dm/scroll-into-view-if-needed.svg?style=flat-square)](https://npm-stat.com/charts.html?package=scroll-into-view-if-needed) [![npm version](https://img.shields.io/npm/v/scroll-into-view-if-needed.svg?style=flat-square)](https://www.npmjs.com/package/scroll-into-view-if-needed) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
![scroll-into-view-if-needed](https://user-images.githubusercontent.com/81981/39098948-61a1e60a-4672-11e8-80a3-16f0e57e4b9d.png)

This is a [ponyfill](https://ponyfill.com) for smooth scrolling `scroll-into-view-if-needed`.

## [Demo](https://scroll-into-view-if-needed.netlify.com/)

## Install

```bash
yarn add smooth-scroll-into-view-if-needed
```

## Usage

```js
import scrollIntoView from 'smooth-scroll-into-view-if-needed'
const node = document.getElementById('hero')

// If all you want is for all your users to have stuff smooth scroll into view
scrollIntoView(node, { behavior: 'smooth' })

// combine it with any of the other options
scrollIntoView(node, {
  behavior: 'smooth',
  scrollMode: 'if-needed',
  block: 'nearest',
  inline: 'nearest',
})

// It returns a promise that is resolved when the animation is finished
const sequence = async () => {
  const slide = document.getElementById('slide-3')
  // First smooth scroll to hero
  await scrollIntoView(node, { behavior: 'smooth' })
  // Then we scroll to a slide in a slideshow
  return scrollIntoView(slide, { behavior: 'smooth' })
}
```

### Custom scrolling transition

If the default smooth scrolling ponyfill isn't the duration or easing you want, you can provide your own scrolling logic by giving `behavior` a callback.

```js
import scrollIntoView from 'smooth-scroll-into-view-if-needed'
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
