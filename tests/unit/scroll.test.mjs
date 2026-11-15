import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm'

const source = await readFile(
  new URL('../../dist/index.js', import.meta.url),
  'utf8',
)
const target = { isConnected: true, getClientRects: () => [{}] }
async function setup(actions = []) {
  const calls = []
  const context = createContext({ Promise })
  const dependency = new SyntheticModule(
    ['compute'],
    function () {
      this.setExport('compute', (node, options) => {
        calls.push({ node, options })
        return actions
      })
    },
    { context },
  )
  const module = new SourceTextModule(source, { context })
  await module.link(() => dependency)
  await module.evaluate()
  return { scroll: module.namespace.default, calls }
}
const result = (value) => JSON.parse(JSON.stringify(value))

for (const options of [
  undefined,
  null,
  true,
  {},
  { behavior: 'smooth' },
  { container: 'nearest' },
]) {
  test(`dictionary defaults: ${JSON.stringify(options)}`, async () => {
    const { scroll, calls } = await setup()
    assert.deepEqual(result(await scroll(target, options)), {
      interrupted: false,
    })
    assert.equal(calls[0].options.block, 'start')
    assert.equal(calls[0].options.inline, 'nearest')
  })
}

test('legacy false aligns to the end', async () => {
  const { scroll, calls } = await setup()
  await scroll(target, false)
  assert.equal(calls[0].options.block, 'end')
})

test('computed coordinates are used once without reapplying scroll margins', async () => {
  let received
  const { scroll } = await setup([
    {
      el: {
        scroll: (options) => {
          received = options
        },
      },
      top: 184,
      left: 196,
    },
  ])
  assert.equal(scroll(target, { behavior: 'instant' }), undefined)
  assert.deepEqual(result(received), {
    top: 184,
    left: 196,
    behavior: 'instant',
  })
})

test('native completion waits for all ancestors and aggregates interruption', async () => {
  let finishFirst, finishSecond
  const first = new Promise((resolve) => {
    finishFirst = resolve
  })
  const second = new Promise((resolve) => {
    finishSecond = resolve
  })
  const { scroll } = await setup([
    { el: { scroll: () => first }, top: 100, left: 0 },
    { el: { scroll: () => second }, top: 200, left: 0 },
  ])
  let settled = false
  const completion = scroll(target, { behavior: 'smooth' }).then((value) => {
    settled = true
    return value
  })
  finishFirst({ interrupted: false })
  await Promise.resolve()
  assert.equal(settled, false)
  finishSecond({ interrupted: true })
  assert.deepEqual(result(await completion), { interrupted: true })
})

test('legacy browsers do not receive a premature completion promise', async () => {
  const { scroll } = await setup([{ el: { scroll() {} }, top: 100, left: 0 }])
  assert.equal(scroll(target, { behavior: 'smooth' }), undefined)
})

test('custom behavior preserves synchronous and promise return values', async () => {
  const { scroll } = await setup()
  const promise = Promise.resolve(42)
  assert.equal(scroll(target, { behavior: () => 42 }), 42)
  assert.equal(scroll(target, { behavior: () => promise }), promise)
})

for (const node of [
  { isConnected: false },
  { isConnected: true, getClientRects: () => [] },
]) {
  test(`no-layout target settles standard and custom behavior: ${node.isConnected}`, async () => {
    const { scroll, calls } = await setup()
    assert.deepEqual(result(await scroll(node)), { interrupted: false })
    assert.equal(
      await scroll(node, {
        behavior: (actions) => Promise.resolve(actions.length),
      }),
      0,
    )
    assert.equal(calls.length, 0)
  })
}

test('null behavior options are accepted', async () => {
  const { scroll } = await setup()
  assert.deepEqual(result(await scroll(target, null)), { interrupted: false })
})
