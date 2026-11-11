// Port of web-platform-tests css/cssom-view/scrollIntoView-smooth.html
// https://github.com/web-platform-tests/wpt/blob/master/css/cssom-view/scrollIntoView-smooth.html
import { beforeAll, expect, test } from 'vite-plus/test'

import scrollIntoView from '../../src/index'
import {
  expectApprox,
  getElement,
  hideFrameElement,
  render,
  waitForScrollEnd,
} from './utils'

const contentSize = 500
let content: HTMLElement
let windowWidth: number
let windowHeight: number

beforeAll(() => {
  hideFrameElement()
  render(
    `<div id="container" style="height: 2500px; width: 2500px">
      <div
        id="content"
        style="height: 500px; width: 500px; margin: 1000px; background-color: red"
      ></div>
    </div>`,
    '',
  )
  content = getElement('#content')
  const scrollingElement = document.scrollingElement ?? document.documentElement
  windowWidth = scrollingElement.clientWidth
  windowHeight = scrollingElement.clientHeight
})

const cases = [
  {
    position: 'nearest',
    x: () => content.offsetLeft + contentSize - windowWidth,
    y: () => content.offsetTop + contentSize - windowHeight,
  },
  {
    position: 'start',
    x: () => content.offsetLeft,
    y: () => content.offsetTop,
  },
  {
    position: 'center',
    x: () => content.offsetLeft + (contentSize - windowWidth) / 2,
    y: () => content.offsetTop + (contentSize - windowHeight) / 2,
  },
  {
    position: 'end',
    x: () => content.offsetLeft + contentSize - windowWidth,
    y: () => content.offsetTop + contentSize - windowHeight,
  },
] as const

test.each(cases)(
  "Smooth scrollIntoView should scroll the element to the '$position' position",
  async ({ position, x, y }) => {
    window.scrollTo(0, 0)
    const expectedX = x()
    const expectedY = y()
    expect(window.scrollX, 'scrollX').not.toBe(expectedX)
    expect(window.scrollY, 'scrollY').not.toBe(expectedY)
    scrollIntoView(content, {
      behavior: 'smooth',
      block: position,
      inline: position,
    })
    await waitForScrollEnd()
    expectApprox(window.scrollX, expectedX, 1, 'scrollX')
    expectApprox(window.scrollY, expectedY, 1, 'scrollY')
  },
)
