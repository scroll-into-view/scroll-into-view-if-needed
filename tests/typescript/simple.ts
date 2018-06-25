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
scrollIntoView(node, { behavior: 'instant' })

scrollIntoView(node, { block: 'start', inline: 'start' })
scrollIntoView(node, { block: 'center', inline: 'center' })
scrollIntoView(node, { block: 'end', inline: 'end' })
scrollIntoView(node, { block: 'nearest', inline: 'nearest' })

scrollIntoView(node, { scrollMode: 'always' })
scrollIntoView(node, { scrollMode: 'if-needed' })

// Non-standard custom options
scrollIntoView(node, { skipOverflowHiddenElements: true })
scrollIntoView(node, { skipOverflowHiddenElements: false })
scrollIntoView(node, { boundary: document.documentElement })
// This test relies on deeper type information, if el is suddenly `any` it'll fail
scrollIntoView(node, { boundary: el => el.classList.contains('should-scroll') })
