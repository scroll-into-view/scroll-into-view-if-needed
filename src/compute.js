// Compute what scrolling needs to be done on required scrolling boxes for target to be in view
const isElement = el => el != null && typeof el == 'object' && el.nodeType === 1
/**
 * indicates if an element has scrollable space in the provided axis
 */
function hasScrollableSpace(el, axis) {
  if (axis === 'Y') {
    return el.clientHeight < el.scrollHeight
  }
  if (axis === 'X') {
    return el.clientWidth < el.scrollWidth
  }
  return false
}
/**
 * indicates if an element can be scrolled in either axis
 * @method isScrollable
 * @param {Node} el
 * @param {String} axis
 * @returns {Boolean}
 */
function isScrollable(el) {
  var isScrollableY = hasScrollableSpace(el, 'Y')
  var isScrollableX = hasScrollableSpace(el, 'X')
  return isScrollableY || isScrollableX
}
export const compute = (maybeElement, options = {}) => {
  const {
    scrollMode = 'always',
    block = 'center',
    inline = 'nearest',
    boundary,
  } = options
  if (!isElement(maybeElement)) {
    throw new Error('Element is required in scrollIntoViewIfNeeded')
  }
  let target = maybeElement
  let targetRect = target.getBoundingClientRect()
  // Collect parents
  const frames = []
  let parent
  while (isElement((parent = target.parentNode)) && target !== boundary) {
    if (isScrollable(parent)) {
      frames.push(parent)
    }
    // next tick
    target = parent
  }
  // These values mutate as we loop through and generate scroll coordinates
  let offsetTop = 0
  let targetBlock
  let targetInline
  // Collect new scroll positions
  return frames.map(frame => {
    const frameRect = frame.getBoundingClientRect()
    // @TODO fix hardcoding of block => top/Y
    /*
        console.warn(
          'test',
          frame,
          frame.scrollTop,
          targetRect.top,
          frameRect.top,
          frame.scrollTop + targetRect.top - frameRect.top
        );
        //*/
    let blockScroll
    let inlineScroll
    // @TODO temp, need to follow steps outlined in spec
    if (true) {
      blockScroll = frame.scrollTop + targetRect.top - frameRect.top
    }
    // @TODO fix the if else pyramid nightmare
    // block: 'start' is complete
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
        console.log('targetBlock', targetBlock)
      }
    }
    // block: 'center' is complete
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
    // block: 'end' is complete
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
    // inline: 'start' is complete
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
        console.log('targetInline', targetInline)
      }
    }
    // inline: 'center' is complete
    if (inline === 'center' || inline === 'nearest') {
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
    // inline: 'end' is complete
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
    // @TODO fix hardcoding of inline => left/X
    //const inlineScroll = frame.scrollLeft + targetRect.left - frameRect.left
    return [frame, blockScroll, inlineScroll]
  })
}
