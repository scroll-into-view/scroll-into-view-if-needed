import {
  compute,
  type Middleware,
  type ScrollAction,
} from 'compute-scroll-into-view'
import { onlyIfNeeded } from 'compute-scroll-into-view/middleware'
import { afterEach, describe, expect, test, vi } from 'vite-plus/test'

import scrollIntoView from '../../src/index'

const middleware = (name: string): Middleware => ({ name, fn: () => ({}) })

vi.mock('compute-scroll-into-view', () => ({
  compute: vi.fn<typeof compute>(() => []),
}))
vi.mock('compute-scroll-into-view/middleware', () => ({
  onlyIfNeeded: vi.fn<typeof onlyIfNeeded>(() => middleware('onlyIfNeeded')),
}))

const computeMock = vi.mocked(compute)

const middlewareNames = () =>
  computeMock.mock.calls[0]?.[1]?.middleware?.map(({ name }) => name)

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

describe('whether the target is in its document', () => {
  test('ignores targets that are not connected', () => {
    const target = document.createElement('div')

    expect(scrollIntoView(target)).toBeUndefined()
    expect(computeMock).not.toHaveBeenCalled()
  })

  test('scrolls targets that are connected to another document', () => {
    const otherDocument = document.implementation.createHTMLDocument()
    const target = otherDocument.createElement('div')
    otherDocument.body.append(target)

    expect(target.isConnected).toBe(true)
    scrollIntoView(target)

    expect(computeMock).toHaveBeenCalledOnce()
    expect(computeMock).toHaveBeenCalledWith(target, expect.any(Object))
  })

  test.each(['open', 'closed'] as const)(
    'scrolls targets inside a %s shadow root',
    (mode) => {
      const host = createTarget()
      const target = document.createElement('div')
      host.attachShadow({ mode }).append(target)

      scrollIntoView(target)

      expect(computeMock).toHaveBeenCalledOnce()
      expect(computeMock).toHaveBeenCalledWith(target, expect.any(Object))
    },
  )

  test('ignores targets in a detached shadow tree', () => {
    const host = document.createElement('div')
    const target = document.createElement('div')
    host.attachShadow({ mode: 'open' }).append(target)

    expect(target.isConnected).toBe(false)
    expect(scrollIntoView(target)).toBeUndefined()
    expect(computeMock).not.toHaveBeenCalled()
  })
})

describe('Range and Selection targets', () => {
  test('passes a connected Range on to compute', () => {
    const range = document.createRange()
    range.selectNodeContents(createTarget())

    scrollIntoView(range)

    expect(computeMock).toHaveBeenCalledWith(range, expect.any(Object))
  })

  test('ignores a Range whose end is not connected', () => {
    const range = document.createRange()
    range.selectNodeContents(document.createElement('div'))

    scrollIntoView(range)

    expect(computeMock).not.toHaveBeenCalled()
  })

  test('passes a Selection on to compute', () => {
    const selected = document.getSelection()!
    selected.selectAllChildren(createTarget())

    scrollIntoView(selected)

    expect(computeMock).toHaveBeenCalledWith(selected, expect.any(Object))
  })

  test('ignores a Selection without ranges', () => {
    const selected = document.getSelection()!
    selected.removeAllRanges()

    scrollIntoView(selected)

    expect(computeMock).not.toHaveBeenCalled()
  })
})

describe('options', () => {
  const start = { block: 'start', inline: 'nearest', middleware: [] }
  const end = { block: 'end', inline: 'nearest', middleware: [] }

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

  test('passes only the spec options and the middleware on to compute', () => {
    const target = createTarget()
    const custom = middleware('custom')

    scrollIntoView(target, {
      behavior: 'smooth',
      block: 'center',
      inline: 'end',
      container: 'nearest',
      scroll: 'if-needed',
      middleware: [custom],
    })

    expect(computeMock).toHaveBeenCalledExactlyOnceWith(target, {
      block: 'center',
      inline: 'end',
      container: 'nearest',
      middleware: [custom, expect.objectContaining({ name: 'onlyIfNeeded' })],
    })
  })

  test.each([
    ['boundary', { boundary: document.body }],
    ['skipOverflowHiddenElements', { skipOverflowHiddenElements: true }],
  ])('ignores the removed %s option', (_, options) => {
    // @ts-expect-error -- removed in v4, plain JavaScript callers may still pass it
    scrollIntoView(createTarget(), options)

    expect(middlewareNames()).toEqual([])
  })
})

describe('middleware', () => {
  test('is empty by default', () => {
    scrollIntoView(createTarget(), { scroll: 'always' })

    expect(middlewareNames()).toEqual([])
  })

  test("scroll: 'if-needed' adds onlyIfNeeded()", () => {
    scrollIntoView(createTarget(), { scroll: 'if-needed' })

    expect(middlewareNames()).toEqual(['onlyIfNeeded'])
  })

  test("scrollMode: 'if-needed' adds onlyIfNeeded()", () => {
    scrollIntoView(createTarget(), { scrollMode: 'if-needed' })

    expect(middlewareNames()).toEqual(['onlyIfNeeded'])
  })

  test('scroll wins when scrollMode is also set', () => {
    scrollIntoView(createTarget(), {
      scroll: 'always',
      scrollMode: 'if-needed',
    })

    expect(middlewareNames()).toEqual([])
  })

  test('user middleware runs in order, before onlyIfNeeded()', () => {
    scrollIntoView(createTarget(), {
      scroll: 'if-needed',
      middleware: [middleware('first'), middleware('second')],
    })

    expect(middlewareNames()).toEqual(['first', 'second', 'onlyIfNeeded'])
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
})
