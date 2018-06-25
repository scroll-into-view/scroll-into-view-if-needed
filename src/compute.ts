// Compute what scrolling needs to be done on required scrolling boxes for target to be in view

// The type names here are named after the spec to make it easier to find more information around what they mean:
// To reduce churn and reduce things that need be maintained things from the official TS DOM library is used here
// https://drafts.csswg.org/cssom-view/

// For a definition on what is "block flow direction" exactly, check this: https://drafts.csswg.org/css-writing-modes-4/#block-flow-direction

// add support for visualViewport object currently implemented in chrome
declare global {
  interface Window {
    visualViewport?: {
      height: number
      width: number
    }
  }

  // @TODO better declaration of possible shadowdom hosts
  interface Element {
    host: any
  }
}

import { CustomScrollAction, Options } from './types'
import getViewport from './viewport'

// @TODO better shadowdom test, 11 = document fragment
function isElement(el: any) {
  return (
    el != null &&
    typeof el === 'object' &&
    (el.nodeType === 1 || el.nodeType === 11)
  )
}

function hasScrollableSpace(el: Element, axis: 'X' | 'Y') {
  return axis === 'X'
    ? el.clientWidth < el.scrollWidth
    : el.clientHeight < el.scrollHeight
}

function canOverflow(
  el: Element,
  axis: 'Y' | 'X',
  skipOverflowHiddenElements?: boolean
) {
  const overflowValue = getComputedStyle(el, null)[('overflow' + axis) as any]

  if (skipOverflowHiddenElements && overflowValue === 'hidden') {
    return false
  }

  return overflowValue !== 'visible' && overflowValue !== 'clip'
}

function isScrollable(el: Element, skipOverflowHiddenElements?: boolean) {
  return (
    el === getViewport() ||
    (hasScrollableSpace(el, 'Y') &&
      canOverflow(el, 'Y', skipOverflowHiddenElements)) ||
    (hasScrollableSpace(el, 'X') &&
      canOverflow(el, 'X', skipOverflowHiddenElements))
  )
}

/**
 * Find out which edge to align against when logical scroll position is "nearest"
 * Interesting fact: "nearest" works similarily to "if-needed", if the element is fully visible it will not scroll it
 *
 * Legends:
 * ┌────────┐ ┏ ━ ━ ━ ┓
 * │ target │   frame
 * └────────┘ ┗ ━ ━ ━ ┛
 */
