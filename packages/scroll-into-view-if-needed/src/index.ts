import { compute, Options as ComputeOptions } from './compute'

export interface Options {
  behavior?: 'auto' | 'smooth' | 'instant' | Function
  scrollMode?: ComputeOptions['scrollMode']
  boundary?: ComputeOptions['boundary']
  block?: ComputeOptions['block']
  inline?: ComputeOptions['inline']
}

// Some people might use both "auto" and "ponyfill" modes in the same file, so we also provide a named export so
// that imports in userland code (like if they use native smooth scrolling on some browsers, and the ponyfill for everything else)
// the named export allows this `import {auto as autoScrollIntoView, ponyfill as smoothScrollIntoView} from ...`
export default (target: Element, options: Options = {}) => {
  const { behavior = 'auto', ...computeOptions } = options
  //return target.scrollIntoView(options)
  console.log('computeOptions', computeOptions)
  const instructions = compute(target, computeOptions)

  if (typeof behavior == 'function') {
    return behavior(instructions)
  }

  instructions.forEach(([el, top, left]) => {
    // browser implements the new Element.prototype.scroll API that supports `behavior`
    if (el.scroll) {
      console.log('hmmmmmmmmm', behavior)
      el.scroll({ top, left, behavior })
    } else {
      console.log('oh oh oh')
      el.scrollTop = top
      el.scrollLeft = left
    }
  })
}
