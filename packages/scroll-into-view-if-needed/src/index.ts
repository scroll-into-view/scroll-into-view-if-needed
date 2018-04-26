import { compute, Options as ComputeOptions } from './compute'

export interface Options {
  behavior?: 'auto' | 'smooth' | 'instant' | Function
  scrollMode?: ComputeOptions['scrollMode']
  boundary?: ComputeOptions['boundary']
  block?: ComputeOptions['block']
  inline?: ComputeOptions['inline']
}

let counter = 0
// Some people might use both "auto" and "ponyfill" modes in the same file, so we also provide a named export so
// that imports in userland code (like if they use native smooth scrolling on some browsers, and the ponyfill for everything else)
// the named export allows this `import {auto as autoScrollIntoView, ponyfill as smoothScrollIntoView} from ...`
export default (target: Element, maybeOptions: Options | boolean = true) => {
  let options: Options = {}

  // Handle alignToTop for legacy reasons
  if (maybeOptions === true) {
    options = { block: 'start', inline: 'nearest' }
  } else if (maybeOptions === false) {
    options = { block: 'end', inline: 'nearest' }
  } else if (maybeOptions === Object(maybeOptions)) {
    options = { block: 'center', inline: 'nearest', ...maybeOptions }
  }

  counter++
  ;[1].includes(counter)
    ? console.group(options)
    : console.groupCollapsed(options)

  const { behavior = 'auto', ...computeOptions } = options
  //return target.scrollIntoView(options)
  const instructions = compute(target, computeOptions)

  if (typeof behavior == 'function') {
    return behavior(instructions)
  }

  instructions.forEach(({ el, top, left }) => {
    // browser implements the new Element.prototype.scroll API that supports `behavior`
    if (el.scroll) {
      el.scroll({ top, left, behavior })
    } else {
      el.scrollTop = top
      el.scrollLeft = left
    }
  })
  console.groupEnd()
}
