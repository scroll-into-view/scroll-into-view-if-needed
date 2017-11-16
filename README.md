# scroll-into-view-if-needed &middot; [![CircleCI Status](https://img.shields.io/circleci/project/github/stipsan/scroll-into-view-if-needed.svg?style=flat-square)](https://circleci.com/gh/stipsan/scroll-into-view-if-needed) [![npm stat](https://img.shields.io/npm/dm/scroll-into-view-if-needed.svg?style=flat-square)](https://npm-stat.com/charts.html?package=scroll-into-view-if-needed) [![npm version](https://img.shields.io/npm/v/scroll-into-view-if-needed.svg?style=flat-square)](https://www.npmjs.com/package/scroll-into-view-if-needed) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

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
const scrollIntoViewIfNeeded = require('scroll-into-view-if-needed')
const node = document.getElementById('hero')

// similar behavior as Element.scrollIntoView({block: "nearest", inline: "nearest"})
// only that it is a no-op if `node` is already visible
// see: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
scrollIntoViewIfNeeded(node)

// same behavior as Element.scrollIntoViewIfNeeded(true)
// see: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded
scrollIntoViewIfNeeded(node, { centerIfNeeded: true })

// animate the transition by setting a duration (in milliseconds)
scrollIntoViewIfNeeded(node, { duration: 300 })
```

## API

### scrollIntoViewIfNeeded(target, [options])

> New API introduced in `v1.3.0`

### options

Type: `Object`

#### boundary

Type: `Element`<br> Default: `document.documentElement`

Outermost parent element that might be scrolled to bring `target` into view. Use
this if you have multiple scrollable views and you need to limit what's
scrolled. Also use this if you know that you will only need to scroll the parent
of your `target` to skip performance costly checks.

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
If possible wrap your `target` in an element and create spacing using `CSS
padding` or similar. This way you won't be affected by breaking changes here or
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

## Examples

### React

```jsx
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'
import { Component } from 'react'

export default class Homepage extends Component {
  render() {
    return (
      <div>
        ...
        <a
          onClick={event => {
            scrollIntoViewIfNeeded(this._signupNode, {
              duration: 150,
            })
          }}
        >
          Signup Now!
        </a>
        ...
        <form
          ref={node => {
            this._signupNode = node
          }}
        >
          ...
        </form>
        ...
      </div>
    )
  }
}
```

### 1989 JS

```html
<script src="https://unpkg.com/scroll-into-view-if-needed@latest"></script>
<script>
  var node = document.getElementById('hero')
  // if you don't have a bundler don't worry, you can access the global like the good old days
  scrollIntoViewIfNeeded(node)
</script>
```
