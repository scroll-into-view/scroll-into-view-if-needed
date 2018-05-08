import compute from './compute'
import {
  ScrollBehavior,
  CustomScrollBehaviorCallback,
  CustomScrollAction,
  Options as BaseOptions,
} from './types'

export interface StandardBehaviorOptions extends BaseOptions {
  behavior?: ScrollBehavior
}
export interface CustomBehaviorOptions<T> extends BaseOptions {
  behavior: CustomScrollBehaviorCallback<T>
}

export interface Options<T = any> extends BaseOptions {
  behavior?: ScrollBehavior | CustomScrollBehaviorCallback<T>
}

// Wait with checking if native smooth-scrolling exists until scrolling is invoked
// This is much more friendly to server side rendering envs, and testing envs like jest
let supportsScrollBehavior

const isFunction = (arg: any): arg is Function => {
  return typeof arg == 'function'
}
const isOptionsObject = <T>(options: any): options is T => {
  return options === Object(options) && Object.keys(options).length !== 0
}

const defaultBehavior = (
  actions: CustomScrollAction[],
  behavior: ScrollBehavior = 'auto'
) => {
  if (supportsScrollBehavior === undefined) {
    supportsScrollBehavior = 'scrollBehavior' in document.documentElement.style
  }

  actions.forEach(({ el, top, left }) => {
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

const getOptions = (options: any = true): StandardBehaviorOptions => {
  // Handle alignToTop for legacy reasons, to be compatible with the spec
  if (options === true || options === null) {
    return { block: 'start', inline: 'nearest' }
  } else if (options === false) {
    return { block: 'end', inline: 'nearest' }
  } else if (isOptionsObject<StandardBehaviorOptions>(options)) {
    // compute.ts ensures the defaults are block: 'center' and inline: 'nearest', to conform to the spec
    return options
  }

  // if options = {}, based on w3c web platform test
  return { block: 'start', inline: 'nearest' }
}

// Some people might use both "auto" and "ponyfill" modes in the same file, so we also provide a named export so
// that imports in userland code (like if they use native smooth scrolling on some browsers, and the ponyfill for everything else)
// the named export allows this `import {auto as autoScrollIntoView, ponyfill as smoothScrollIntoView} from ...`
function scrollIntoView<T>(
  target: Element,
  options: CustomBehaviorOptions<T>
): T
function scrollIntoView(target: Element, options?: Options | boolean): void
function scrollIntoView<T>(target, options: Options<T> | boolean = true) {
  if (
    isOptionsObject<CustomBehaviorOptions<T>>(options) &&
    isFunction(options.behavior)
  ) {
    return options.behavior(compute(target, options))
  }

  const computeOptions = getOptions(options)
  return defaultBehavior(
    compute(target, computeOptions),
    computeOptions.behavior
  )
}

export default scrollIntoView
