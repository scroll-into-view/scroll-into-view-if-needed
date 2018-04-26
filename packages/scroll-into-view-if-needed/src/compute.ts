// Compute what scrolling needs to be done on required scrolling boxes for target to be in view

// The type names here are named after the spec to make it easier to find more information around what they mean:
// To reduce churn and reduce things that need be maintained things from the official TS DOM library is used here
// https://drafts.csswg.org/cssom-view/

// For a definition on what is "block flow direction" exactly, check this: https://drafts.csswg.org/css-writing-modes-4/#block-flow-direction

export interface Options extends ScrollIntoViewOptions {
  // This new option is tracked in this PR, which is the most likely candidate at the time: https://github.com/w3c/csswg-drafts/pull/1805
  scrollMode?: 'always' | 'if-needed'
  // This option is not in any spec and specific to this library
  boundary?: Element
}

const isElement = el => el != null && typeof el == 'object' && el.nodeType === 1
function hasScrollableSpace(el, axis: 'Y' | 'X') {
  if (axis === 'Y') {
    return el.clientHeight < el.scrollHeight
  }

  if (axis === 'X') {
    return el.clientWidth < el.scrollWidth
  }

  return false
}

function isScrollable(el) {
  var isScrollableY = hasScrollableSpace(el, 'Y')
  var isScrollableX = hasScrollableSpace(el, 'X')

  return isScrollableY || isScrollableX
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
const alignNearestBlock = (
  targetStart: number,
  targetSize: number,
  frame: Element
) => {
  // targetSize is either targetRect.height or targetRect.width depending on if it's `block` or `inline`
  const targetEnd = targetStart + targetSize

  const elementEdgeA = frame.scrollTop + targetStart
  const elementEdgeB = frame.scrollTop + targetEnd
  const scrollingEdgeA = frame.scrollTop
  const scrollingEdgeB = frame.scrollTop + frame.clientHeight

  //console.log('new coordinates', {elementEdgeA, elementEdgeB, scrollingEdgeA, scrollingEdgeB, targetStart, targetSize, 'frame.scrollTop': frame.scrollTop, 'frame.clientHeight': frame.clientHeight, 'frameRect.top': frameRect.top})

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
   */
  if (
    (elementEdgeA < scrollingEdgeA && elementEdgeB > scrollingEdgeB) ||
    (elementEdgeA > scrollingEdgeA && elementEdgeB < scrollingEdgeB)
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
   */
  if (elementEdgeA < scrollingEdgeA && targetSize < frame.clientHeight) {
    return targetStart
  }

  /**
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
   */
  if (elementEdgeB > scrollingEdgeB && targetSize > frame.clientHeight) {
    return targetStart
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
   */
  ///*
  if (elementEdgeB > scrollingEdgeB && targetSize < frame.clientHeight) {
    return elementEdgeB - scrollingEdgeB
  }
  //*/

  /**
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
   */
  if (elementEdgeA < scrollingEdgeA && targetSize > frame.clientHeight) {
    return elementEdgeB - scrollingEdgeB
  }

  return 0
}
// Find out the
const alignNearestInline = (
  targetStart: number,
  targetSize: number,
  frame: Element,
  frameRect: ClientRect | DOMRect
) => {
  // targetSize is either targetRect.height or targetRect.width depending on if it's `block` or `inline`
  const targetEnd = targetStart + targetSize

  /**
   *  If element edge C and element edge D are both outside scrolling box edge C and scrolling box edge D
   *
   *    ┏ ━ ━ ━ ━ ┓
   *   ┌───────────┐
   *   │┃         ┃│        Do nothing
   *   └───────────┘
   *    ┗ ━ ━ ━ ━ ┛
   */
  // @TODO

  /**
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
    frameRect.left < 0 &&
    targetEnd > frameRect.left &&
    targetSize < frame.clientWidth
  ) {
    return targetStart
  }

  /**
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
   */
  if (
    frameRect.right > 0 &&
    targetEnd > frameRect.right &&
    targetSize < frame.clientWidth
  ) {
    return targetEnd - frameRect.left - frame.clientWidth
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

  if (!isElement(target)) {
    throw new Error('Element is required in scrollIntoViewIfNeeded')
  }

  let targetRect = target.getBoundingClientRect()

  // If the element is already visible we can end it here
  if (
    scrollMode === 'if-needed' &&
    targetRect.top >= 0 &&
    targetRect.bottom <= window.innerHeight
  ) {
    return []
  }

  // Collect all the scrolling boxes, as defined in the spec: https://drafts.csswg.org/cssom-view/#scrolling-box
  const frames: Element[] = []
  let parent
  while (isElement((parent = target.parentNode)) && target !== boundary) {
    if (isScrollable(parent)) {
      frames.push(parent)
    }

    // next tick
    target = parent
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
      if (document.documentElement === frame) {
        blockScroll = frame.scrollTop + targetBlock
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
      if (document.documentElement === frame) {
        blockScroll = frame.scrollTop + targetBlock - frame.clientHeight / 2
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
      if (document.documentElement === frame) {
        blockScroll = frame.scrollTop + targetBlock - frame.clientHeight
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

      const offset = alignNearestBlock(targetBlock, targetRect.height, frame)
      blockScroll = frame.scrollTop + offset

      if (document.documentElement !== frame) {
        // Cache the offset so that parent frames can scroll this into view correctly
        targetBlock -= offset
      }
    }

    if (inline === 'start') {
      if (!targetInline) {
        targetInline = targetRect.left
      }
      if (document.documentElement === frame) {
        inlineScroll = frame.scrollLeft + targetInline
      } else {
        // prevent scrollLeft values that overflow the scrollLeft
        const offset = Math.min(
          targetInline - frameRect.left,
          frame.scrollLeft - frame.clientLeft - frame.scrollLeft
        )
        inlineScroll = frame.scrollLeft + offset

        targetInline -= inlineScroll - frame.scrollLeft
      }
    }

    if (inline === 'center') {
      if (!targetInline) {
        targetInline = targetRect.left + targetRect.width / 2
      }
      if (document.documentElement === frame) {
        inlineScroll = frame.scrollLeft + targetInline - frame.clientWidth / 2
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
      if (document.documentElement === frame) {
        inlineScroll = frame.scrollLeft + targetInline - frame.clientWidth
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
      const offset = alignNearestInline(
        targetInline,
        targetRect.width,
        frame,
        frameRect
      )

      inlineScroll = frame.scrollLeft + offset

      if (document.documentElement !== frame) {
        // Cache the offset so that parent frames can scroll this into view correctly
        targetInline -= offset
      }
    }

    return { el: frame, top: blockScroll, left: inlineScroll }
  })

  return computations
}
