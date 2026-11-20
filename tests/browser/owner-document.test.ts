// Targets connected to their own document, including another document's shadow
// tree, must scroll. A detached shadow tree stays a no-op.
import { expect, test } from 'vite-plus/test'

import scrollIntoView from '../../src/index'

const invoke = (target: Element): unknown => {
  let calls = 0
  const result = scrollIntoView(target, {
    behavior: () => {
      calls += 1
      return 'called'
    },
  })
  expect(calls).toBe(result === 'called' ? 1 : 0)
  return result
}

test('a connected target in the current document invokes custom behavior', () => {
  const target = document.createElement('div')
  document.body.append(target)
  try {
    expect(invoke(target)).toBe('called')
  } finally {
    target.remove()
  }
})

const iframeModes = ['light', 'open', 'closed'] as const

for (const mode of iframeModes) {
  test(`an iframe target in ${mode} DOM invokes custom behavior`, () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    try {
      const ownerDocument = frame.contentDocument
      if (!ownerDocument?.body) {
        throw new Error('The iframe has no document')
      }
      const host = ownerDocument.createElement('div')
      ownerDocument.body.append(host)
      const target = ownerDocument.createElement('div')
      const parent = mode === 'light' ? host : host.attachShadow({ mode })
      parent.append(target)
      expect(invoke(target)).toBe('called')
    } finally {
      frame.remove()
    }
  })
}

test('a target in a detached shadow tree remains a no-op', () => {
  const host = document.createElement('div')
  const target = document.createElement('div')
  host.attachShadow({ mode: 'open' }).append(target)

  expect(invoke(target)).toBeUndefined()
})
