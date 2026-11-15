import { compute } from 'compute-scroll-into-view'
import type {
  Options as BaseOptions,
  ScrollAction,
} from 'compute-scroll-into-view'

/** @public */
export type Options<T = unknown> =
  | StandardBehaviorOptions
  | CustomBehaviorOptions<T>

/**
 * Only scrolls if the `node` is partially out of view:
 * ```ts
 * scrollIntoView(node, { scrollMode: 'if-needed' })
 * ```
 * Skips scrolling `overflow: hidden` elements:
 * ```ts
 * scrollIntoView(node, { skipOverflowHiddenElements: true })
 * ```
 * When scrolling is needed do the least and smoothest scrolling possible:
 * ```ts
 * scrollIntoView(node, {
 *   behavior: 'smooth',
 *   scrollMode: 'if-needed',
 *   block: 'nearest',
 *   inline: 'nearest',
 * })
 * ```
 * @public
 */
export interface StandardBehaviorOptions extends BaseOptions {
  /** Scroll all ancestors (default) or only the nearest scrolling box. */
  container?: 'all' | 'nearest'
  /**
   * @defaultValue 'auto'
   */
  behavior?: ScrollBehavior | 'instant'
}

/** @public */
export interface CustomBehaviorOptions<T = unknown> extends BaseOptions {
  /** Scroll all ancestors (default) or only the nearest scrolling box. */
  container?: 'all' | 'nearest'
  behavior: CustomScrollBehaviorCallback<T>
}

/** @public */
export type CustomScrollBehaviorCallback<T = unknown> = (
  actions: ScrollAction[],
) => T

/** Completion result returned by browsers implementing the current CSSOM View draft. @public */
export interface ScrollResult {
  interrupted: boolean
}

const isCustomScrollBehavior = <T = unknown>(
  options: unknown,
): options is CustomBehaviorOptions<T> =>
  options != null &&
  typeof (options as CustomBehaviorOptions<T>).behavior === 'function'

const getOptions = (options?: Options | boolean | null): BaseOptions => {
  if (options === false) return { block: 'end', inline: 'nearest' }
  // Dictionary defaults apply even when only behavior or container is supplied.
  return {
    ...(typeof options === 'object' ? options : {}),
    block: (typeof options === 'object' && options?.block) || 'start',
    inline: (typeof options === 'object' && options?.inline) || 'nearest',
  }
}

/**
 * Scrolls the given element into view, with options for when, and how.
 * Supports the same `options` as [`Element.prototype.scrollIntoView`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) with additions such as `scrollMode`, `behavior: Function` and `skipOverflowHiddenElements`.
 * @public
 */
function scrollIntoView(
  target: Element,
  options?: StandardBehaviorOptions | boolean | null,
): Promise<ScrollResult> | void
/**
 * Scrolls the given element into view, with options for when, and how.
 * Supports the same `options` as [`Element.prototype.scrollIntoView`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) with additions such as `scrollMode`, `behavior: Function` and `skipOverflowHiddenElements`.
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
  options?: StandardBehaviorOptions | CustomBehaviorOptions<T> | boolean | null,
): T | Promise<ScrollResult> | void {
  const actions =
    target.isConnected && target.getClientRects().length > 0
      ? compute(target, getOptions(options))
      : []

  if (isCustomScrollBehavior<T>(options)) {
    // Invoke even for a no-op so custom promise-returning behaviors can settle.
    return options.behavior(actions)
  }

  const behavior = typeof options === 'object' ? options?.behavior : undefined
  const promises: Promise<ScrollResult>[] = []
  let hasLegacyScroll = false
  for (const { el, top, left } of actions) {
    // Older DOM declarations still type scroll() as void. Keep the native
    // promise, when provided, without claiming legacy smooth scrolling is done.
    const result: unknown = el.scroll({
      top,
      left,
      behavior: behavior as ScrollBehavior,
    })
    if (
      result &&
      typeof (result as Promise<ScrollResult>).then === 'function'
    ) {
      promises.push(Promise.resolve(result as Promise<ScrollResult>))
    } else {
      hasLegacyScroll = true
    }
  }
  if (!hasLegacyScroll) {
    return Promise.all(promises).then((results) => ({
      interrupted: results.some((result) => result.interrupted),
    }))
  }
}

export default scrollIntoView
