// Compute what scrolling needs to be done on required scrolling boxes for target to be in view

// The type names here are named after the spec to make it easier to find more information around what they mean:
// To reduce churn and reduce things that need be maintained things from the official TS DOM library is used here
// https://drafts.csswg.org/cssom-view/

// For a definition on what is "block flow direction" exactly, check this: https://drafts.csswg.org/css-writing-modes-4/#block-flow-direction
export type BlockFlowDirection =
  | 'cache-first'
  | 'cache-and-network'
  | 'network-only'
  | 'cache-only'
  | 'no-cache'
  | 'standby'

export interface Options {
  block: ScrollLogicalPosition
}

const isElement = el => el != null && typeof el == 'object' && el.nodeType === 1

export const compute = (maybeElement: any, options: Options) => {
  if (!isElement(maybeElement)) {
    throw new Error('Element is required in scrollIntoViewIfNeeded')
  }
  let target = maybeElement as HTMLElement
  console.log(target)
}
