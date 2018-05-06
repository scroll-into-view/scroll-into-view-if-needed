// Standard, based on CSSOM View spec
export type ScrollBehavior = 'auto' | 'instant' | 'smooth'
export type ScrollLogicalPosition = 'start' | 'center' | 'end' | 'nearest'
// This new option is tracked in this PR, which is the most likely candidate at the time: https://github.com/w3c/csswg-drafts/pull/1805
export type ScrollMode = 'always' | 'if-needed'

// Custom behavior, not in any spec
export interface CustomBoundaryCallback {
  (parent: Element): boolean
}
export type CustomBoundary = Element | CustomBoundaryCallback
