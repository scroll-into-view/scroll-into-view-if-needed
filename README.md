# scroll-into-view-if-needed &middot; [![CircleCI Status](https://img.shields.io/circleci/project/github/stipsan/scroll-into-view-if-needed.svg?style=flat-square)](https://circleci.com/gh/stipsan/scroll-into-view-if-needed) [![npm stat](https://img.shields.io/npm/dm/scroll-into-view-if-needed.svg?style=flat-square)](https://npm-stat.com/charts.html?package=scroll-into-view-if-needed) [![npm version](https://img.shields.io/npm/v/scroll-into-view-if-needed.svg?style=flat-square)](https://www.npmjs.com/package/scroll-into-view-if-needed) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

This is a [ponyfill](https://ponyfill.com) with the added ability of animating
the scroll itself.

Kudos to [@hsablonniere](https://github.com/hsablonniere) for sharing the
[original polyfill](https://gist.github.com/hsablonniere/2581101) and
[@jocki84](https://github.com/jocki84) for
[improving](https://gist.github.com/jocki84/6ffafd003387179a988e) it!

## Install

```bash
yarn add scroll-into-view-if-needed
```

## API

### scrollIntoViewIfNeeded(node:Element, centerIfNeeded:boolean, AnimateOptions:object)

Returns a function that can be used to cancel a scroll animation. Inspired by
[scroll-iv](https://www.npmjs.com/package/scroll-iv).

#### Options

##### centerIfNeeded

This defaults to true to match the behavior of the WebKit/Blink implementation.
Set it to false to actually only scroll the parent when needed and not further
than absolutely necessary.

##### AnimateOptions.duration

The duration of the animation in milliseconds, defaults to 0 for no animation.

##### AnimateOptions.easing

default is ease. Possible values: `ease|easeIn|easeOut|easeInOut|linear`

## Examples

### Vanilla JS

```js
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

const activeNode = document.querySelector('li.active')

// Works just like Element.scrollIntoViewIfNeeded in WebKit and Blink
scrollIntoViewIfNeeded(activeNode, false)

// Animates it with a tiny animation lib, no need for jQuery or Velocity
scrollIntoViewIfNeeded(activeNode, false, {
  duration: 150,
})
```

### React

```js
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'
import { Component } from 'react'

export default class Homepage extends Component {

 constructor(props) {
  super(props)

  this.setSignupNode = (node) => {
   if(node) {
    this._signupNode = node
   }
  }
  this.goToSignup = (event) => {
   event.preventDefault()

   // Passing the dom node from react is all you need for this to work
   scrollIntoViewIfNeeded(this._signupNode, false, {
    duration: 150
   })
  }
 }

 render() {
  return (
    ...
    <a onClick={this.goToSignup}>Signup Now!</a>
    ...
    <form ref={this.setSignupNode}>
    ...
  )
 }
}
```
