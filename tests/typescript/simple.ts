import scrollIntoView from '../../src/index'
import { onlyIfNeeded, selection } from '../../src/middleware'
import type { Middleware } from '../../src/middleware'

const node = document.body

// Calling with only the first argument should work fine
scrollIntoView(node)

// Legacy options as defined by the spec for backwards compatibility should also work
scrollIntoView(node, true)
scrollIntoView(node, false)

// Passing an empty object should work (as required by spec)
scrollIntoView(node, {})

// Other misc options
scrollIntoView(node, { behavior: 'auto' })
scrollIntoView(node, { behavior: 'smooth' })

scrollIntoView(node, { block: 'start', inline: 'start' })
scrollIntoView(node, { block: 'center', inline: 'center' })
scrollIntoView(node, { block: 'end', inline: 'end' })
scrollIntoView(node, { block: 'nearest', inline: 'nearest' })

scrollIntoView(node, { container: 'nearest' })

scrollIntoView(node, { scroll: 'always' })
scrollIntoView(node, { scroll: 'if-needed' })

// `scrollMode` still works. It is deprecated in favor of `scroll`
scrollIntoView(node, { scrollMode: 'always' })
scrollIntoView(node, { scrollMode: 'if-needed' })

scrollIntoView(node, {
  middleware: [{ name: 'custom', fn: () => ({}) }],
})

scrollIntoView(node, { behavior: 'instant' })

// An element is fine with or without selection()
scrollIntoView(node, { middleware: [selection()] })
scrollIntoView(node, { middleware: [onlyIfNeeded()] })

// A Range or Selection scrolls its text into view, with selection() in the middleware
const range = document.createRange()
const selected = document.getSelection()!
const custom: Middleware = { name: 'custom', fn: () => ({}) }
scrollIntoView(range, { scroll: 'if-needed', middleware: [selection()] })
scrollIntoView(selected, { block: 'nearest', middleware: [selection()] })
scrollIntoView(range, { middleware: [custom, selection(), onlyIfNeeded()] })
scrollIntoView(range, {
  behavior: 'smooth',
  middleware: [selection(undefined, { align: 'bounds' })],
})

// Test cases that should fail

// Nothing is returned
// @ts-expect-error
node.title = scrollIntoView(node)

// `behavior` only takes the standard values, call `compute()` for custom scrolling
// @ts-expect-error
scrollIntoView(node, { behavior: () => {} })
// @ts-expect-error
scrollIntoView<boolean>(node)

// @ts-expect-error
scrollIntoView(undefined)
// A Range or Selection needs selection() in the middleware
// @ts-expect-error
scrollIntoView(range)
// @ts-expect-error
scrollIntoView(range, true)
// @ts-expect-error
scrollIntoView(range, { scroll: 'if-needed' })
// @ts-expect-error
scrollIntoView(range, { middleware: [] })
// @ts-expect-error
scrollIntoView(range, { middleware: [onlyIfNeeded()] })
// @ts-expect-error
scrollIntoView(range, { middleware: [custom] })
// @ts-expect-error
scrollIntoView(selected)
// @ts-expect-error
scrollIntoView(selected, { block: 'nearest' })
// @ts-expect-error
scrollIntoView(selected, { scroll: 'if-needed', middleware: [custom] })
// @ts-expect-error
scrollIntoView(document.createTextNode('text'))
// @ts-expect-error
scrollIntoView(node, { unknown: 'option' })
// @ts-expect-error
scrollIntoView(node, { block: 'invalid' })
// @ts-expect-error
scrollIntoView(node, { inline: 'invalid' })
// @ts-expect-error
scrollIntoView(node, { scroll: 'invalid' })
// @ts-expect-error
scrollIntoView(node, { scrollMode: 'invalid' })
// @ts-expect-error
scrollIntoView(node, { middleware: [{ name: 'custom', fn: 'nope' }] })
// @ts-expect-error
scrollIntoView(node, { container: 'invalid' })
// Removed in v4, use `container` or middleware instead
// @ts-expect-error
scrollIntoView(node, { boundary: document.documentElement })
// @ts-expect-error
scrollIntoView(node, { skipOverflowHiddenElements: true })
// @ts-expect-error
scrollIntoView(node, { behavior: 'invalid' })
