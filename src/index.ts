import compute from './compute'
import {
  CustomScrollAction,
  CustomScrollBehaviorCallback,
  Options as BaseOptions,
  ScrollBehavior,
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

function isOptionsObject<T>(options: any): options is T {
  return options === Object(options) && Object.keys(options).length !== 0
}

function defaultBehavior(
  actions: CustomScrollAction[],
  behavior: ScrollBehavior = 'auto'
) {
  const canSmoothScroll = 'scrollBehavior' in document.body.style

  actions.forEach(({ el, top, left }) => {
    // browser implements the new Element.prototype.scroll API that supports `behavior`
    // and guard window.scroll with supportsScrollBehavior
    if (el.scroll && canSmoothScroll) {
      el.scroll({ top, left, behavior })
    } else {
      el.scrollTop = top
      el.scrollLeft = left
    }
  })
}

function getOptions(options: any): StandardBehaviorOptions {
  // Handle alignToTop for legacy reasons, to be compatible with the spec
  if (options === false) {
    return { block: 'end', inline: 'nearest' }
  }

  if (isOptionsObject<StandardBehaviorOptions>(options)) {
    // compute.ts ensures the defaults are block: 'center' and inline: 'nearest', to conform to the spec
    return options
  }

  // if options = {}, options = true or options = null, based on w3c web platform test
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
function scrollIntoView<T>(target: Element, options?: Options<T> | boolean) {
  if (
    isOptionsObject<CustomBehaviorOptions<T>>(options) &&
    typeof options.behavior === 'function'
  ) {
    return options.behavior(compute(target, options))
  }

  // @TODO see if it's possible to avoid this assignment
  const computeOptions = getOptions(options)
  return defaultBehavior(
    compute(target, computeOptions),
    computeOptions.behavior
  )
}

export default scrollIntoView
