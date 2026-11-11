import { compute, type ScrollAction } from 'compute-scroll-into-view'
import { afterEach, describe, expect, test, vi } from 'vite-plus/test'

import scrollIntoView from '../../src/index'

vi.mock('compute-scroll-into-view', () => ({
  compute: vi.fn<typeof compute>(() => []),
}))

const computeMock = vi.mocked(compute)

const createTarget = (): HTMLDivElement => {
  const target = document.createElement('div')
  document.body.append(target)
  return target
}

const createScrollable = () => {
  const el = document.createElement('div')
  const scroll = vi.fn<(options?: ScrollToOptions) => void>()
  Object.defineProperty(el, 'scroll', { value: scroll })
  return { el, scroll }
}

// Makes compute return two scroll actions, and spies on their `scroll` calls
const mockActions = () => {
  const first = createScrollable()
  const second = createScrollable()
  const scrollActions: ScrollAction[] = [
    { el: first.el, top: 10, left: 20 },
    { el: second.el, top: 30, left: 40 },
  ]
  computeMock.mockReturnValue(scrollActions)
  return { scrollActions, scrolls: [first.scroll, second.scroll] }
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('targets that are not in the document', () => {
  test('ignores targets that are not connected', () => {
    const target = document.createElement('div')

    expect(scrollIntoView(target)).toBeUndefined()
    expect(computeMock).not.toHaveBeenCalled()
  })

  test('ignores targets that are connected to another document', () => {
    const otherDocument = document.implementation.createHTMLDocument()
    const target = otherDocument.createElement('div')
    otherDocument.body.append(target)

    expect(target.isConnected).toBe(true)
    expect(scrollIntoView(target)).toBeUndefined()
    expect(computeMock).not.toHaveBeenCalled()
  })

  test('scrolls targets inside a shadow root', () => {
    const host = createTarget()
    const target = document.createElement('div')
    host.attachShadow({ mode: 'open' }).append(target)

    scrollIntoView(target)

    expect(computeMock).toHaveBeenCalledOnce()
    expect(computeMock).toHaveBeenCalledWith(target, expect.any(Object))
  })
})

describe('options', () => {
  const start = { block: 'start', inline: 'nearest' }
  const end = { block: 'end', inline: 'nearest' }

  test.each([
    ['omitted', () => scrollIntoView(createTarget()), start],
    ['undefined', () => scrollIntoView(createTarget(), undefined), start],
    // @ts-expect-error -- `null` isn't in the types, but behaves like the spec's default (web-platform-tests)
    ['null', () => scrollIntoView(createTarget(), null), start],
    ['true', () => scrollIntoView(createTarget(), true), start],
    ['false', () => scrollIntoView(createTarget(), false), end],
    ['{}', () => scrollIntoView(createTarget(), {}), start],
  ])('%s computes the spec default alignment', (_, call, expected) => {
    call()

    expect(computeMock).toHaveBeenCalledOnce()
    expect(computeMock.mock.calls[0]?.[1]).toEqual(expected)
  })

  test('passes standard options through unchanged', () => {
    const target = createTarget()
    const options = {
      block: 'center',
      inline: 'end',
      scrollMode: 'if-needed',
      skipOverflowHiddenElements: true,
    } as const

    scrollIntoView(target, options)

    expect(computeMock).toHaveBeenCalledWith(target, options)
  })
})

describe('scrolling', () => {
  test('scrolls every element that compute returns', () => {
    const { scrolls } = mockActions()

    scrollIntoView(createTarget())

    expect(scrolls[0]).toHaveBeenCalledExactlyOnceWith({
      top: 10,
      left: 20,
      behavior: undefined,
    })
    expect(scrolls[1]).toHaveBeenCalledExactlyOnceWith({
      top: 30,
      left: 40,
      behavior: undefined,
    })
  })

  test.each(['auto', 'smooth'] as const)(
    'passes behavior: %s on to Element.scroll',
    (behavior) => {
      const { scrolls } = mockActions()

      scrollIntoView(createTarget(), { behavior })

      for (const scroll of scrolls) {
        expect(scroll).toHaveBeenCalledWith(
          expect.objectContaining({ behavior }),
        )
      }
    },
  )

  test('a custom behavior gets the actions instead of scrolling', () => {
    const { scrollActions, scrolls } = mockActions()
    const target = createTarget()
    const behavior = vi.fn<(received: ScrollAction[]) => number>(
      (received) => received.length,
    )
    const options = { behavior, block: 'center' } as const

    const result = scrollIntoView(target, options)

    expect(result).toBe(2)
    expect(computeMock).toHaveBeenCalledWith(target, options)
    expect(behavior).toHaveBeenCalledExactlyOnceWith(scrollActions)
    for (const scroll of scrolls) {
      expect(scroll).not.toHaveBeenCalled()
    }
  })
})
