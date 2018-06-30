// return the current viewport depending on wether quirks mode is active or not
export default function viewport() {
  // @TODO add note to README: if using IE and the document is in quirks mode a polyfill for scrollingElement is required
  return document.scrollingElement || document.documentElement
}
