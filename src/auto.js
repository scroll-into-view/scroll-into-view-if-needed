import { compute } from './compute'
export const auto = (target, options = {}) => {
  const { behavior = 'auto' } = options
  //return target.scrollIntoView(options)
  const instructions = compute(target, options)
  if (instructions) {
    instructions.forEach(([el, top, left]) => {
      // browser implements the new Element.prototype.scroll API that supports `behavior`
      if (el.scroll) {
        el.scroll({ top, left, behavior })
      } else {
        console.log('good old api')
        el.scrollTop = top
        el.scrollLeft = left
      }
    })
  }
}
