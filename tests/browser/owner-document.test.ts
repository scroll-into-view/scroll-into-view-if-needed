// Targets connected to their own document, including another document's shadow
// tree, must scroll. A detached shadow tree stays a no-op.
import { expect, test } from 'vite-plus/test'

import scrollIntoView from '../../src/index'

// `host` becomes a scroll container with the target below its fold, so a
// scroll shows up as a change to `host.scrollTop`
const makeScroller = (host: HTMLElement, parent: ParentNode) => {
  host.style.cssText = 'height: 50px; overflow: auto'
  const ownerDocument = host.ownerDocument
  const spacer = ownerDocument.createElement('div')
  spacer.style.height = '200px'
  const target = ownerDocument.createElement('div')
  target.style.height = '10px'
  parent.append(spacer, target)
  return target
}

test('a connected target in the current document scrolls', () => {
  const host = document.createElement('div')
  document.body.append(host)
  try {
    const target = makeScroller(host, host)
    scrollIntoView(target, { block: 'start' })
    expect(host.scrollTop).toBeGreaterThan(0)
  } finally {
    host.remove()
  }
})

const iframeModes = ['light', 'open', 'closed'] as const

for (const mode of iframeModes) {
  test(`an iframe target in ${mode} DOM scrolls`, () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    try {
      const ownerDocument = frame.contentDocument
      if (!ownerDocument?.body) {
        throw new Error('The iframe has no document')
      }
      const host = ownerDocument.createElement('div')
      ownerDocument.body.append(host)
      const parent = mode === 'light' ? host : host.attachShadow({ mode })
      const target = makeScroller(host, parent)
      scrollIntoView(target, { block: 'start' })
      expect(host.scrollTop).toBeGreaterThan(0)
    } finally {
      frame.remove()
    }
  })
}

test('a target in a detached shadow tree remains a no-op', () => {
  const host = document.createElement('div')
  const target = document.createElement('div')
  host.attachShadow({ mode: 'open' }).append(target)

  expect(() => scrollIntoView(target)).not.toThrow()
  expect(host.scrollTop).toBe(0)
})
