// @TODO implement smooth behavior in here

import scrollIntoView from '.'

export const ponyfill = (...args) =>
  new Promise(resolve => {
    setTimeout(() => resolve())
    console.log('smoothScrollIntoView', ...args, scrollIntoView)
  })
