// The public types of compute-scroll-into-view 4.0.0 (scroll-into-view/compute-scroll-into-view#953), while
// ^3.2.2 is installed. Delete this file once 4.0.0 is.

declare module 'compute-scroll-into-view' {
  export type ScrollIntoViewContainer = 'all' | 'nearest'

  export interface Options {
    block?: ScrollLogicalPosition // default 'center'
    inline?: ScrollLogicalPosition // default 'nearest'
    container?: ScrollIntoViewContainer // default 'all'
    middleware?: Middleware[] // default []
  }

  export interface ScrollAction {
    el: Element
    top: number
    left: number
  }

  /** Edges in viewport coordinates, like `getBoundingClientRect()`, or the lengths of the sides of a box in pixels */
  export interface SideObject {
    top: number
    right: number
    bottom: number
    left: number
  }

  /** Measured before anything is scrolled */
  export interface Rects {
    /** The scroll container's padding box without scrollbars. For the viewport, the visual viewport */
    scrollport: SideObject
    /** The target's border box. The scrolling of inner scroll containers is added to it when it's aligned */
    target: SideObject
    /** The scroll container's `scroll-padding`, in pixels. For the viewport, the root element's */
    scrollPadding: SideObject
    /** The target's `scroll-margin`, in pixels */
    scrollMargin: SideObject
  }

  export interface MiddlewareState {
    readonly target: Element
    /** The ancestor of the target that is considered */
    readonly container: Element
    /** Whether `container` is the scrolling element of the document, which scrolls the viewport. It's the last one */
    readonly viewport: boolean
    /** Whether `container` gets scrolled: it's a scroll container, and no middleware so far returned `scrollable: false` */
    readonly scrollable: boolean
    readonly options: Readonly<
      Required<Pick<Options, 'block' | 'inline' | 'container'>>
    >
    /** Measured the first time it's read, and with what earlier middleware returned in `rects` */
    readonly rects: Rects
  }

  export interface MiddlewareReturn {
    /** Whether `container` gets scrolled. `false` leaves it alone, the target is aligned in the outer ones regardless */
    scrollable?: boolean
    /** Don't consider the ancestors of `container`. Together with `scrollable: false`, not `container` either */
    stop?: boolean
    /** Use these measurements instead, for the middleware after this one and for aligning the target */
    rects?: Partial<Rects>
  }

  export interface Middleware {
    name: string
    /** Returns `{}` to change nothing */
    fn: (state: MiddlewareState) => MiddlewareReturn
  }

  export const compute: (target: Element, options?: Options) => ScrollAction[]
}

declare module 'compute-scroll-into-view/middleware' {
  import type { Middleware } from 'compute-scroll-into-view'

  export const onlyIfNeeded: () => Middleware
  export const boundary: (
    limit: Element | ((parent: Element) => boolean) | null | undefined,
  ) => Middleware
  export const skipOverflowHiddenElements: () => Middleware
}
