// Port of web-platform-tests css/cssom-view/scrollIntoView-shadow.html
// https://github.com/web-platform-tests/wpt/blob/master/css/cssom-view/scrollIntoView-shadow.html
import { expect, test } from 'vite-plus/test'

import scrollIntoView from '../../src/index'
import { expectApprox, getElement, hideFrameElement, render } from './utils'

test('scrollIntoView should behave correctly if applies to shadow dom elements', () => {
  hideFrameElement()
  render(
    `<div id="container">
      <div id="space1" style="height: 2000px; width: 2000px; background-color: yellow"></div>
      <div id="shadow"></div>
      <div id="space2" style="height: 2000px; width: 2000px; background-color: blue"></div>
    </div>`,
    // The default margin of a web-platform-tests page
    'body { margin: 8px; }',
  )
  const shadowRoot = getElement('#shadow').attachShadow({ mode: 'open' })
  const shadowDiv = document.createElement('div')
  shadowDiv.style.height = '200px'
  shadowDiv.style.width = '200px'
  shadowDiv.style.backgroundColor = 'green'
  shadowRoot.append(shadowDiv)

  window.scrollTo(0, 0)
  const expectedX = shadowDiv.offsetLeft
  const expectedY = shadowDiv.offsetTop
  expect(window.scrollX).not.toBe(expectedX)
  expect(window.scrollY).not.toBe(expectedY)
  scrollIntoView(shadowDiv, { block: 'start', inline: 'start' })
  expectApprox(window.scrollX, expectedX, 1, 'scrollX')
  expectApprox(window.scrollY, expectedY, 1, 'scrollY')
})
