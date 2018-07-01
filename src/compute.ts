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

// @TODO better shadowdom test, 11 = document fragment
function isElement(el: any) {
  return (
    el != null &&
    typeof el === 'object' &&
    (el.nodeType === 1 || el.nodeType === 11)
  )
}

function canOverflow(
  overflow: string | null,
  skipOverflowHiddenElements?: boolean
) {
  if (skipOverflowHiddenElements && overflow === 'hidden') {
    return false
  }

  return overflow !== 'visible' && overflow !== 'clip'
}

function isScrollable(el: Element, skipOverflowHiddenElements?: boolean) {
  if (el.clientHeight < el.scrollHeight || el.clientWidth < el.scrollWidth) {
    const style = getComputedStyle(el, null)
    return (
      canOverflow(style.overflowY, skipOverflowHiddenElements) ||
      canOverflow(style.overflowX, skipOverflowHiddenElements)
    )
  }

  return false
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

export default (target: Element, options: Options): CustomScrollAction[] => {
  const {
    scrollMode,
    block,
    inline,
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
  // Used to handle the top most element that can be scrolled
  const scrollingElement = document.scrollingElement || document.documentElement

  // Collect all the scrolling boxes, as defined in the spec: https://drafts.csswg.org/cssom-view/#scrolling-box
  const frames: Element[] = []
  let cursor = target
  while (isElement(cursor) && checkBoundary(cursor)) {
    // Move cursor to parent or shadow dom host
    cursor = cursor.parentNode || cursor.host

    // Stop when we reach the viewport
    if (cursor === scrollingElement) {
      frames.push(cursor)
      break
    }

    // Now we check if the element is scrollable, this code only runs if the loop haven't already hit the viewport or a custom boundary
    if (isScrollable(cursor, skipOverflowHiddenElements)) {
      frames.push(cursor)
    }
  }

  // Support pinch-zooming properly, making sure elements scroll into the visual viewport
  // Browsers that don't support visualViewport will report the layout viewport dimensions on document.documentElement.clientWidth/Height
  // and viewport dimensions on window.innerWidth/Height
  // https://www.quirksmode.org/mobile/viewports2.html
  // https://bokand.github.io/viewport/index.html
  const viewportWidth = window.visualViewport
    ? window.visualViewport.width
    : window.innerWidth
  const viewportHeight = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight

  // Newer browsers supports scroll[X|Y], page[X|Y]Offset is
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

      if (frame === scrollingElement) {
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
  let targetBlock: number =
    block === 'start' || block === 'nearest'
      ? targetRect.top
      : block === 'end'
        ? targetRect.bottom
        : targetRect.top + targetRect.height / 2 // block === 'center
  let targetInline: number =
    inline === 'center'
      ? targetRect.left + targetRect.width / 2
      : inline === 'end'
        ? targetRect.right
        : targetRect.left // inline === 'start || inline === 'nearest

  // Collect new scroll positions
  const computations = frames.map(
    (frame): CustomScrollAction => {
      const frameRect = frame.getBoundingClientRect()

      const frameStyle = getComputedStyle(frame)
      const borderLeft = parseInt(frameStyle.borderLeftWidth as string, 10)
      const borderTop = parseInt(frameStyle.borderTopWidth as string, 10)
      const borderRight = parseInt(frameStyle.borderRightWidth as string, 10)
      const borderBottom = parseInt(frameStyle.borderBottomWidth as string, 10)

      let blockScroll: number = 0
      let inlineScroll: number = 0

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

      if (scrollingElement === frame) {
        // Handle viewport logic (document.documentElement or document.body)

        if (block === 'start') {
          blockScroll = viewportY + targetBlock
        } else if (block === 'end') {
          blockScroll = viewportY + (targetBlock - viewportHeight)
        } else if (block === 'nearest') {
          blockScroll =
            viewportY +
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
        } else {
          // block === 'center' is the default
          blockScroll = viewportY + targetBlock - viewportHeight / 2
        }

        if (inline === 'start') {
          inlineScroll = viewportX + targetInline
        } else if (inline === 'center') {
          inlineScroll = viewportX + targetInline - viewportWidth / 2
        } else if (inline === 'end') {
          inlineScroll = viewportX + (targetInline - viewportWidth)
        } else {
          // inline === 'nearest' is the default
          inlineScroll =
            viewportX +
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
        }
      } else {
        // Handle each scrolling frame that might exist between the target and the viewport

        switch (block) {
          case 'start':
            blockScroll =
              frame.scrollTop + (targetBlock - frameRect.top - borderTop)
            break
          case 'end':
            blockScroll =
              frame.scrollTop -
              (frameRect.bottom - targetBlock) +
              borderBottom +
              scrollbarHeight
            break
          case 'nearest':
            blockScroll =
              frame.scrollTop +
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
            break
          default:
            // block === 'center' is the default
            blockScroll =
              frame.scrollTop -
              (frameRect.top + frameRect.height / 2 - targetBlock) +
              scrollbarHeight / 2
            break
        }

        if (inline === 'start') {
          inlineScroll =
            frame.scrollLeft + (targetInline - frameRect.left - borderLeft)
        } else if (inline === 'center') {
          inlineScroll =
            frame.scrollLeft -
            (frameRect.left + frameRect.width / 2 - targetInline) +
            scrollbarWidth / 2
        } else if (inline === 'end') {
          inlineScroll =
            frame.scrollLeft -
            (frameRect.right - targetInline) +
            borderRight +
            scrollbarWidth
        } else {
          // inline === 'nearest' is the default
          inlineScroll =
            frame.scrollLeft +
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

        // Ensure scroll coordinates are not out of bounds
        blockScroll = Math.max(
          0,
          Math.min(
            blockScroll,
            frame.scrollHeight - frameRect.height + scrollbarHeight
          )
        )
        inlineScroll = Math.max(
          0,
          Math.min(
            inlineScroll,
            frame.scrollWidth - frameRect.width + scrollbarWidth
          )
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
