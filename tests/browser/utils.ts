import { expect } from 'vite-plus/test'

/**
 * Same check as web-platform-tests' `assert_approx_equals`
 */
export function expectApprox(
  actual: number,
  expected: number,
  epsilon: number,
  description: string,
): void {
  expect(
    Math.abs(actual - expected),
    `${description}: ${actual} should be within ${epsilon} of ${expected}`,
  ).toBeLessThanOrEqual(epsilon)
}

/**
 * Waits until the window stops scrolling: for 500 frames, or until 20 frames
 * pass without a change (from the web-platform-tests smooth scrolling tests)
 */
export function waitForScrollEnd(): Promise<void> {
  let lastChangedFrame = 0
  let lastX = window.scrollX
  let lastY = window.scrollY
  return new Promise((resolve) => {
    const tick = (frames: number) => {
      if (frames >= 500 || frames - lastChangedFrame > 20) {
        resolve()
        return
      }
      if (window.scrollX !== lastX || window.scrollY !== lastY) {
        lastChangedFrame = frames
        lastX = window.scrollX
        lastY = window.scrollY
      }
      requestAnimationFrame(() => tick(frames + 1))
    }
    tick(0)
  })
}

/**
 * Renders the markup and styles of a test page into the test document
 */
export function render(html: string, css: string): void {
  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)
  document.body.innerHTML = html
}

export function getElement(selector: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(selector)
  if (!element) {
    throw new Error(`No element matches ${selector}`)
  }
  return element
}

/**
 * Makes the test document behave like a top-level page.
 *
 * Vitest runs browser tests inside an iframe, and compute-scroll-into-view
 * treats content that overflows its frame as scrollable (`isHiddenByFrame`),
 * so an overflowing `<body>` would get scrolled instead of the window.
 * The web-platform-tests ported here are written for top-level pages.
 */
export function hideFrameElement(): void {
  Object.defineProperty(window, 'frameElement', {
    configurable: true,
    get: () => null,
  })
}
