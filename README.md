# scroll-into-view-if-needed

This is a [ponyfill](https://ponyfoo.com/articles/polyfills-or-ponyfills) with the added ability of animating the scroll itself.

Kudos to [@hsablonniere](https://github.com/hsablonniere) for sharing the [original polyfill](https://gist.github.com/hsablonniere/2581101)

## Install

```bash
npm install scroll-into-view-if-needed
```

## API

### scrollIntoViewIfNeeded(node:Element, centerIfNeeded:boolean || options:object)

Returns a function that can be used to cancel a scroll animation.

#### Options

##### centerIfNeeded

This defaults to true to match the behavior of the WebKit/Blink implementation.
Set it to false to actually only scroll the parent when needed and not further than absolutely necessary.

##### duration

The duration of the animation in milliseconds, defaults to 0 for no animation.

##### easing

@TODO

## Examples

```javascript
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

const activeNode = document.querySelector('li.active')

// Works just like Element.scrollIntoViewIfNeeded in WebKit and Blink
scrollIntoViewIfNeeded(activeNode, false)

// Animates it with a tiny animation lib, no need for jQuery or Velocity
scrollIntoViewIfNeeded(activeNode, {
  centerIfNeeded: false,
  duration: 150
})

```