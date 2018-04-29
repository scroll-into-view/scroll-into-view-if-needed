// Compute what scrolling needs to be done on required scrolling boxes for target to be in view

// The type names here are named after the spec to make it easier to find more information around what they mean:
// To reduce churn and reduce things that need be maintained things from the official TS DOM library is used here
// https://drafts.csswg.org/cssom-view/

// For a definition on what is "block flow direction" exactly, check this: https://drafts.csswg.org/css-writing-modes-4/#block-flow-direction

// add support for visualViewport object currently implemented in chrome
declare global {
  interface Window {
    visualViewport: {
      height: number
      width: number
    }
  }
}

export interface checkBoundary {
  (parent: Element): boolean
}
export interface Options extends ScrollIntoViewOptions {
  // This new option is tracked in this PR, which is the most likely candidate at the time: https://github.com/w3c/csswg-drafts/pull/1805
  scrollMode?: 'always' | 'if-needed'
  // This option is not in any spec and specific to this library
  boundary?: Element | checkBoundary
}

const isElement = el => el != null && typeof el == 'object' && el.nodeType === 1
const hasScrollableSpace = (el, axis: 'Y' | 'X') => {
  if (axis === 'Y') {
    return el.clientHeight < el.scrollHeight
  }

  if (axis === 'X') {
    return el.clientWidth < el.scrollWidth
  }

  return false
}
const canOverflow = (el, axis: 'Y' | 'X') => {
  const overflowValue = window.getComputedStyle(el, null)['overflow' + axis]

  return overflowValue !== 'visible' && overflowValue !== 'clip'
}

const isScrollable = el =>
  (hasScrollableSpace(el, 'Y') && canOverflow(el, 'Y')) ||
  (hasScrollableSpace(el, 'X') && canOverflow(el, 'X'))

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
    return elementEdgeStart - scrollingEdgeStart
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
    return elementEdgeEnd - scrollingEdgeEnd
  }

  return 0
}

export const compute = (
  target: Element,
  options: Options = {}
): { el: Element; top: number; left: number }[] => {
  const { scrollMode, block, inline, boundary } = {
    scrollMode: 'always',
    block: 'center',
    inline: 'nearest',
    ...options,
  }
  // Allow using a callback to check the boundary
  // The default behavior is to check if the current target matches the boundary element or not
  // If undefined it'll check that target is never undefined (can happen as we recurse up the tree)
  const checkBoundary =
    typeof boundary == 'function' ? boundary : parent => parent !== boundary

  if (!isElement(target)) {
    throw new Error('Element is required in scrollIntoView')
  }

  let targetRect = target.getBoundingClientRect()
  const viewport = document.documentElement

  // Collect all the scrolling boxes, as defined in the spec: https://drafts.csswg.org/cssom-view/#scrolling-box
  const frames: Element[] = []
  let parent
  while (isElement((parent = target.parentNode)) && checkBoundary(target)) {
    if (isScrollable(parent) || parent === viewport) {
      frames.push(parent)
    }

    // next tick
    target = parent
  }

  // Workaround Chrome's behavior on clientHeight/clientWidth after introducing visualViewport
  // https://www.quirksmode.org/blog/archives/2016/02/chrome_change_b.html
  const viewportWidth = window.visualViewport
    ? window.visualViewport.width
    : viewport.clientWidth
  const viewportHeight = window.visualViewport
    ? window.visualViewport.height
    : viewport.clientHeight
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
        if (targetRect.bottom > viewportHeight) {
          return false
        }
        if (targetRect.left > viewportWidth) {
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
  const computations = frames.map((frame): {
    el: Element
    top: number
    left: number
  } => {
    const frameRect = frame.getBoundingClientRect()
    // @TODO fix hardcoding of block => top/Y

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
        blockScroll = frame.scrollTop + offset

        targetBlock -= blockScroll - frame.scrollTop
      }
    }
    if (block === 'center') {
      if (!targetBlock) {
        targetBlock = targetRect.top + targetRect.height / 2
      }
      if (viewport === frame) {
        blockScroll = viewportY + targetBlock - frame.clientHeight / 2
      } else {
        // prevent negative scrollTop values
        const offset =
          0 -
          Math.min(
            frameRect.top + frameRect.height / 2 - targetBlock,
            frame.scrollTop
          )

        blockScroll = frame.scrollTop + offset

        // Cache the offset so that parent frames can scroll this into view correctly
        targetBlock += frame.scrollTop - blockScroll
      }
    }

    if (block === 'end') {
      if (!targetBlock) {
        targetBlock = targetRect.bottom
      }
      if (viewport === frame) {
        blockScroll = viewportY + targetBlock - frame.clientHeight
      } else {
        // prevent negative scrollTop values
        const offset =
          0 - Math.min(frameRect.bottom - targetBlock, frame.scrollTop)

        blockScroll = frame.scrollTop + offset

        // Cache the offset so that parent frames can scroll this into view correctly
        targetBlock += frame.scrollTop - blockScroll
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
          targetBlock,
          targetBlock + targetRect.height,
          targetRect.height
        )
        blockScroll = frame.scrollTop + offset

        // Cache the offset so that parent frames can scroll this into view correctly
        targetBlock -= offset
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
        inlineScroll = frame.scrollLeft + offset

        targetInline -= inlineScroll - frame.scrollLeft
      }
    }

    if (inline === 'center') {
      if (!targetInline) {
        targetInline = targetRect.left + targetRect.width / 2
      }
      if (viewport === frame) {
        inlineScroll = viewportX + targetInline - frame.clientWidth / 2
      } else {
        // prevent negative scrollLeft values
        const offset =
          0 -
          Math.min(
            frameRect.left + frameRect.width / 2 - targetInline,
            frame.scrollLeft
          )

        inlineScroll = frame.scrollLeft + offset

        // Cache the offset so that parent frames can scroll this into view correctly
        targetInline += frame.scrollLeft - inlineScroll
      }
    }

    if (inline === 'end') {
      if (!targetInline) {
        targetInline = targetRect.right
      }
      if (viewport === frame) {
        inlineScroll = viewportX + targetInline - frame.clientWidth
      } else {
        // prevent negative scrollLeft values
        const offset =
          0 - Math.min(frameRect.right - targetInline, frame.scrollLeft)

        inlineScroll = frame.scrollLeft + offset

        // Cache the offset so that parent frames can scroll this into view correctly
        targetInline += frame.scrollLeft - inlineScroll
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
          targetInline,
          targetInline + targetRect.width,
          targetRect.width
        )

        inlineScroll = frame.scrollLeft + offset

        // Cache the offset so that parent frames can scroll this into view correctly
        targetInline -= offset
      }
    }

    return { el: frame, top: blockScroll, left: inlineScroll }
  })

  return computations
}
