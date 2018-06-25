// memoize for perf
let viewport: HTMLElement

// return the current viewport depending on wether quirks mode is active or not
export default () => {
  const doc = document

  if (!viewport) {
    viewport =
      (doc.compatMode !== 'CSS1Compat' &&
        (doc.scrollingElement as HTMLElement)) ||
      doc.documentElement
  }

  return viewport
}
