import compute, { Options as ComputeOptions } from './compute'

export interface Options {
  behavior?: 'auto' | 'smooth' | 'instant' | Function
  scrollMode?: ComputeOptions['scrollMode']
  boundary?: ComputeOptions['boundary']
  block?: ComputeOptions['block']
  inline?: ComputeOptions['inline']
}

// Wait with checking if native smooth-scrolling exists until scrolling is invoked
// This is much more friendly to server side rendering envs, and testing envs like jest
let supportsScrollBehavior

// Some people might use both "auto" and "ponyfill" modes in the same file, so we also provide a named export so
// that imports in userland code (like if they use native smooth scrolling on some browsers, and the ponyfill for everything else)
// the named export allows this `import {auto as autoScrollIntoView, ponyfill as smoothScrollIntoView} from ...`
export default (target: Element, maybeOptions: Options | boolean = true) => {
  let options: Options = {}

  if (supportsScrollBehavior === undefined) {
    supportsScrollBehavior = 'scrollBehavior' in document.documentElement.style
  }

  // Handle alignToTop for legacy reasons, to be compatible with the spec
  if (maybeOptions === true || maybeOptions === null) {
    options = { block: 'start', inline: 'nearest' }
  } else if (maybeOptions === false) {
    options = { block: 'end', inline: 'nearest' }
  } else if (maybeOptions === Object(maybeOptions)) {
    // @TODO check if passing an empty object is handled like defined by the spec (for now it makes the web platform tests pass)
    options =
      Object.keys(maybeOptions).length === 0
        ? { block: 'start', inline: 'nearest' }
        : { block: 'center', inline: 'nearest', ...maybeOptions }
  }

  const { behavior = 'auto', ...computeOptions } = options
  const instructions = compute(target, computeOptions)

  if (typeof behavior == 'function') {
    return behavior(instructions)
  }

  instructions.forEach(({ el, top, left }) => {
    // browser implements the new Element.prototype.scroll API that supports `behavior`
    // and guard window.scroll with supportsScrollBehavior
    if (el.scroll && supportsScrollBehavior) {
      el.scroll({ top, left, behavior })
    } else {
      if (el === document.documentElement) {
        window.scrollTo(left, top)
      } else {
        el.scrollTop = top
        el.scrollLeft = left
      }
    }
  })
}
