// Port of the custom web-platform-tests style test for nested scroll containers
// with borders (formerly tests/web-platform/custom/borders.html)
import { beforeAll, test } from 'vite-plus/test'

import scrollIntoView from '../../src/index'
import { expectApprox, getElement, render } from './utils'

const css = `
  body {
    margin: 0;
    padding: 4000px;
    overflow: auto;
  }
  .outer-scroll-container,
  .inner-scroll-container {
    overflow: scroll;
    border: 3px solid hsla(0, 0%, 0%, 0.1);
  }
  .outer-scroll-container,
  .inner-scroll-element {
    height: 400px;
    width: 400px;
  }
  .inner-scroll-container {
    height: 200px;
    width: 200px;
  }
  .outer-scroll-element,
  .inner-scroll-element {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .outer-scroll-element {
    height: 800px;
    width: 800px;
  }
  .scroll-padding {
    display: flex;
    flex-wrap: wrap;
    padding: 16.666666666666668px;
    height: 333.3333333333333px;
    width: 333.3333333333333px;
  }
  .layer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 33.333333333333336%;
    flex: none;
    width: 33.3333%;
  }
  .scroll-tile {
    font-size: 48px;
    display: flex;
    align-items: center;
    border-radius: 4px;
    height: 66.66666666666667px;
    justify-content: center;
    width: 66.66666666666667px;
  }
`

const tiles = Array.from(
  { length: 9 },
  (_, i) => `<div class="layer"><div class="scroll-tile">${i + 1}</div></div>`,
).join('')

let tileElements: NodeListOf<HTMLElement>
let outerContainer: HTMLElement
let innerContainer: HTMLElement
// offsetWidth - borderWidth - clientWidth = scrollbar width
let outerOffsetX: number
let outerOffsetY: number
let innerOffsetX: number
let innerOffsetY: number

beforeAll(() => {
  render(
    `<div class="outer-scroll-container">
      <div class="outer-scroll-element">
        <div class="inner-scroll-container">
          <div class="inner-scroll-element">
            <div class="scroll-padding">${tiles}</div>
          </div>
        </div>
      </div>
    </div>`,
    css,
  )
  tileElements = document.querySelectorAll('.scroll-tile')
  outerContainer = getElement('.outer-scroll-container')
  innerContainer = getElement('.inner-scroll-container')
  const borderWidth = 6
  outerOffsetX =
    outerContainer.offsetWidth - outerContainer.clientWidth - borderWidth
  outerOffsetY =
    outerContainer.offsetHeight - outerContainer.clientHeight - borderWidth
  innerOffsetX =
    innerContainer.offsetWidth - innerContainer.clientWidth - borderWidth
  innerOffsetY =
    innerContainer.offsetHeight - innerContainer.clientHeight - borderWidth
})

type Position = { x: number; y: number }

const cases: [
  target: number,
  block: ScrollLogicalPosition,
  inline: ScrollLogicalPosition | undefined,
  expected: () => [outer: Position, inner: Position],
][] = [
  [
    0,
    'start',
    'start',
    () => [
      { x: 300, y: 300 },
      { x: 55, y: 55 },
    ],
  ],
  [
    1,
    'start',
    'center',
    () => [
      { x: 200, y: 300 },
      { x: 100 + innerOffsetX / 2, y: 55 },
    ],
  ],
  [
    2,
    'start',
    'end',
    () => [
      { x: 100, y: 300 },
      { x: 145 + innerOffsetX, y: 55 },
    ],
  ],
  [
    3,
    'center',
    'start',
    () => [
      { x: 300, y: 200 },
      { x: 55, y: 100 + innerOffsetY / 2 },
    ],
  ],
  [
    4,
    'center',
    'center',
    () => [
      { x: 200, y: 200 },
      { x: 100 + innerOffsetX / 2, y: 100 + innerOffsetY / 2 },
    ],
  ],
  [
    5,
    'center',
    'end',
    () => [
      { x: 100, y: 200 },
      { x: 145 + innerOffsetX, y: 100 + innerOffsetY / 2 },
    ],
  ],
  [
    6,
    'end',
    'start',
    () => [
      { x: 300, y: 100 },
      { x: 55, y: 145 + innerOffsetY },
    ],
  ],
  [
    7,
    'end',
    'center',
    () => [
      { x: 200, y: 100 },
      { x: 100 + innerOffsetX / 2, y: 145 + innerOffsetY },
    ],
  ],
  [
    8,
    'end',
    'end',
    () => [
      { x: 100, y: 100 },
      { x: 145 + innerOffsetX, y: 145 + innerOffsetY },
    ],
  ],
  [
    0,
    'nearest',
    'nearest',
    () => [
      { x: 23 + outerOffsetX, y: 23 + outerOffsetY },
      { x: 0, y: 0 },
    ],
  ],
  [
    8,
    'nearest',
    undefined,
    () => [
      { x: 100, y: 100 },
      { x: 145 + innerOffsetX, y: 145 + innerOffsetY },
    ],
  ],
]

test.each(cases)(
  'tile %i: scrollIntoView({block: %s, inline: %s})',
  (target, block, inline, expected) => {
    window.scrollTo(0, 0)
    outerContainer.scrollTop = 0
    outerContainer.scrollLeft = 0
    innerContainer.scrollTop = 0
    innerContainer.scrollLeft = 0
    const tile = tileElements[target]
    if (!tile) {
      throw new Error(`Missing tile ${target}`)
    }
    scrollIntoView(tile, { block, inline })

    const [outer, inner] = expected()
    expectApprox(
      outerContainer.scrollLeft,
      outer.x,
      1,
      'outerContainer.scrollLeft',
    )
    expectApprox(
      outerContainer.scrollTop,
      outer.y,
      1,
      'outerContainer.scrollTop',
    )
    expectApprox(
      innerContainer.scrollLeft,
      inner.x,
      1,
      'innerContainer.scrollLeft',
    )
    expectApprox(
      innerContainer.scrollTop,
      inner.y,
      1,
      'innerContainer.scrollTop',
    )
  },
)
