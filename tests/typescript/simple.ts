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

scrollIntoView(node, { scrollMode: 'always' })
scrollIntoView(node, { scrollMode: 'if-needed' })

// Non-standard custom options
scrollIntoView(node, { skipOverflowHiddenElements: true })
scrollIntoView(node, { skipOverflowHiddenElements: false })
scrollIntoView(node, { boundary: document.documentElement })
// This test relies on deeper type information, if el is suddenly `any` it'll fail
scrollIntoView(node, {
  boundary: (el) => el.classList.contains('should-scroll'),
})

// Ensure the custom behavior callback option contains enough type information to be typesafe
const actionsCount: number = scrollIntoView(node, {
  behavior: (actions) => {
    const scrollframes = actions.length
    actions.forEach(({ el, left, top }) => {
      el.scroll({ left, top })
    })
    return scrollframes
  },
})
node.title = `Frames that got scrolled: ${actionsCount}`

// Test cases that should fail

// @ts-expect-error
scrollIntoView(undefined)
// @ts-expect-error
scrollIntoView(node, { unknown: 'option' })
// @ts-expect-error
scrollIntoView(node, { block: 'invalid' })
// @ts-expect-error
scrollIntoView(node, { inline: 'invalid' })
// @ts-expect-error
scrollIntoView(node, { scrollMode: 'invalid' })
// @ts-expect-error
scrollIntoView(node, { boundary: 'invalid' })
// @ts-expect-error
scrollIntoView(node, { skipOverflowHiddenElements: 'invalid' })
// @ts-expect-error
scrollIntoView(node, { behavior: 'invalid' })
