import { auto, Options } from './auto'

// The "essentials-only" mode that is only as large as it needs to be, and supports native smooth scrolling which is potentially more performant
export default auto
// Some people might use both "auto" and "ponyfill" modes in the same file, so we also provide a named export so
// that imports in userland code (like if they use native smooth scrolling on some browsers, and the ponyfill for everything else)
// the named export allows this `import {auto as autoScrollIntoView, ponyfill as smoothScrollIntoView} from ...`
export { auto, Options }

// The ponyfill variant that provide the same smooth scrolling experience for every browser
export { ponyfill } from './ponyfill'

// This is for people who only need the code that computes scrolling instructions, but roll their own
// code for doing the actual scrolling and want the smallest possible bundle size.
export { compute } from './compute'
