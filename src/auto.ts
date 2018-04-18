//import {compute, Options} from './compute'

export interface Options extends ScrollIntoViewOptions {}

export const auto = (target, options?: ScrollIntoViewOptions) => {
  console.log('auto is doing its thang', target, options)
}
