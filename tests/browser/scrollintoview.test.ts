// Port of web-platform-tests css/cssom-view/scrollintoview.html
// https://github.com/web-platform-tests/wpt/blob/master/css/cssom-view/scrollintoview.html
import { beforeAll, describe, test } from 'vite-plus/test'

import scrollIntoView from '../../src/index'
import { expectApprox, getElement, render } from './utils'

let testDiv: HTMLElement
let expected: Record<
  'left' | 'right' | 'centerX' | 'top' | 'bottom' | 'centerY',
  number
>

beforeAll(() => {
  render(
    '<div id="testDiv"></div>',
    `body {
      margin: 0;
      padding: 4000px;
      overflow: hidden;
    }
    #testDiv {
      width: 200px;
      height: 200px;
      background-color: lightgreen;
    }`,
  )
  testDiv = getElement('#testDiv')
  expected = {
    left: 4000,
    right: 4000 - window.innerWidth + testDiv.clientWidth,
    centerX: 4000 - window.innerWidth / 2 + testDiv.clientWidth / 2,
    top: 4000,
    bottom: 4000 - window.innerHeight + testDiv.clientHeight,
    centerY: 4000 - window.innerHeight / 2 + testDiv.clientHeight / 2,
  }
})

type Expected = keyof typeof expected | 'nearest'

const cases: [
  input: string,
  call: (target: Element) => void,
  x: Expected,
  y: Expected,
][] = [
  ['', (target) => scrollIntoView(target), 'nearest', 'top'],
  ['true', (target) => scrollIntoView(target, true), 'nearest', 'top'],
  ['false', (target) => scrollIntoView(target, false), 'nearest', 'bottom'],
  [
    'undefined',
    (target) => scrollIntoView(target, undefined),
    'nearest',
    'top',
  ],
  // @ts-expect-error -- `null` isn't in the types, but behaves like the spec's default
  ['null', (target) => scrollIntoView(target, null), 'nearest', 'top'],
  ['{}', (target) => scrollIntoView(target, {}), 'nearest', 'top'],
  [
    '{block: "center", inline: "center"}',
    (target) => scrollIntoView(target, { block: 'center', inline: 'center' }),
    'centerX',
    'centerY',
  ],
  [
    '{block: "start", inline: "start"}',
    (target) => scrollIntoView(target, { block: 'start', inline: 'start' }),
    'left',
    'top',
  ],
  [
    '{block: "end", inline: "end"}',
    (target) => scrollIntoView(target, { block: 'end', inline: 'end' }),
    'right',
    'bottom',
  ],
  [
    '{block: "nearest", inline: "nearest"}',
    (target) => scrollIntoView(target, { block: 'nearest', inline: 'nearest' }),
    'nearest',
    'nearest',
  ],
]

// Where the window starts, and which edge "nearest" then aligns to
const starts = [
  { name: 'left,top', x: 0, y: 0, nearestX: 'right', nearestY: 'bottom' },
  { name: 'left,bottom', x: 0, y: 12000, nearestX: 'right', nearestY: 'top' },
  { name: 'right,top', x: 12000, y: 0, nearestX: 'left', nearestY: 'bottom' },
  {
    name: 'right,bottom',
    x: 12000,
    y: 12000,
    nearestX: 'left',
    nearestY: 'top',
  },
] as const

describe.each(cases)('scrollIntoView(%s)', (_, call, expectedX, expectedY) => {
  test.each(starts)('starting at $name', (start) => {
    window.scrollTo(start.x, start.y)
    call(testDiv)
    const x = expected[expectedX === 'nearest' ? start.nearestX : expectedX]
    const y = expected[expectedY === 'nearest' ? start.nearestY : expectedY]
    expectApprox(window.scrollX, x, 0.5, 'scrollX')
    expectApprox(window.scrollY, y, 0.5, 'scrollY')
  })
})
