import { beforeEach, expect, test } from 'vite-plus/test'

import scrollIntoView from '../../src/index'
import type { Middleware } from '../../src/middleware'
import { selection } from '../../src/middleware'
import { getElement, render } from './utils'

const css = `
  body {
    margin: 0;
  }
  .outer {
    height: 200px;
    width: 300px;
    overflow: auto;
  }
  .inner {
    height: 100px;
    width: 200px;
    overflow: auto;
  }
  .tall {
    height: 1000px;
  }
  .line {
    height: 20px;
    margin: 0;
  }
`

const html = `
  <div class="outer">
    <div class="tall">
      <div class="inner" data-scroll-root>
        <div class="tall">
          <p class="line" id="top">top</p>
          <div style="height: 600px"></div>
          <p class="line" id="caret">caret line</p>
        </div>
      </div>
    </div>
  </div>
`

beforeEach(() => {
  render(html, css)
})

test('custom middleware changes which scroll containers are scrolled', () => {
  const stopAtScrollRoot: Middleware = {
    name: 'stopAtScrollRoot',
    fn: ({ container }) =>
      container.matches('[data-scroll-root]') ? { stop: true } : {},
  }
  const outer = getElement('.outer')
  const inner = getElement('.inner')

  scrollIntoView(getElement('#caret'), {
    block: 'start',
    middleware: [stopAtScrollRoot],
  })

  expect(inner.scrollTop).toBeGreaterThan(0)
  expect(outer.scrollTop).toBe(0)
})

test("custom middleware can grow a container's scroll-padding", () => {
  const clearHeader: Middleware = {
    name: 'clearHeader',
    fn: ({ container, rects }) =>
      container.matches('[data-scroll-root]')
        ? {
            rects: {
              scrollPadding: {
                top: rects.scrollPadding.top + 50,
                right: rects.scrollPadding.right,
                bottom: rects.scrollPadding.bottom,
                left: rects.scrollPadding.left,
              },
            },
          }
        : {},
  }
  const caret = getElement('#caret')
  const inner = getElement('.inner')

  scrollIntoView(caret, {
    block: 'start',
    container: 'nearest',
    middleware: [clearHeader],
  })

  const offset =
    caret.getBoundingClientRect().top - inner.getBoundingClientRect().top
  expect(offset).toBeGreaterThan(48)
  expect(offset).toBeLessThan(52)
})

test('selection() aligns the caret and `scroll: "if-needed"` runs after it', () => {
  const caret = getElement('#caret')
  const inner = getElement('.inner')
  const range = document.createRange()
  range.setStart(caret.firstChild!, 3)
  range.collapse(true)

  scrollIntoView(range, {
    scroll: 'if-needed',
    block: 'nearest',
    inline: 'nearest',
    container: 'nearest',
    middleware: [selection()],
  })

  const caretBox = range.getBoundingClientRect()
  const innerBox = inner.getBoundingClientRect()
  expect(inner.scrollTop).toBeGreaterThan(0)
  expect(caretBox.bottom).toBeLessThanOrEqual(innerBox.bottom + 1)
  expect(caretBox.top).toBeGreaterThanOrEqual(innerBox.top - 1)

  const scrollTop = inner.scrollTop
  scrollIntoView(range, {
    scroll: 'if-needed',
    block: 'nearest',
    container: 'nearest',
    middleware: [selection()],
  })
  expect(inner.scrollTop).toBe(scrollTop)
})

test('a Range target aligns the box around its text', () => {
  const top = getElement('#top')
  const caret = getElement('#caret')
  const inner = getElement('.inner')
  const range = document.createRange()
  range.selectNodeContents(caret)

  scrollIntoView(range, { block: 'start', container: 'nearest' })

  const offset =
    range.getBoundingClientRect().top - inner.getBoundingClientRect().top
  expect(Math.abs(offset)).toBeLessThan(1)

  // From inside the first line to the start of the last, which is taller than `.inner`
  range.setStart(top.firstChild!, 1)
  range.setEnd(caret.firstChild!, 0)
  scrollIntoView(range, { block: 'start', container: 'nearest' })
  expect(
    Math.abs(
      top.getBoundingClientRect().top - inner.getBoundingClientRect().top,
    ),
  ).toBeLessThan(1)
})

test('a Selection target scrolls its focus with selection(), and an empty one does nothing', () => {
  const top = getElement('#top')
  const caret = getElement('#caret')
  const inner = getElement('.inner')
  const selected = document.getSelection()!
  // Backward, so the focus is on the first line
  selected.setBaseAndExtent(caret.firstChild!, 3, top.firstChild!, 1)
  inner.scrollTop = 300

  scrollIntoView(selected, {
    block: 'nearest',
    container: 'nearest',
    middleware: [selection()],
  })
  expect(inner.scrollTop).toBe(0)

  selected.removeAllRanges()
  inner.scrollTop = 300
  expect(() => scrollIntoView(selected)).not.toThrow()
  expect(inner.scrollTop).toBe(300)
})

test("a Range in a detached tree doesn't scroll", () => {
  const detached = document.createElement('p')
  detached.textContent = 'detached'
  const range = document.createRange()
  range.selectNodeContents(detached)
  const outer = getElement('.outer')

  expect(() => scrollIntoView(range)).not.toThrow()
  expect(outer.scrollTop).toBe(0)
})
