import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { after, before, test } from 'node:test'
import puppeteer from 'puppeteer'
const wpt = JSON.parse(
  await readFile(new URL('./wpt/manifest.json', import.meta.url), 'utf8'),
)

let browser, page, server
before(async () => {
  const files = {
    '/ponyfill.js': new URL('../../dist/index.js', import.meta.url),
    '/compute.js':
      process.env.COMPUTE_SCROLL_INTO_VIEW_PATH ||
      new URL(
        '../../node_modules/compute-scroll-into-view/dist/index.js',
        import.meta.url,
      ),
  }
  server = createServer(async (request, response) => {
    if (
      request.url.startsWith('/wpt/') ||
      request.url.startsWith('/resources/') ||
      request.url.startsWith('/dom/')
    ) {
      const path = request.url.replace(/^\/wpt\//, '/').slice(1)
      let body
      try {
        body = await readFile(new URL(`./wpt/${path}`, import.meta.url), 'utf8')
      } catch {
        response.writeHead(404).end()
        return
      }
      if (path.endsWith('.html')) {
        // Keep upstream sources and assertions unchanged on disk. Adapt only
        // scrollIntoView at runtime; scroll/scrollTo/scrollBy remain native.
        body = body.replace(
          '<script>',
          `<script type="importmap">{"imports":{"compute-scroll-into-view":"/compute.js"}}</script><script type="module">
          import scroll from '/ponyfill.js';
          Element.prototype.scrollIntoView = function(options) { return scroll(this, options); };`,
        )
        response.setHeader('Content-Type', 'text/html')
      } else {
        response.setHeader('Content-Type', 'application/javascript')
        if (path === 'resources/testharness.js')
          body += `
          add_completion_callback((tests, status) => {
            window.wptResults = {status: status.status, message: status.message, tests: tests.map(t => ({name:t.name,status:t.status,message:t.message}))};
          });`
      }
      response.end(body)
    } else if (files[request.url]) {
      response.setHeader('Content-Type', 'application/javascript')
      response.end(await readFile(files[request.url]))
    } else {
      response.setHeader('Content-Type', 'text/html')
      response.end(`<!doctype html><style>body{margin:0}</style>
        <script type="importmap">{"imports":{"compute-scroll-into-view":"/compute.js"}}</script>
        <script type="module">import scroll from '/ponyfill.js'; window.ponyfill = scroll;</script>`)
    }
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: process.env.PUPPETEER_NO_SANDBOX ? ['--no-sandbox'] : [],
  })
  page = await browser.newPage()
  await page.goto(`http://127.0.0.1:${server.address().port}`)
  await page.waitForFunction('window.ponyfill')
})
after(async () => {
  await browser?.close()
  if (server) await new Promise((resolve) => server.close(resolve))
})

async function fixture() {
  await page.evaluate(() => {
    document.body.innerHTML = `<div id="scroller" style="width:200px;height:200px;overflow:scroll">
      <div style="width:800px;height:800px"><div id="target" style="position:relative;top:300px;left:300px;width:50px;height:50px;scroll-margin:4px 8px 12px 16px"></div></div></div>`
  })
}

test('real browser applies scroll margins once for start and end', async () => {
  for (const block of ['start', 'end']) {
    await fixture()
    const result = await page.evaluate((block) => {
      const target = document.getElementById('target')
      const scroller = document.getElementById('scroller')
      target.scrollIntoView({ block, inline: block, behavior: 'instant' })
      const expected = [scroller.scrollTop, scroller.scrollLeft]
      scroller.scrollTo(0, 0)
      window.ponyfill(target, { block, inline: block, behavior: 'instant' })
      return { expected, actual: [scroller.scrollTop, scroller.scrollLeft] }
    }, block)
    assert.deepEqual(result.actual, result.expected)
  }
})

test('native smooth completion is preserved on supporting browsers', async (t) => {
  await fixture()
  const supported = await page.evaluate(() => {
    const completion = document
      .getElementById('scroller')
      .scroll({ top: 0, behavior: 'instant' })
    return !!completion && typeof completion.then === 'function'
  })
  if (!supported) return t.skip('This browser returns void from Element.scroll')
  const result = await page.evaluate(async () => {
    const target = document.getElementById('target')
    const scroller = document.getElementById('scroller')
    const completion = window.ponyfill(target, {
      block: 'start',
      inline: 'start',
      behavior: 'smooth',
    })
    const initial = scroller.scrollTop
    const result = await completion
    return {
      initial,
      top: scroller.scrollTop,
      left: scroller.scrollLeft,
      result,
    }
  })
  assert.ok(result.initial < 296)
  assert.equal(result.top, 296)
  assert.equal(result.left, 284)
  assert.deepEqual(result.result, { interrupted: false })
})

test('a new native scroll reports interruption', async (t) => {
  await fixture()
  const result = await page.evaluate(async () => {
    const scroller = document.getElementById('scroller')
    const completion = window.ponyfill(document.getElementById('target'), {
      block: 'start',
      behavior: 'smooth',
    })
    if (!completion) return null
    scroller.scroll({ top: 0, left: 0, behavior: 'instant' })
    return await completion
  })
  if (!result) return t.skip('This browser returns void from Element.scroll')
  assert.deepEqual(result, { interrupted: true })
})

test('focus remains native and can opt out of scrolling', async () => {
  await fixture()
  const result = await page.evaluate(() => {
    const target = document.getElementById('target')
    const scroller = document.getElementById('scroller')
    target.tabIndex = 0
    const value = target.focus({ preventScroll: true })
    return {
      focused: document.activeElement === target,
      top: scroller.scrollTop,
      returnsUndefined: value === undefined,
    }
  })
  assert.deepEqual(result, { focused: true, top: 0, returnsUndefined: true })
})

for (const file of wpt.files) {
  test(`upstream WPT: ${file}`, { timeout: 60000 }, async (t) => {
    const supported = await page.evaluate(() => {
      const completion = document.documentElement.scroll({
        top: 0,
        behavior: 'instant',
      })
      return !!completion && typeof completion.then === 'function'
    })
    if (!supported) return t.skip('Native scroll promises are not supported')
    await page.goto(`http://127.0.0.1:${server.address().port}/wpt/${file}`)
    await page.waitForFunction('window.wptResults !== undefined', {
      timeout: 55000,
    })
    const results = await page.evaluate(() => window.wptResults)
    assert.equal(results.status, 0, JSON.stringify(results))
    assert.ok(results.tests.length > 0)
    const relevant = results.tests.filter((test) =>
      test.name.includes('scrollIntoView'),
    )
    assert.ok(relevant.length > 0)
    assert.deepEqual(
      relevant.filter((test) => test.status !== 0),
      [],
    )
    t.diagnostic(`${relevant.length} upstream scrollIntoView assertions passed`)
    const nativeFailures = results.tests.filter(
      (test) => !test.name.includes('scrollIntoView') && test.status !== 0,
    )
    if (nativeFailures.length)
      t.diagnostic(`Unmodified native APIs: ${JSON.stringify(nativeFailures)}`)
  })
}

test(
  'coordinated engine: container and combined CSS spacing',
  {
    skip: !process.env.COMPUTE_SCROLL_INTO_VIEW_PATH,
  },
  async () => {
    await page.goto(`http://127.0.0.1:${server.address().port}`)
    await page.waitForFunction('window.ponyfill')
    const results = await page.evaluate(async () => {
      document.body.innerHTML = `<div id="outer" style="width:200px;height:200px;overflow:auto"><div style="height:400px"></div><div id="inner" style="width:200px;height:200px;overflow:auto;scroll-padding:4px 8px 12px 16px"><div style="width:800px;height:800px"><div id="target" style="position:relative;top:300px;left:300px;width:80px;height:60px;scroll-margin:4px 8px 12px 16px"></div></div></div></div>`
      const inner = document.getElementById('inner')
      const outer = document.getElementById('outer')
      const target = document.getElementById('target')
      const options = {
        block: 'center',
        inline: 'center',
        container: 'nearest',
        behavior: 'instant',
      }
      target.scrollIntoView(options)
      const expected = [inner.scrollTop, inner.scrollLeft, outer.scrollTop]
      inner.scrollTo(0, 0)
      outer.scrollTo(0, 0)
      await window.ponyfill(target, options)
      return {
        expected,
        actual: [inner.scrollTop, inner.scrollLeft, outer.scrollTop],
      }
    })
    assert.deepEqual(results.actual, results.expected)
    assert.equal(results.actual[2], 0)
  },
)
