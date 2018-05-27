// memoize for perf
let viewport

// return the current viewport depending on wether quirks mode is active or not
export default () => {
  if (!viewport) {
    viewport =
      document.compatMode === 'CSS1Compat'
        ? document.documentElement
        : document.scrollingElement || document.documentElement
  }

  return viewport as HTMLElement
}
