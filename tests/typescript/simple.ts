import scrollIntoView from '../../src/index'

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

// A Range or Selection scrolls its text into view
scrollIntoView(document.createRange(), { scroll: 'if-needed' })
scrollIntoView(document.getSelection()!, { block: 'nearest' })

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
