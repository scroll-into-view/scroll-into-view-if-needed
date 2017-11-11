import animate from 'amator'

export interface AnimateOptions {
  duration?: number
  easing?: 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'linear'
}

export interface OffsetConfig {
  offsetTop?: number
  offsetLeft?: number
  offsetBottom?: number
  offsetRight?: number
}

export interface Options {
  animateOptions?: AnimateOptions
  boundary?: Element
  centerIfNeeded?: boolean
  offsetConfig?: OffsetConfig
}

export default function scrollIntoViewIfNeeded(
  elem: Element,
  options?: boolean | Options
) {
  if (!elem || !(elem instanceof HTMLElement))
    throw new Error('Element is required in scrollIntoViewIfNeeded')

  const optionsAreBool: boolean = typeof options === 'boolean'

  function withinBounds(value, min, max, extent) {
    if (
      (optionsAreBool && options === false) ||
      options.centerIfNeeded === false ||
      (max <= value + extent && value <= min + extent)
    ) {
      return Math.min(max, Math.max(min, value))
    } else {
      return (min + max) / 2
    }
  }
  let { offsetConfig = {} } = options

  const offsetTop = offsetConfig.offsetTop || 0
  const offsetLeft = offsetConfig.offsetLeft || 0
  const offsetBottom = offsetConfig.offsetBottom || 0
  const offsetRight = offsetConfig.offsetRight || 0

  function makeArea(left, top, width, height) {
    return {
      left: left + offsetLeft,
      top: top + offsetTop,
      width: width,
      height: height,
      right: left + offsetLeft + width + offsetRight,
      bottom: top + offsetTop + height + offsetBottom,
      translate: function(x, y) {
        return makeArea(
          x + left + offsetLeft,
          y + top + offsetTop,
          width,
          height
        )
      },
      relativeFromTo: function(lhs, rhs) {
        let newLeft = left + offsetLeft,
          newTop = top + offsetTop
        lhs = lhs.offsetParent
        rhs = rhs.offsetParent
        if (lhs === rhs) {
          return area
        }
        for (; lhs; lhs = lhs.offsetParent) {
          newLeft += lhs.offsetLeft + lhs.clientLeft
          newTop += lhs.offsetTop + lhs.clientTop
        }
        for (; rhs; rhs = rhs.offsetParent) {
          newLeft -= rhs.offsetLeft + rhs.clientLeft
          newTop -= rhs.offsetTop + rhs.clientTop
        }
        return makeArea(newLeft, newTop, width, height)
      },
    }
  }

  let parent,
    area = makeArea(
      elem.offsetLeft,
      elem.offsetTop,
      elem.offsetWidth,
      elem.offsetHeight
    )
  while (
    (parent = elem.parentNode) instanceof HTMLElement &&
    elem !== options.boundary
  ) {
    const clientLeft = parent.offsetLeft + parent.clientLeft
    const clientTop = parent.offsetTop + parent.clientTop

    // Make area relative to parent's client area.
    area = area.relativeFromTo(elem, parent).translate(-clientLeft, -clientTop)

    const scrollLeft = withinBounds(
      parent.scrollLeft,
      area.right - parent.clientWidth,
      area.left,
      parent.clientWidth
    )
    const scrollTop = withinBounds(
      parent.scrollTop,
      area.bottom - parent.clientHeight,
      area.top,
      parent.clientHeight
    )
    if (!optionsAreBool) {
      animate(
        parent,
        {
          scrollLeft: scrollLeft,
          scrollTop: scrollTop,
        },
        options.animateOptions
      )
    } else {
      parent.scrollLeft = scrollLeft
      parent.scrollTop = scrollTop
    }

    // Determine actual scroll amount by reading back scroll properties.
    area = area.translate(
      clientLeft - parent.scrollLeft,
      clientTop - parent.scrollTop
    )
    elem = parent
  }
}
