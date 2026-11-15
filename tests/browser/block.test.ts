// Port of the former Next.js + Cypress integration test
// (tests/integration/pages/block.js and cypress/integration/block.js)
import { beforeAll, beforeEach, expect, test } from 'vite-plus/test'

import scrollIntoView from '../../src/index'
import { getElement, render } from './utils'

const SIZE = 100

beforeAll(() => {
  render(
    `<div class="is-full-height align-center"></div>
    <div class="is-full-height align-center"><div class="test-assertion"></div></div>
    <div class="is-full-height align-center"></div>`,
    `*, *:before, *:after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
    }
    .align-center {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .is-full-height {
      height: 100vh;
    }
    .test-assertion {
      height: ${SIZE}px;
      width: ${SIZE}px;
      background: #ffeb3b;
    }`,
  )
})

beforeEach(() => {
  const node = getElement('.test-assertion')
  node.style.scrollMargin = ''
  window.scrollTo(0, 0)
})

test('should align to start correctly', () => {
  const node = getElement('.test-assertion')
  scrollIntoView(node, { block: 'start' })
  expect(node.getBoundingClientRect().top).toBe(0)
})

test('should align to center correctly', () => {
  const node = getElement('.test-assertion')
  scrollIntoView(node, { block: 'center' })
  expect(node.getBoundingClientRect().top).toBe(
    Math.round(window.innerHeight / 2 - SIZE / 2),
  )
})

test('should align to end correctly', () => {
  const node = getElement('.test-assertion')
  scrollIntoView(node, { block: 'end' })
  expect(node.getBoundingClientRect().bottom).toBe(window.innerHeight)
})

test('should respect scroll-margin', () => {
  const node = getElement('.test-assertion')
  node.style.scrollMargin = '20px 0 0 0'
  scrollIntoView(node, { block: 'start' })
  expect(node.getBoundingClientRect().top).toBe(20)
})
