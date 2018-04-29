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

export interface Options extends ScrollIntoViewOptions {
  // This new option is tracked in this PR, which is the most likely candidate at the time: https://github.com/w3c/csswg-drafts/pull/1805
  scrollMode?: 'always' | 'if-needed'
  // This option is not in any spec and specific to this library
  boundary?: Element
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
interface alignBlockOptions {
  scrollingEdgeA: number
  scrollingEdgeB: number
  elementEdgeA: number
  elementEdgeB: number
}
const alignNearestBlock = (
  targetStart: number,
  targetSize: number,
  frame: Element,
  frameRect: ClientRect | DOMRect,
  alignOptions: alignBlockOptions
) => {
  const {
    scrollingEdgeA,
    scrollingEdgeB,
    elementEdgeA,
    elementEdgeB,
  } = alignOptions

  const targetEnd = targetStart + targetSize

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

  //if (
  //  (elementEdgeA < scrollingEdgeA && elementEdgeB > scrollingEdgeB) ||
  //  (elementEdgeA > scrollingEdgeA && elementEdgeB < scrollingEdgeB)
  //) {
  //  console.log('do nothing', frame)
  //  return 0
  //}

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
  if (
    frameRect.top > 0 &&
    targetEnd > frameRect.bottom &&
    targetSize < frame.clientHeight
  ) {
    return elementEdgeB - scrollingEdgeB
  }

  return 0
}
// Find out the
interface alignInlineOptions {
  scrollingEdgeC: number
  scrollingEdgeD: number
  elementEdgeC: number
  elementEdgeD: number
}
const alignNearestInline = (
  targetStart: number,
  targetSize: number,
  frame: Element,
  frameRect: ClientRect | DOMRect,
  alignOptions: alignInlineOptions
) => {
  const { scrollingEdgeC, scrollingEdgeD } = alignOptions

  const targetEnd = targetStart + targetSize

  const elementEdgeC = frame.scrollLeft + targetStart
  const elementEdgeD = frame.scrollLeft + targetEnd

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
    (elementEdgeC < scrollingEdgeC && targetSize < frame.clientWidth) ||
    (frameRect.left < 0 &&
      targetEnd > frameRect.left &&
      targetSize < frame.clientWidth)
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
    (elementEdgeD < scrollingEdgeD && targetSize < frame.clientWidth) ||
    (frameRect.right > 0 &&
      targetEnd > frameRect.right &&
      targetSize < frame.clientWidth)
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
    throw new Error('Element is required in scrollIntoView')
  }

  let targetRect = target.getBoundingClientRect()

  // Collect all the scrolling boxes, as defined in the spec: https://drafts.csswg.org/cssom-view/#scrolling-box
  const frames: Element[] = []
  let parent
  while (isElement((parent = target.parentNode)) && target !== boundary) {
    if (isScrollable(parent) || parent === document.documentElement) {
      frames.push(parent)
    }

    // next tick
    target = parent
  }

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

      if (
        frame === document.documentElement &&
        targetRect.bottom > frame.clientHeight
      ) {
        return false
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
  let viewportHeight = window.visualViewport
    ? window.visualViewport.height
    : document.documentElement.clientHeight

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
    console.log(frame.scrollTop, frame.scrollLeft)

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
        blockScroll =
          (window.scrollY || window.pageYOffset) +
          targetBlock -
          frame.clientHeight / 2
        console.log(
          'blockScroll top',
          window.scrollY,
          frame.scrollTop,
          targetBlock
        )
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

      if (document.documentElement === frame) {
        const offset = alignNearestBlock(
          targetBlock,
          targetRect.height,
          frame,
          frameRect,
          {
            scrollingEdgeA: frame.scrollTop,
            scrollingEdgeB: frame.scrollTop + viewportHeight,
            elementEdgeA: frame.scrollTop + targetBlock,
            elementEdgeB: frame.scrollTop + targetBlock + targetRect.height,
          }
        )

        blockScroll = (window.scrollY || window.pageYOffset) + offset
      } else {
        const offset = alignNearestBlock(
          targetBlock,
          targetRect.height,
          frame,
          frameRect,
          {
            scrollingEdgeA: frameRect.top,
            scrollingEdgeB: frameRect.height,
            elementEdgeA: targetBlock,
            elementEdgeB: targetBlock + targetRect.height,
          }
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
      if (document.documentElement === frame) {
        inlineScroll = frame.scrollLeft + targetInline
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

      if (document.documentElement === frame) {
        const offset = alignNearestInline(
          targetInline,
          targetRect.width,
          frame,
          frameRect,
          {
            scrollingEdgeC: frame.scrollLeft,
            scrollingEdgeD: frame.scrollLeft + frame.clientWidth,
            elementEdgeC: frame.scrollLeft + targetInline,
            elementEdgeD: frame.scrollLeft + targetInline + targetRect.width,
          }
        )

        inlineScroll = frame.scrollLeft + offset
      } else {
        const offset = alignNearestInline(
          targetInline,
          targetRect.width,
          frame,
          frameRect,
          {
            scrollingEdgeC: frameRect.left,
            scrollingEdgeD: frameRect.width,
            elementEdgeC: targetInline,
            elementEdgeD: targetInline + targetRect.width,
          }
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
