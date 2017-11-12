import animate from 'amator'

// Legacy
export interface AnimateOptions {
  duration?: number
  easing?: 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'linear'
}

// Legacy
export interface OffsetConfig {
  offsetTop?: number
  offsetLeft?: number
  offsetBottom?: number
  offsetRight?: number
}

export interface Offset {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export interface Options {
  boundary?: Element
  centerIfNeeded?: boolean
  // Setting a duration will enable animations
  duration?: number
  // Easing only take effect if a duration is set
  easing?: 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'linear'
  offset?: Offset
}

function isBoolean(options: boolean | Options): options is boolean {
  return typeof options === 'boolean'
}

export default function scrollIntoViewIfNeeded(
  target: Element,
  options: boolean | Options,
  animateOptions?: AnimateOptions,
  finalElement?: Element,
  offsetOptions: OffsetConfig = {}
) {
  if (!target || !(target instanceof HTMLElement))
    throw new Error('Element is required in scrollIntoViewIfNeeded')

  let config: Options = { centerIfNeeded: false }

  if (isBoolean(options)) {
    config.centerIfNeeded = options
  } else {
    config = { ...config, ...options }
  }

  const defaultOffset = { top: 0, right: 0, bottom: 0, left: 0 }
  config.offset = config.offset
    ? { ...defaultOffset, ...config.offset }
    : defaultOffset

  if (animateOptions) {
    config.duration = animateOptions.duration
    config.easing = animateOptions.easing
  }

  if (finalElement) {
    config.boundary = finalElement
  }

  if (offsetOptions.offsetTop) {
    config.offset.top = offsetOptions.offsetTop
  }
  if (offsetOptions.offsetRight) {
    config.offset.right = offsetOptions.offsetRight
  }
  if (offsetOptions.offsetBottom) {
    config.offset.bottom = offsetOptions.offsetBottom
  }
  if (offsetOptions.offsetLeft) {
    config.offset.left = offsetOptions.offsetLeft
  }

  function withinBounds(value, min, max, extent) {
    if (
      config.centerIfNeeded === false ||
      (max <= value + extent && value <= min + extent)
    ) {
      return Math.min(max, Math.max(min, value))
    } else {
      return (min + max) / 2
    }
  }

  const { offset } = config
  const offsetTop = offset.top
  const offsetLeft = offset.left
  const offsetBottom = offset.bottom
  const offsetRight = offset.right

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
      target.offsetLeft,
      target.offsetTop,
      target.offsetWidth,
      target.offsetHeight
    )
  while (
    (parent = target.parentNode) instanceof HTMLElement &&
    target !== config.boundary
  ) {
    const clientLeft = parent.offsetLeft + parent.clientLeft
    const clientTop = parent.offsetTop + parent.clientTop

    // Make area relative to parent's client area.
    area = area
      .relativeFromTo(target, parent)
      .translate(-clientLeft, -clientTop)

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
    if (config.duration) {
      animate(
        parent,
        {
          scrollLeft: scrollLeft,
          scrollTop: scrollTop,
        },
        { duration: config.duration, easing: config.easing }
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
    target = parent
  }
}
