import { compute } from 'compute-scroll-into-view'
import type {
  Options as ComputeOptions,
  Middleware,
  ScrollAction,
} from 'compute-scroll-into-view'
import { onlyIfNeeded } from 'compute-scroll-into-view/middleware'

/** @public */
export type Options = StandardBehaviorOptions

/** @public */
export interface BaseOptions extends ComputeOptions {
  /**
   * `'if-needed'` only scrolls when the target isn't fully visible, like `Element.scrollIntoViewIfNeeded`.
   * `onlyIfNeeded()` is added after `middleware`.
   * @default 'always'
   */
  scroll?: 'always' | 'if-needed'
  /**
   * Same as `scroll`.
   * @deprecated Use `scroll` instead. `scrollMode` will be removed in the next major version.
   * @default 'always'
   */
  scrollMode?: 'always' | 'if-needed'
}

/**
 * Only scrolls if the `node` is partially out of view:
 * ```ts
 * scrollIntoView(node, { scroll: 'if-needed' })
 * ```
 * Only scrolls the nearest scroll container:
 * ```ts
 * scrollIntoView(node, { container: 'nearest' })
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

const isStandardScrollBehavior = (
  options: any,
): options is StandardBehaviorOptions =>
  options === Object(options) && Object.keys(options).length !== 0

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
  target: Element | Range | Selection,
  options: StandardBehaviorOptions,
): ScrollAction[] => {
  const middleware: Middleware[] = []
  // User middleware runs before `onlyIfNeeded()`
  if (options.middleware) {
    for (const item of options.middleware) {
      middleware.push(item)
    }
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

// Walks out of open and closed shadow trees in the target's own realm, then
// compares that root with ownerDocument. An iframe target is connected to its
// own document, so this does not use the caller's document or ShadowRoot.
const isInDocument = (element: Node) =>
  element.getRootNode({ composed: true }) === element.ownerDocument

// compute() walks from the focus end of a Range or Selection, so that is the node that has to be connected.
// Nodes first: a form/fieldset can expose named controls as `rangeCount` or `endContainer`.
const getNode = (target: Element | Range | Selection): Node | null =>
  'nodeType' in target
    ? target
    : 'rangeCount' in target
      ? target.focusNode
      : target.endContainer

/**
 * Scrolls the given element, or the text in a `Range` or `Selection`, into view, with options for when, and how.
 * Supports the same `options` as [`Element.prototype.scrollIntoView`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) with additions such as `scroll: 'if-needed'` and `middleware`.
 * Add `selection()` from `scroll-into-view-if-needed/middleware` to align the caret of a `Range` or `Selection` instead of the whole text.
 * To scroll with your own animation, call `compute()` from `compute-scroll-into-view` and apply the actions it returns.
 * @public
 */
function scrollIntoView(
  target: Element | Range | Selection,
  options?: StandardBehaviorOptions | boolean,
): void {
  const node = getNode(target)
  // Browsers treats targets that aren't in the dom as a no-op and so should we
  if (!node?.isConnected || !isInDocument(node)) {
    return
  }

  const standardOptions = getOptions(options)
  const { behavior } = standardOptions

  // compute-scroll-into-view (>= 3.1) already accounts for the target's scroll-margin
  for (const { el, top, left } of getActions(target, standardOptions)) {
    el.scroll({ top, left, behavior })
  }
}

export default scrollIntoView