function alignNearest(
  scrollingEdgeStart: number,
  scrollingEdgeEnd: number,
  scrollingSize: number,
  scrollingBorderStart: number,
  scrollingBorderEnd: number,
  elementEdgeStart: number,
  elementEdgeEnd: number,
  elementSize: number
) {
  /**
   * If element edge A and element edge B are both outside scrolling box edge A and scrolling box edge B
   *
   *          ┌──┐
   *        ┏━│━━│━┓
   *          │  │
   *        ┃ │  │ ┃        do nothing
   *          │  │
   *        ┗━│━━│━┛
   *          └──┘
   *
   *  If element edge C and element edge D are both outside scrolling box edge C and scrolling box edge D
   *
   *    ┏ ━ ━ ━ ━ ┓
   *   ┌───────────┐
   *   │┃         ┃│        do nothing
   *   └───────────┘
   *    ┗ ━ ━ ━ ━ ┛
   */
  if (
    (elementEdgeStart < scrollingEdgeStart &&
      elementEdgeEnd > scrollingEdgeEnd) ||
    (elementEdgeStart > scrollingEdgeStart && elementEdgeEnd < scrollingEdgeEnd)
  ) {
    return 0
  }

  /**
   * If element edge A is outside scrolling box edge A and element height is less than scrolling box height
   *
   *          ┌──┐
   *        ┏━│━━│━┓         ┏━┌━━┐━┓
   *          └──┘             │  │
   *  from  ┃      ┃     to  ┃ └──┘ ┃
   *
   *        ┗━ ━━ ━┛         ┗━ ━━ ━┛
   *
   * If element edge B is outside scrolling box edge B and element height is greater than scrolling box height
   *
   *        ┏━ ━━ ━┓         ┏━┌━━┐━┓
   *                           │  │
   *  from  ┃ ┌──┐ ┃     to  ┃ │  │ ┃
   *          │  │             │  │
   *        ┗━│━━│━┛         ┗━│━━│━┛
   *          │  │             └──┘
   *          │  │
   *          └──┘
   *
   * If element edge C is outside scrolling box edge C and element width is less than scrolling box width
   *
   *       from                 to
   *    ┏ ━ ━ ━ ━ ┓         ┏ ━ ━ ━ ━ ┓
   *  ┌───┐                 ┌───┐
   *  │ ┃ │       ┃         ┃   │     ┃
   *  └───┘                 └───┘
   *    ┗ ━ ━ ━ ━ ┛         ┗ ━ ━ ━ ━ ┛
   *
   * If element edge D is outside scrolling box edge D and element width is greater than scrolling box width
   *
   *       from                 to
   *    ┏ ━ ━ ━ ━ ┓         ┏ ━ ━ ━ ━ ┓
   *        ┌───────────┐   ┌───────────┐
   *    ┃   │     ┃     │   ┃         ┃ │
   *        └───────────┘   └───────────┘
   *    ┗ ━ ━ ━ ━ ┛         ┗ ━ ━ ━ ━ ┛
   */
  if (
    (elementEdgeStart < scrollingEdgeStart && elementSize < scrollingSize) ||
    (elementEdgeEnd > scrollingEdgeEnd && elementSize > scrollingSize)
  ) {
    return elementEdgeStart - scrollingEdgeStart - scrollingBorderStart
  }

  /**
   * If element edge B is outside scrolling box edge B and element height is less than scrolling box height
   *
   *        ┏━ ━━ ━┓         ┏━ ━━ ━┓
   *
   *  from  ┃      ┃     to  ┃ ┌──┐ ┃
   *          ┌──┐             │  │
   *        ┗━│━━│━┛         ┗━└━━┘━┛
   *          └──┘
   *
   * If element edge A is outside scrolling box edge A and element height is greater than scrolling box height
   *
   *          ┌──┐
   *          │  │
   *          │  │             ┌──┐
   *        ┏━│━━│━┓         ┏━│━━│━┓
   *          │  │             │  │
   *  from  ┃ └──┘ ┃     to  ┃ │  │ ┃
   *                           │  │
   *        ┗━ ━━ ━┛         ┗━└━━┘━┛
   *
   * If element edge C is outside scrolling box edge C and element width is greater than scrolling box width
   *
   *           from                 to
   *        ┏ ━ ━ ━ ━ ┓         ┏ ━ ━ ━ ━ ┓
   *  ┌───────────┐           ┌───────────┐
   *  │     ┃     │   ┃       │ ┃         ┃
   *  └───────────┘           └───────────┘
   *        ┗ ━ ━ ━ ━ ┛         ┗ ━ ━ ━ ━ ┛
   *
   * If element edge D is outside scrolling box edge D and element width is less than scrolling box width
   *
   *           from                 to
   *        ┏ ━ ━ ━ ━ ┓         ┏ ━ ━ ━ ━ ┓
   *                ┌───┐             ┌───┐
   *        ┃       │ ┃ │       ┃     │   ┃
   *                └───┘             └───┘
   *        ┗ ━ ━ ━ ━ ┛         ┗ ━ ━ ━ ━ ┛
   *
   */
  if (
    (elementEdgeEnd > scrollingEdgeEnd && elementSize < scrollingSize) ||
    (elementEdgeStart < scrollingEdgeStart && elementSize > scrollingSize)
  ) {
    return elementEdgeEnd - scrollingEdgeEnd + scrollingBorderEnd
  }

  return 0
}

