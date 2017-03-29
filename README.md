# scroll-into-view-if-needed

[![npm package](https://img.shields.io/npm/dm/scroll-into-view-if-needed.svg)](https://www.npmjs.com/package/scroll-into-view-if-needed)

[![NPM](https://nodei.co/npm/scroll-into-view-if-needed.png?downloadRank=true)](https://www.npmjs.com/package/scroll-into-view-if-needed)
[![NPM](https://nodei.co/npm-dl/scroll-into-view-if-needed.png?months=3&height=2)](https://nodei.co/npm/scroll-into-view-if-needed/)

This is a [ponyfill](https://ponyfill.com) with the added ability of animating the scroll itself.

Kudos to [@hsablonniere](https://github.com/hsablonniere) for sharing the [original polyfill](https://gist.github.com/hsablonniere/2581101) and [@jocki84](https://github.com/jocki84) for [improving](https://gist.github.com/jocki84/6ffafd003387179a988e) it!

## Install

```bash
npm install scroll-into-view-if-needed
```

## API

### scrollIntoViewIfNeeded(node:Element, centerIfNeeded:boolean, options:object)

Returns a function that can be used to cancel a scroll animation.
Inspired by [scroll-iv](https://www.npmjs.com/package/scroll-iv).

#### Options

##### centerIfNeeded

This defaults to true to match the behavior of the WebKit/Blink implementation.
Set it to false to actually only scroll the parent when needed and not further than absolutely necessary.

##### duration

The duration of the animation in milliseconds, defaults to 0 for no animation.

##### easing

default is ease. Possible values: `ease|easeIn|easeOut|easeInOut|linear`

## Examples
### Vanilla JS

```javascript
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

const activeNode = document.querySelector('li.active')

// Works just like Element.scrollIntoViewIfNeeded in WebKit and Blink
scrollIntoViewIfNeeded(activeNode, false)

// Animates it with a tiny animation lib, no need for jQuery or Velocity
scrollIntoViewIfNeeded(activeNode, false, {
  duration: 150
})

```

### React

```javascript
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
