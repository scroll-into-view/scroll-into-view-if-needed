import scrollIntoView from 'scroll-into-view-if-needed'
import { Options } from 'scroll-into-view-if-needed/compute'

// Memoize so we're much more friendly to non-dom envs
let memoizedNow
var now = () => {
  if (!memoizedNow) {
    memoizedNow =
      'performance' in window ? performance.now.bind(performance) : Date.now
  }
  return memoizedNow()
}

const SCROLL_TIME = 300

function ease(k) {
  return 0.5 * (1 - Math.cos(Math.PI * k))
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
  if (el === document.body || (el === document.documentElement && true)) {
    scrollable = window
    startX = window.scrollX || window.pageXOffset
    startY = window.scrollY || window.pageYOffset
    method = window.scroll
    console.error('damn2', el, startX, startY)
  } else {
    scrollable = el
    startX = el.scrollLeft
    startY = el.scrollTop
    method = (x, y) => {
      console.error(el, 'x', x, 'y', y)
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

export default (target, options: Options = {}) => {
  const { behavior = 'smooth' } = options
  //return target.scrollIntoView(options)

  // @TODO detect if someone is using this library without smooth behavior and maybe warn
  if (behavior !== 'smooth') {
    return scrollIntoView(target, options)
  }

  return scrollIntoView(target, {
    ...options,
    behavior: instructions => {
      return Promise.all(
        instructions.map(([el, top, left]) => {
          return new Promise(resolve => {
            smoothScroll(el, left, top, () => resolve())
          })
        })
      )
    },
  })
}
