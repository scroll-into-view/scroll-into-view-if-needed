import { compute } from 'compute-scroll-into-view'
import type {
  Options as ComputeOptions,
  Middleware,
  ScrollAction,
} from 'compute-scroll-into-view'
import {
  boundary as limitToBoundary,
  onlyIfNeeded,
  skipOverflowHiddenElements as skipOverflowHidden,
} from 'compute-scroll-into-view/middleware'

/** @public */
export type Options<T = unknown> =
  | StandardBehaviorOptions
  | CustomBehaviorOptions<T>

/** @public */
export interface BaseOptions extends Omit<
  ComputeOptions,
  'scrollMode' | 'boundary' | 'skipOverflowHiddenElements' | 'middleware'
> {
  /**
   * `'if-needed'` only scrolls when the target isn't fully visible, like `Element.scrollIntoViewIfNeeded`.
   * @default 'always'
   */
  scroll?: 'always' | 'if-needed'
  /**
   * Same as `scroll`.
   * @deprecated Use `scroll` instead. `scrollMode` will be removed in the next major version.
   * @default 'always'
   */
  scrollMode?: 'always' | 'if-needed'
  /**
   * Stops scrolling at this element, or at the first parent the callback returns `false` for.
   * The boundary itself is still scrolled, its parents are not.
   * @default null
   */
  boundary?: Element | ((parent: Element) => boolean) | null
  /**
   * Skips scrolling elements that are `overflow: hidden`.
   * @default false
   */
  skipOverflowHiddenElements?: boolean
}

/**
 * Only scrolls if the `node` is partially out of view:
 * ```ts
 * scrollIntoView(node, { scroll: 'if-needed' })
 * ```
 * Skips scrolling `overflow: hidden` elements:
 * ```ts
 * scrollIntoView(node, { skipOverflowHiddenElements: true })
 * ```
 * When scrolling is needed do the least and smoothest scrolling possible:
 * ```ts
 * scrollIntoView(node, {
 *   behavior: 'smooth',
 *   scroll: 'if-needed',
 *   block: 'nearest',
 *   inline: 'nearest',
 * })
 * ```
 * @public
 */
export interface StandardBehaviorOptions extends BaseOptions {
  /**
   * @default 'auto'
   */
  behavior?: ScrollBehavior
}

/** @public */
export interface CustomBehaviorOptions<T = unknown> extends BaseOptions {
  behavior: CustomScrollBehaviorCallback<T>
}

/** @public */
export type CustomScrollBehaviorCallback<T = unknown> = (
  actions: ScrollAction[],
) => T

const isStandardScrollBehavior = (
  options: any,
): options is StandardBehaviorOptions =>
  options === Object(options) && Object.keys(options).length !== 0

const isCustomScrollBehavior = <T = unknown>(
  options: any,
): options is CustomBehaviorOptions<T> =>
  typeof options === 'object' && typeof options?.behavior === 'function'

const getOptions = (options: any): StandardBehaviorOptions => {
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

// No object rest or spread, which would pull helpers into the Baseline 2019 build
const getActions = (
  target: Element,
  options: StandardBehaviorOptions | CustomBehaviorOptions,
): ScrollAction[] => {
  const middleware: Middleware[] = []
  if (options.boundary) {
    middleware.push(limitToBoundary(options.boundary))
  }
  if (options.skipOverflowHiddenElements) {
    middleware.push(skipOverflowHidden())
  }
  // `scroll` wins when both are set. Last, so only the scroll containers that are left decide if scrolling is needed
  const scroll = options.scroll ?? options.scrollMode
  if (scroll === 'if-needed') {
    middleware.push(onlyIfNeeded())
  }
  return compute(target, {
    block: options.block,
    inline: options.inline,
    container: options.container,
    middleware,
  })
}

// Determine if the element is part of the document (including shadow dom)
// Derived from code of Andy Desmarais
// https://terodox.tech/how-to-tell-if-an-element-is-in-the-dom-including-the-shadow-dom/
const isInDocument = (element: Node) => {
  let currentElement = element
  while (currentElement && currentElement.parentNode) {
    if (currentElement.parentNode === document) {
      return true
    } else if (currentElement.parentNode instanceof ShadowRoot) {
      currentElement = currentElement.parentNode.host
    } else {
      currentElement = currentElement.parentNode
    }
  }
  return false
}

/**
 * Scrolls the given element into view, with options for when, and how.
 * Supports the same `options` as [`Element.prototype.scrollIntoView`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) with additions such as `scroll: 'if-needed'`, `behavior: Function` and `skipOverflowHiddenElements`.
 * @public
 */
function scrollIntoView(
  target: Element,
  options?: StandardBehaviorOptions | boolean,
): void
/**
 * Scrolls the given element into view, with options for when, and how.
 * Supports the same `options` as [`Element.prototype.scrollIntoView`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) with additions such as `scroll: 'if-needed'`, `behavior: Function` and `skipOverflowHiddenElements`.
 *
 * You can set the expected return type for `behavior: Function`:
 * ```ts
 * await scrollIntoView<Promise<boolean[]>>(node, {
 *   behavior: async actions => {
 *     return Promise.all(actions.map(
 *       // animate() resolves to `true` if anything was animated, `false` if the element already were in the end state
 *       ({ el, left, top }) => animate(el, {scroll: {left, top}})
 *     ))
 *   }
 * })
 * ```
 * @public
 */
function scrollIntoView<T>(
  target: Element,
  options: CustomBehaviorOptions<T>,
): T
function scrollIntoView<T = unknown>(
  target: Element,
  options?: StandardBehaviorOptions | CustomBehaviorOptions<T> | boolean,
): T | void {
  // Browsers treats targets that aren't in the dom as a no-op and so should we
  if (!target.isConnected || !isInDocument(target)) {
    return
  }

  if (isCustomScrollBehavior<T>(options)) {
    return options.behavior(getActions(target, options))
  }

  const standardOptions = getOptions(options)
  const { behavior } = standardOptions

  // compute-scroll-into-view (>= 3.1) already accounts for the target's scroll-margin
  for (const { el, top, left } of getActions(target, standardOptions)) {
    el.scroll({ top, left, behavior })
  }
}

export default scrollIntoView