export default (
  target: Element,
  options: Options = {}
): CustomScrollAction[] => {
  const {
    scrollMode,
    block,
    inline = 'nearest',
    boundary,
    skipOverflowHiddenElements,
  } = options
  // Allow using a callback to check the boundary
  // The default behavior is to check if the current target matches the boundary element or not
  // If undefined it'll check that target is never undefined (can happen as we recurse up the tree)
  const checkBoundary =
    typeof boundary === 'function' ? boundary : (node: any) => node !== boundary

  if (!isElement(target)) {
    throw new Error('Element is required in scrollIntoView')
  }

  const targetRect = target.getBoundingClientRect()

  // Collect all the scrolling boxes, as defined in the spec: https://drafts.csswg.org/cssom-view/#scrolling-box
  const frames: Element[] = []
  let parent
  // @TODO have a better shadowdom test here
  while (
    isElement((parent = target.parentNode || target.host)) &&
    checkBoundary(target)
  ) {
    if (isScrollable(parent, skipOverflowHiddenElements)) {
      frames.push(parent)
    }

    // next tick
    target = parent
  }

  // Workaround Chrome's behavior on clientHeight/clientWidth after introducing visualViewport
  // https://www.quirksmode.org/blog/archives/2016/02/chrome_change_b.html
  const viewport = getViewport()
  const viewportWidth = window.visualViewport
    ? window.visualViewport.width
    : Math.min(viewport.clientWidth, window.innerWidth)
  const viewportHeight = window.visualViewport
    ? window.visualViewport.height
    : Math.min(viewport.clientHeight, window.innerHeight)
  const viewportX = window.scrollX || window.pageXOffset
  const viewportY = window.scrollY || window.pageYOffset

  // If the element is already visible we can end it here
  if (scrollMode === 'if-needed') {
    // @TODO optimize, as getBoundingClientRect is also called from computations loop
    const isVisible = frames.every(frame => {
      const frameRect = frame.getBoundingClientRect()

      if (targetRect.top < frameRect.top) {
        return false
      }
      if (targetRect.bottom > frameRect.bottom) {
        return false
      }

      if (frame === viewport) {
        if (targetRect.bottom > viewportHeight || targetRect.top < 0) {
          return false
        }
        if (targetRect.left > viewportWidth || targetRect.right < 0) {
          return false
        }
      }
      return true
    })
    if (isVisible) {
      return []
    }
  }

  // @TODO remove duplicate results
  // These values mutate as we loop through and generate scroll coordinates
  let targetBlock: number =
    block === 'start'
      ? targetRect.top
      : block === 'end'
        ? targetRect.bottom
        : block === 'nearest'
          ? targetRect.top
          : targetRect.top + targetRect.height / 2 // block === 'center
  let targetInline: number =
    inline === 'start'
      ? targetRect.left
      : inline === 'center'
        ? targetRect.left + targetRect.width / 2
        : inline === 'end'
          ? targetRect.right
          : targetRect.left // inline === 'nearest

  // Collect new scroll positions
  const computations = frames.map(
    (frame): CustomScrollAction => {
      const frameRect = frame.getBoundingClientRect()

      const frameStyle = getComputedStyle(frame)
      const borderLeft = parseInt(frameStyle.borderLeftWidth as string, 10)
      const borderTop = parseInt(frameStyle.borderTopWidth as string, 10)
      const borderRight = parseInt(frameStyle.borderRightWidth as string, 10)
      const borderBottom = parseInt(frameStyle.borderBottomWidth as string, 10)
      // The property existance checks for offfset[Width|Height] is because only HTMLElement objects have them, but any Element might pass by here
      // @TODO find out if the "as HTMLElement" overrides can be dropped
      const scrollbarWidth =
        'offsetWidth' in frame
          ? (frame as HTMLElement).offsetWidth -
            (frame as HTMLElement).clientWidth -
            borderLeft -
            borderRight
          : 0
      const scrollbarHeight =
        'offsetHeight' in frame
          ? (frame as HTMLElement).offsetHeight -
            (frame as HTMLElement).clientHeight -
            borderTop -
            borderBottom
          : 0

      let blockScroll: number = 0
      let inlineScroll: number = 0

      if (block === 'start') {
        blockScroll =
          viewport === frame
            ? viewportY + targetBlock
            : targetBlock - frameRect.top - borderTop
      }
      if (block === 'center') {
        blockScroll =
          viewport === frame
            ? viewportY + targetBlock - viewportHeight / 2
            : frame.scrollTop -
              (frameRect.top + frameRect.height / 2 - targetBlock)
      }
      if (block === 'end') {
        blockScroll =
          viewport === frame
            ? viewportY + (targetBlock - viewportHeight)
            : frame.scrollTop -
              (frameRect.bottom - targetBlock) +
              borderBottom +
              scrollbarHeight
      }
      if (block === 'nearest') {
        blockScroll =
          viewport === frame
            ? viewportY +
              alignNearest(
                viewportY,
                viewportY + viewportHeight,
                viewportHeight,
                borderTop,
                borderBottom,
                viewportY + targetBlock,
                viewportY + targetBlock + targetRect.height,
                targetRect.height
              )
            : frame.scrollTop +
              alignNearest(
                frameRect.top,
                frameRect.bottom,
                frameRect.height,
                borderTop,
                borderBottom + scrollbarHeight,
                targetBlock,
                targetBlock + targetRect.height,
                targetRect.height
              )
      }

      if (inline === 'start') {
        inlineScroll =
          viewport === frame
            ? viewportX + targetInline
            : frame.scrollLeft + (targetInline - frameRect.left) - borderLeft
      }
      if (inline === 'center') {
        inlineScroll =
          viewport === frame
            ? viewportX + targetInline - viewportWidth / 2
            : frame.scrollLeft -
              (frameRect.left + frameRect.width / 2 - targetInline)
      }
      if (inline === 'end') {
        inlineScroll =
          viewport === frame
            ? viewportX + (targetInline - viewportWidth)
            : frame.scrollLeft -
              (frameRect.right - targetInline) +
              borderRight +
              scrollbarWidth
      }
      if (inline === 'nearest') {
        inlineScroll =
          viewport === frame
            ? viewportX +
              alignNearest(
                viewportX,
                viewportX + viewportWidth,
                viewportWidth,
                borderLeft,
                borderRight,
                viewportX + targetInline,
                viewportX + targetInline + targetRect.width,
                targetRect.width
              )
            : frame.scrollLeft +
              alignNearest(
                frameRect.left,
                frameRect.right,
                frameRect.width,
                borderLeft,
                borderRight + scrollbarWidth,
                targetInline,
                targetInline + targetRect.width,
                targetRect.width
              )
      }

      // Cache the offset so that parent frames can scroll this into view correctly
      targetBlock += frame.scrollTop - blockScroll
      targetInline += frame.scrollLeft - inlineScroll

      return { el: frame, top: blockScroll, left: inlineScroll }
    }
  )

  return computations
}
