// @TODO implement smooth behavior in here

import scrollIntoView from '.'

const smoothScrollIntoView = (...args) =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve())
  })

export default smoothScrollIntoView
