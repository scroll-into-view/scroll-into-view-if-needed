// Compute what scrolling needs to be done on required scrolling boxes for target to be in view

// The type names here are named after the spec to make it easier to find more information around what they mean:
// To reduce churn and reduce things that need be maintained things from the official TS DOM library is used here
// https://drafts.csswg.org/cssom-view/

// For a definition on what is "block flow direction" exactly, check this: https://drafts.csswg.org/css-writing-modes-4/#block-flow-direction

export interface Options extends ScrollIntoViewOptions {
  // This new option is tracked in this PR, which is the most likely candidate at the time: https://github.com/w3c/csswg-drafts/pull/1805
  scrollMode?: 'always' | 'if-needed';
  // This option is not in any spec and specific to this library
  boundary?: Element;
}

const isElement = el =>
  el != null && typeof el == 'object' && el.nodeType === 1;

/**
 * indicates if an element has scrollable space in the provided axis
 */
function hasScrollableSpace(el, axis: 'Y' | 'X') {
  if (axis === 'Y') {
    return el.clientHeight < el.scrollHeight;
  }

  if (axis === 'X') {
    return el.clientWidth < el.scrollWidth;
  }

  return false;
}

/**
 * indicates if an element has a scrollable overflow property in the axis
 * @method canOverflow
 * @param {Node} el
 * @param {String} axis
 * @returns {Boolean}
 */
function canOverflow(el, axis) {
  var overflowValue = getComputedStyle(el, null)['overflow' + axis];

  return overflowValue === 'auto' || overflowValue === 'scroll';
}

/**
 * indicates if an element can be scrolled in either axis
 * @method isScrollable
 * @param {Node} el
 * @param {String} axis
 * @returns {Boolean}
 */
function isScrollable(el) {
  var isScrollableY = hasScrollableSpace(el, 'Y') && canOverflow(el, 'Y');
  var isScrollableX = hasScrollableSpace(el, 'X') && canOverflow(el, 'X');

  return isScrollableY || isScrollableX;
}

export const compute = (maybeElement: Element, options: Options = {}) => {
  const { scrollMode = 'always', block = 'center', boundary } = options;

  if (!isElement(maybeElement)) {
    throw new Error('Element is required in scrollIntoViewIfNeeded');
  }

  let target = maybeElement;
  let targetRect = target.getBoundingClientRect();

  // Collect parents
  const frames: HTMLElement[] = [];
  let parent;
  while (isElement((parent = target.parentNode)) && target !== boundary) {
    if (isScrollable(parent)) {
      frames.push(parent);
    }

    // next tick
    target = parent;
  }

  // These values mutate as we loop through and generate scroll coordinates
  let offsetTop = 0;
  let targetBlock;
  let targetInline;

  // Collect new scroll positions
  return frames.map(frame => {
    const frameRect = frame.getBoundingClientRect();
    // @TODO fix hardcoding of block => top/Y
    console.warn(
      'test',
      frame,
      frame.scrollTop,
      targetRect.top,
      frameRect.top,
      frame.scrollTop + targetRect.top - frameRect.top
    );
    let blockScroll;
    // @TODO temp, need to follow steps outlined in spec
    if (true) {
      blockScroll = frame.scrollTop + targetRect.top - frameRect.top;
    }
    // @TODO fix the if else pyramid nightmare
    if (block === 'start') {
      if (!targetBlock) {
        targetBlock = targetRect.top;
      }
      if (document.documentElement === frame) {
        blockScroll = frame.scrollTop + targetBlock;
      } else {
        blockScroll = frame.scrollTop + targetBlock - frameRect.top;
        targetBlock -= blockScroll - frame.scrollTop;
      }
    }
    if (block === 'end') {
      if (!targetBlock) {
        targetBlock = targetRect.bottom;
      }
      if (document.documentElement === frame) {
        console.log('frameRect.height', frameRect.height);
        blockScroll = frame.scrollTop + targetBlock - frame.clientHeight;
      } else {
        // prevent negative scrollTop values
        const offset =
          0 - Math.min(frameRect.bottom - targetBlock, frame.scrollTop);

        blockScroll = frame.scrollTop + offset;

        // Cache the offset so that parent frames can scroll this into view correctly
        targetBlock += frame.scrollTop - blockScroll;
      }
    }

    // @TODO fix hardcoding of inline => left/X
    const inlineScroll = frame.scrollLeft + targetRect.left - frameRect.left;
    return [frame, blockScroll, inlineScroll];
  });
};
