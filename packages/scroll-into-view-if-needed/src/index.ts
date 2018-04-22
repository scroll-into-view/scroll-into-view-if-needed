import { compute, Options as ComputeOptions } from './compute'

export interface Options extends ComputeOptions {
  // @TODO specify custom behavior option here
}

// Some people might use both "auto" and "ponyfill" modes in the same file, so we also provide a named export so
// that imports in userland code (like if they use native smooth scrolling on some browsers, and the ponyfill for everything else)
// the named export allows this `import {auto as autoScrollIntoView, ponyfill as smoothScrollIntoView} from ...`
export const auto = (target, options: ScrollIntoViewOptions = {}) => {
  const { behavior = 'auto' } = options
  //return target.scrollIntoView(options)
  const instructions = compute(target, options)

  if (instructions) {
    instructions.forEach(([el, top, left]) => {
      // browser implements the new Element.prototype.scroll API that supports `behavior`
      if (el.scroll) {
        console.log('hmmmmmmmmm')
        el.scroll({ top, left, behavior })
      } else {
        console.log('oh oh oh')
        el.scrollTop = top
        el.scrollLeft = left
      }
    })
  }
}

// The "essentials-only" mode that is only as large as it needs to be, and supports native smooth scrolling which is potentially more performant
export default auto

// This is for people who only need the code that computes scrolling instructions, but roll their own
// code for doing the actual scrolling and want the smallest possible bundle size.
export { compute }
