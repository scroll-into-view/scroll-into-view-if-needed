// @TODO implement smooth behavior in here

import { compute, Options as ComputeOptions } from './compute'

export interface Options extends ComputeOptions {
  // @TODO specify custom behavior option here
}

var now = 'performance' in global ? performance.now.bind(performance) : Date.now

var SCROLL_TIME = 468

function ease(k) {
  return 0.5 * (1 - Math.cos(Math.PI * k))
}

function scrollElement(x, y) {
  this.scrollLeft = x
  this.scrollTop = y
}

function step(context) {
  var time = now()
  var value
  var currentX
  var currentY
  var elapsed = (time - context.startTime) / SCROLL_TIME

  // avoid elapsed times higher than one
  elapsed = elapsed > 1 ? 1 : elapsed

  // apply easing to elapsed time
  value = ease(elapsed)

  currentX = context.startX + (context.x - context.startX) * value
  currentY = context.startY + (context.y - context.startY) * value

  context.method.call(context.scrollable, currentX, currentY)

  // scroll more if we have not reached our destination
  if (currentX !== context.x || currentY !== context.y) {
    requestAnimationFrame(step.bind(global, context))
  }
}

function smoothScroll(el, x, y, cb) {
  var scrollable
  var startX
  var startY
  var method
  var startTime = now()

  // define scroll context
  if (el === document.body) {
    scrollable = window
    startX = window.scrollX || window.pageXOffset
    startY = window.scrollY || window.pageYOffset
    method = window.scroll
  } else {
    scrollable = el
    startX = el.scrollLeft
    startY = el.scrollTop
    method = (x, y) => {
      el.scrollLeft = x
      el.scrollTop = y
    }
  }

  // scroll looping over a frame
  step({
    scrollable: scrollable,
    method: method,
    startTime: startTime,
    startX: startX,
    startY: startY,
    x: x,
    y: y,
    cb,
  })
}

export const ponyfill = (target, options) => {
  const { behavior = 'auto' } = options
  //return target.scrollIntoView(options)
  console.log('behavior', behavior)
  const instructions = compute(target, options)

  return Promise.all(
    instructions.map(([el, top, left]) => {
      return new Promise(resolve => {
        smoothScroll(el, left, top, () => resolve())
      })
    })
  )
}
