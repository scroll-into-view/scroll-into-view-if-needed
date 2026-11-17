import {
  compute,
  type Middleware,
  type ScrollAction,
} from 'compute-scroll-into-view'
import {
  boundary,
  onlyIfNeeded,
  skipOverflowHiddenElements,
} from 'compute-scroll-into-view/middleware'
import { afterEach, describe, expect, test, vi } from 'vite-plus/test'

import scrollIntoView from '../../src/index'

const middleware = (name: string): Middleware => ({ name, fn: () => ({}) })

vi.mock('compute-scroll-into-view', () => ({
  compute: vi.fn<typeof compute>(() => []),
}))
vi.mock('compute-scroll-into-view/middleware', () => ({
  boundary: vi.fn<typeof boundary>(() => middleware('boundary')),
  onlyIfNeeded: vi.fn<typeof onlyIfNeeded>(() => middleware('onlyIfNeeded')),
  skipOverflowHiddenElements: vi.fn<typeof skipOverflowHiddenElements>(() =>
    middleware('skipOverflowHiddenElements'),
  ),
}))

const computeMock = vi.mocked(compute)
const boundaryMock = vi.mocked(boundary)

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

    scrollIntoView(target, {
      behavior: 'smooth',
      block: 'center',
      inline: 'end',
      container: 'nearest',
      scroll: 'if-needed',
      boundary: document.body,
      skipOverflowHiddenElements: true,
    })

    expect(computeMock).toHaveBeenCalledExactlyOnceWith(target, {
      block: 'center',
      inline: 'end',
      container: 'nearest',
      middleware: [
        expect.objectContaining({ name: 'boundary' }),
        expect.objectContaining({ name: 'skipOverflowHiddenElements' }),
        expect.objectContaining({ name: 'onlyIfNeeded' }),
      ],
    })
  })
})

describe('middleware', () => {
  test('is empty by default', () => {
    scrollIntoView(createTarget(), {
      scroll: 'always',
      boundary: null,
      skipOverflowHiddenElements: false,
    })

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

  test.each([
    ['an element', document.documentElement],
    ['a callback', (parent: Element) => parent !== document.body],
  ])('boundary as %s adds boundary(boundary)', (_, option) => {
    scrollIntoView(createTarget(), { boundary: option })

    expect(boundaryMock).toHaveBeenCalledExactlyOnceWith(option)
    expect(middlewareNames()).toEqual(['boundary'])
  })

  test('skipOverflowHiddenElements adds skipOverflowHiddenElements()', () => {
    scrollIntoView(createTarget(), { skipOverflowHiddenElements: true })

    expect(middlewareNames()).toEqual(['skipOverflowHiddenElements'])
  })

  test('onlyIfNeeded() is last', () => {
    scrollIntoView(createTarget(), {
      scroll: 'if-needed',
      boundary: document.body,
      skipOverflowHiddenElements: true,
    })

    expect(middlewareNames()).toEqual([
      'boundary',
      'skipOverflowHiddenElements',
      'onlyIfNeeded',
    ])
  })

  test('a custom behavior gets the actions after middleware has run', () => {
    const { scrollActions } = mockActions()
    const behavior = vi.fn<(received: ScrollAction[]) => void>()

    scrollIntoView(createTarget(), { behavior, scroll: 'if-needed' })

    expect(middlewareNames()).toEqual(['onlyIfNeeded'])
    expect(behavior).toHaveBeenCalledExactlyOnceWith(scrollActions)
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
    expect(computeMock).toHaveBeenCalledWith(target, {
      block: 'center',
      middleware: [],
    })
    expect(behavior).toHaveBeenCalledExactlyOnceWith(scrollActions)
    for (const scroll of scrolls) {
      expect(scroll).not.toHaveBeenCalled()
    }
  })
})
