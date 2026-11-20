import { compute } from 'compute-scroll-into-view'
import type {
  Options as ComputeOptions,
  Middleware,
  RequireSelection,
  ScrollAction,
  SelectionMiddleware,
} from 'compute-scroll-into-view'
import { onlyIfNeeded, selection } from 'compute-scroll-into-view/middleware'

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

/**
 * The options for a `Range` or `Selection` target, where `middleware` has to include `selection()`. An element target
 * doesn't need it.
 * @public
 */
export interface SelectionTargetOptions<
  M extends readonly Middleware[],
> extends Omit<StandardBehaviorOptions, 'middleware'> {
  middleware: M & RequireSelection<M>
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

// The type only says that selection() is in the list, which is all compute() asks for
const hasSelection = (
  list: Middleware[],
): list is [...Middleware[], SelectionMiddleware] =>
  list.some(({ name }) => name === 'selection')

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
  const { block, inline, container } = options
  if ('nodeType' in target) {
    return compute(target, { block, inline, container, middleware })
  }
  // TypeScript only accepts a Range or Selection with selection() in the middleware. Without it, which plain
  // JavaScript allows, the box around the whole selection is aligned, like compute() does
  return compute(target, {
    block,
    inline,
    container,
    middleware: hasSelection(middleware)
      ? middleware
      : [selection(undefined, { align: 'bounds' }), ...middleware],
  })
}

// Walks out of open and closed shadow trees in the target's own realm, then
// compares that root with ownerDocument. An iframe target is connected to its
// own document, so this does not use the caller's document or ShadowRoot.
const isInDocument = (element: Node) =>
  element.getRootNode({ composed: true }) === element.ownerDocument

// compute() walks from the focus end of a Range or Selection, so that is the node that has to be connected
const getNode = (target: Element | Range | Selection): Node | null =>
  'rangeCount' in target
    ? target.focusNode
    : 'endContainer' in target
      ? target.endContainer
      : target

/**
 * Scrolls the given element, or the text in a `Range` or `Selection`, into view, with options for when, and how.
 * Supports the same `options` as [`Element.prototype.scrollIntoView`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) with additions such as `scroll: 'if-needed'` and `middleware`.
 * To scroll with your own animation, call `compute()` from `compute-scroll-into-view` and apply the actions it returns.
 * @public
 */
function scrollIntoView(
  target: Element,
  options?: StandardBehaviorOptions | boolean,
): void
/**
 * Scrolls the text in a `Range` or `Selection` into view. `middleware` has to include `selection()` from
 * `scroll-into-view-if-needed/middleware`, which aligns the caret: the end of a `Range`, or the focus of a
 * `Selection`. To align the whole text, use `selection(undefined, { align: 'bounds' })`.
 * @public
 */
function scrollIntoView<const M extends readonly Middleware[]>(
  target: Range | Selection,
  options: SelectionTargetOptions<M>,
): void
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
