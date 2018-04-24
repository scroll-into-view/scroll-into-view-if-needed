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

// Find out which edge to align against when logical scroll position is "nearest"
const alignNearestBlock = (
  targetStart: number,
  targetSize: number,
  frame: Element,
  frameRect: ClientRect | DOMRect
) => {
  // targetSize is either targetRect.height or targetRect.width depending on if it's `block` or `inline`
  const targetEnd = targetStart + targetSize

  // Is not hidden by the starting edge (if block then this is typically frameRect.top)
  if (targetStart >= frameRect.top && targetEnd <= frameRect.bottom) {
    return 0
  }

  if (
    (targetStart < frameRect.top && targetSize < frame.clientHeight) ||
    (targetEnd > frameRect.bottom && targetSize > frame.clientHeight)
  ) {
    return targetStart - frameRect.top
  }

  if (
    (targetEnd > frameRect.bottom && targetSize < frame.clientHeight) ||
    (targetStart < frameRect.top && targetSize > frame.clientHeight)
  ) {
    return targetStart - frameRect.top
  }

  // start
  // Math.min(targetStart - frameRect.top, frame.scrollHeight - frame.clientHeight - frame.scrollTop)

  // center
  // Math.min(frameRect.top + frameRect.height / 2 - targetEnd / 2, frame.scrollTop)

  // end
  // Math.min(frameRect.bottom - targetEnd, frame.scrollTop)

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

  // Is not hidden by the starting edge (if block then this is typically frameRect.top)
  if (targetStart >= frameRect.left && targetEnd <= frameRect.right) {
    return 0
  }

  if (
    (targetStart < frameRect.left && targetSize < frame.clientWidth) ||
    (targetEnd > frameRect.right && targetSize > frame.clientWidth)
  ) {
    return targetStart - frameRect.left
  }

  if (
    (targetEnd > frameRect.right && targetSize < frame.clientWidth) ||
    (targetStart < frameRect.left && targetSize > frame.clientWidth)
  ) {
    return targetStart - frameRect.left
  }

  // start
  // Math.min(targetStart - frameRect.left, frame.scrollHeight - frame.clientWidth - frame.scrollTop)

  // center
  // Math.min(frameRect.left + frameRect.height / 2 - targetEnd / 2, frame.scrollTop)

  // end
  // Math.min(frameRect.right - targetEnd, frame.scrollTop)

  return 0
}

export const compute = (
  target: Element,
  options: Options = {}
): { el: Element; top: number; left: number }[] => {
  const { /*scrollMode,*/ block, inline, boundary } = {
    //scrollMode: 'always',
    block: 'center',
    inline: 'nearest',
    ...options,
  }

  if (!isElement(target)) {
    throw new Error('Element is required in scrollIntoViewIfNeeded')
  }

  let targetRect = target.getBoundingClientRect()

  // Collect parents
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

      if (document.documentElement === frame) {
        // @TODO silently ignore for now
        // blockScroll = frame.scrollTop + targetBlock - frame.clientHeight / 2
      } else {
        // prevent negative scrollTop values
        console.group('alignNearestBlock')
        const offset = alignNearestBlock(
          targetBlock,
          targetRect.height,
          frame,
          frameRect
        )
        console.groupEnd()
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
        inlineScroll = frame.scrollLeft + targetInline - frame.clientLeft / 2
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
        targetInline = targetRect.bottom
      }
      if (document.documentElement === frame) {
        inlineScroll = frame.scrollLeft + targetInline - frame.clientLeft
      } else {
        // prevent negative scrollLeft values
        const offset =
          0 - Math.min(frameRect.bottom - targetInline, frame.scrollLeft)

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
        // @TODO silently ignore for now
        // inlineScroll = frame.scrollTop + targetInline - frame.clientHeight / 2
      } else {
        // prevent negative scrollTop values
        console.group('alignNearestInline')
        const offset = alignNearestInline(
          targetInline,
          targetRect.width,
          frame,
          frameRect
        )

        console.groupEnd()
        inlineScroll = frame.scrollLeft + offset

        // Cache the offset so that parent frames can scroll this into view correctly
        targetInline -= offset
      }
    }

    // @TODO fix hardcoding of inline => left/X
    //const inlineScroll = frame.scrollLeft + targetRect.left - frameRect.left
    return { el: frame, top: blockScroll, left: inlineScroll }
  })

  return computations
}
