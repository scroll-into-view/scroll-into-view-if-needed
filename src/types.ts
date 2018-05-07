// Standard, based on CSSOM View spec
export type ScrollBehavior = 'auto' | 'instant' | 'smooth'
export type ScrollLogicalPosition = 'start' | 'center' | 'end' | 'nearest'
// This new option is tracked in this PR, which is the most likely candidate at the time: https://github.com/w3c/csswg-drafts/pull/1805
export type ScrollMode = 'always' | 'if-needed'

export interface Options {
  block?: ScrollLogicalPosition
  inline?: ScrollLogicalPosition
  scrollMode?: ScrollMode
  boundary?: CustomScrollBoundary
}

// Custom behavior, not in any spec
export interface CustomScrollBoundaryCallback {
  (parent: Element): boolean
}
export type CustomScrollBoundary = Element | CustomScrollBoundaryCallback
export type CustomScrollAction = { el: Element; top: number; left: number }
export interface CustomScrollBehaviorCallback<T> {
  (actions: CustomScrollAction[]): T
}
