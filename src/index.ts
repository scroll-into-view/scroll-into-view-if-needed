import compute from 'compute-scroll-into-view'
import type {
  Options as BaseOptions,
  ScrollAction,
} from 'compute-scroll-into-view'

/** @public */
export type Options<T = unknown> =
  | StandardBehaviorOptions
  | CustomBehaviorOptions<T>

/** @public */
export interface StandardBehaviorOptions extends BaseOptions {
  /**
   * @defaultValue 'auto
   */
  behavior?: ScrollBehavior
}

/** @public */
export interface CustomBehaviorOptions<T = unknown> extends BaseOptions {
  behavior: CustomScrollBehaviorCallback<T>
}

/** @public */
export type CustomScrollBehaviorCallback<T = unknown> = (
  actions: ScrollAction[]
) => T

let isStandardScrollBehavior = (
  options: any
): options is StandardBehaviorOptions =>
  options === Object(options) && Object.keys(options).length !== 0

let isCustomScrollBehavior = <T = unknown>(
  options: any
): options is CustomBehaviorOptions<T> =>
  typeof options === 'object' ? typeof options.behavior === 'function' : false

let getOptions = (options: any): StandardBehaviorOptions => {
  // Handle alignToTop for legacy reasons, to be compatible with the spec
  if (options === false) {
    return { block: 'end', inline: 'nearest' }
  }

  if (isStandardScrollBehavior(options)) {
    // compute.ts ensures the defaults are block: 'center' and inline: 'nearest', to conform to the spec
    return options
  }

  // if options = {}, options = true or options = null, based on w3c web platform test
  return { block: 'start', inline: 'nearest' }
}

// Some people might use both "auto" and "ponyfill" modes in the same file, so we also provide a named export so
// that imports in userland code (like if they use native smooth scrolling on some browsers, and the ponyfill for everything else)
// the named export allows this `import {auto as autoScrollIntoView, ponyfill as smoothScrollIntoView} from ...`
/** @public */
export default function scrollIntoView<T>(
  target: Element,
  options: CustomBehaviorOptions<T>
): T
/** @public */
export default function scrollIntoView(
  target: Element,
  options?: StandardBehaviorOptions | boolean
): void
/** @public */
export default function scrollIntoView<T = unknown>(
  target: Element,
  options?: StandardBehaviorOptions | CustomBehaviorOptions<T> | boolean
): T | void {
  // Browsers treats targets that aren't in the dom as a no-op and so should we
  let isTargetAttached =
    target.isConnected ||
    target.ownerDocument!.documentElement!.contains(target)

  if (isCustomScrollBehavior<T>(options)) {
    return options.behavior(isTargetAttached ? compute(target, options) : [])
  }

  // Don't do anything if using a standard behavior on an element that is not in the document
  if (!isTargetAttached) {
    return
  }

  // @TODO see if it's possible to avoid this assignment
  let computeOptions = getOptions(options)
  let actions = compute(target, computeOptions)
  let canSmoothScroll = 'scrollBehavior' in document.body.style

  actions.forEach(({ el, top, left }) => {
    // browser implements the new Element.prototype.scroll API that supports `behavior`
    // and guard window.scroll with supportsScrollBehavior
    if (el.scroll && canSmoothScroll) {
      el.scroll({ top, left, behavior: computeOptions.behavior })
    } else {
      el.scrollTop = top
      el.scrollLeft = left
    }
  })
}
