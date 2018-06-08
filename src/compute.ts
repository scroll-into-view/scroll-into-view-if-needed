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
const isElement = el =>
  el != null &&
  typeof el === 'object' &&
  (el.nodeType === 1 || el.nodeType === 11)

const hasScrollableSpace = (el, axis: 'X' | 'Y') =>
  axis === 'X'
    ? el.clientWidth < el.scrollWidth
    : el.clientHeight < el.scrollHeight

const canOverflow = (
  el,
  axis: 'Y' | 'X',
  skipOverflowHiddenElements: boolean
) => {
  const overflowValue = getComputedStyle(el, null)['overflow' + axis]

  if (skipOverflowHiddenElements && overflowValue === 'hidden') {
    return false
  }

  return overflowValue !== 'visible' && overflowValue !== 'clip'
}

const isScrollable = (el, skipOverflowHiddenElements: boolean) =>
  el === getViewport() ||
  (hasScrollableSpace(el, 'Y') &&
    canOverflow(el, 'Y', skipOverflowHiddenElements)) ||
  (hasScrollableSpace(el, 'X') &&
    canOverflow(el, 'X', skipOverflowHiddenElements))

/**
 * Find out which edge to align against when logical scroll position is "nearest"
 * Interesting fact: "nearest" works similarily to "if-needed", if the element is fully visible it will not scroll it
 *
 * Legends:
 * ┌────────┐ ┏ ━ ━ ━ ┓
 * │ target │   frame
 * └────────┘ ┗ ━ ━ ━ ┛
 */
const alignNearest = (
  scrollingEdgeStart: number,
  scrollingEdgeEnd: number,
  scrollingSize: number,
  scrollingBorderStart: number,
  scrollingBorderEnd: number,
  elementEdgeStart: number,
  elementEdgeEnd: number,
  elementSize: number
) => {
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
    scrollMode = 'always',
    block = 'center',
    inline = 'nearest',
    boundary,
    skipOverflowHiddenElements = false,
  } = options
  // Allow using a callback to check the boundary
  // The default behavior is to check if the current target matches the boundary element or not
  // If undefined it'll check that target is never undefined (can happen as we recurse up the tree)
  const checkBoundary =
    typeof boundary === 'function' ? boundary : node => node !== boundary

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

  // These values mutate as we loop through and generate scroll coordinates
  let targetBlock
  let targetInline

  // Collect new scroll positions
  const computations = frames.map(
    (frame): CustomScrollAction => {
      const frameRect = frame.getBoundingClientRect()
      const frameStyle = getComputedStyle(frame)
      const borderLeft = parseInt(frameStyle.borderLeftWidth as string, 10)
      const borderTop = parseInt(frameStyle.borderTopWidth as string, 10)
      const borderRight = parseInt(frameStyle.borderRightWidth as string, 10)
      const borderBottom = parseInt(frameStyle.borderBottomWidth as string, 10)

      let blockScroll = 0
      let inlineScroll = 0

      // @TODO fix the if else pyramid nightmare

      if (block === 'start') {
        if (!targetBlock) {
          targetBlock = targetRect.top
        }
        if (viewport === frame) {
          blockScroll = viewportY + targetBlock
        } else {
          // prevent scrollTop values that overflow the scrollHeight
          const offset = Math.min(
            targetBlock - frameRect.top,
            frame.scrollHeight - frame.clientHeight - frame.scrollTop
          )
          blockScroll = frame.scrollTop + offset - borderTop
        }
      }
      if (block === 'center') {
        if (!targetBlock) {
          targetBlock = targetRect.top + targetRect.height / 2
        }
        if (viewport === frame) {
          blockScroll = viewportY + targetBlock - viewportHeight / 2
        } else {
          // prevent negative scrollTop values
          const offset =
            0 -
            Math.min(
              frameRect.top + frameRect.height / 2 - targetBlock,
              frame.scrollTop
            )

          blockScroll = frame.scrollTop + offset
        }
      }

      if (block === 'end') {
        if (!targetBlock) {
          targetBlock = targetRect.bottom
        }
        if (viewport === frame) {
          blockScroll = viewportY + targetBlock - viewportHeight
        } else {
          // prevent negative scrollTop values
          const offset =
            0 - Math.min(frameRect.bottom - targetBlock, frame.scrollTop)

          blockScroll = frame.scrollTop + offset + borderBottom
        }
      }

      if (block === 'nearest') {
        if (!targetBlock) {
          targetBlock = targetRect.top
        }

        if (viewport === frame) {
          const offset = alignNearest(
            viewportY,
            viewportY + viewportHeight,
            viewportHeight,
            borderTop,
            borderBottom,
            viewportY + targetBlock,
            viewportY + targetBlock + targetRect.height,
            targetRect.height
          )

          blockScroll = viewportY + offset
        } else {
          const offset = alignNearest(
            frameRect.top,
            frameRect.bottom,
            frameRect.height,
            borderTop,
            borderBottom,
            targetBlock,
            targetBlock + targetRect.height,
            targetRect.height
          )
          blockScroll = frame.scrollTop + offset
        }
      }

      if (inline === 'start') {
        if (!targetInline) {
          targetInline = targetRect.left
        }
        if (viewport === frame) {
          inlineScroll = viewportX + targetInline
        } else {
          // prevent scrollLeft values that overflow the scrollLeft
          const offset = Math.min(
            targetInline - frameRect.left,
            frame.scrollHeight - frame.clientLeft - frame.scrollLeft
          )
          inlineScroll = frame.scrollLeft + offset - borderLeft
        }
      }

      if (inline === 'center') {
        if (!targetInline) {
          targetInline = targetRect.left + targetRect.width / 2
        }
        if (viewport === frame) {
          inlineScroll = viewportX + targetInline - viewportWidth / 2
        } else {
          // prevent negative scrollLeft values
          const offset =
            0 -
            Math.min(
              frameRect.left + frameRect.width / 2 - targetInline,
              frame.scrollLeft
            )

          inlineScroll = frame.scrollLeft + offset
        }
      }

      if (inline === 'end') {
        if (!targetInline) {
          targetInline = targetRect.right
        }
        if (viewport === frame) {
          inlineScroll = viewportX + targetInline - viewportWidth
        } else {
          // prevent negative scrollLeft values
          const offset =
            0 - Math.min(frameRect.right - targetInline, frame.scrollLeft)

          inlineScroll = frame.scrollLeft + offset + borderRight
        }
      }

      if (inline === 'nearest') {
        if (!targetInline) {
          targetInline = targetRect.left
        }

        if (viewport === frame) {
          const offset = alignNearest(
            viewportX,
            viewportX + viewportWidth,
            viewportWidth,
            borderLeft,
            borderRight,
            viewportX + targetInline,
            viewportX + targetInline + targetRect.width,
            targetRect.width
          )

          inlineScroll = viewportX + offset
        } else {
          const offset = alignNearest(
            frameRect.left,
            frameRect.right,
            frameRect.width,
            borderLeft,
            borderRight,
            targetInline,
            targetInline + targetRect.width,
            targetRect.width
          )

          inlineScroll = frame.scrollLeft + offset
        }
      }

      // Cache the offset so that parent frames can scroll this into view correctly
      targetBlock += frame.scrollTop - blockScroll
      targetInline += frame.scrollLeft - inlineScroll

      return { el: frame, top: blockScroll, left: inlineScroll }
    }
  )

  return computations
}
