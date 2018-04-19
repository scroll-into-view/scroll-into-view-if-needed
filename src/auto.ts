import { compute, Options as ComputeOptions } from './compute';

export interface Options extends ComputeOptions {
  // @TODO specify custom behavior option here
}

export const auto = (target, options: ScrollIntoViewOptions = {}) => {
  const { behavior = 'auto' } = options;
  //return target.scrollIntoView(options)
  const instructions = compute(target, options);

  if (instructions) {
    instructions.forEach(([el, top, left]) => {
      // browser implements the new Element.prototype.scroll API that supports `behavior`
      if (el.scroll) {
        el.scroll({ top, left, behavior });
      } else {
        console.log('good old api');
        el.scrollTop = top;
        el.scrollLeft = left;
      }
    });
  }
};
