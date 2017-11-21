import { animate } from './legacy' /*esm pure*/
import { calculate, CalculateOptions } from './calculate' /*esm pure*/

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

const handleScroll = (parent, { scrollLeft, scrollTop }, config) => {
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
}

export interface Options extends CalculateOptions {
  // Setting a duration will enable animations
  duration?: number
  // Easing only take effect if a duration is set
  easing?: 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'linear'
}

const isBoolean = (options: boolean | Options): options is boolean => {
  return typeof options === 'boolean'
}

const scrollIntoViewIfNeeded = (
  target: Element,
  options: boolean | Options,
  animateOptions?: AnimateOptions,
  finalElement?: Element,
  offsetOptions: OffsetConfig = {}
) => {
  if (!target || !(target instanceof HTMLElement))
    throw new Error('Element is required in scrollIntoViewIfNeeded')

  let config: Options = { centerIfNeeded: false, handleScroll }

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

  return calculate(target, config)
}

export default scrollIntoViewIfNeeded
