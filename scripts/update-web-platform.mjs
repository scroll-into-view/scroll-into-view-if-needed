import { readFile, mkdir, writeFile } from 'node:fs/promises'

const root = new URL('../tests/browser/wpt/', import.meta.url)
const manifest = JSON.parse(
  await readFile(new URL('manifest.json', root), 'utf8'),
)
const revision = process.argv[2] || manifest.revision
const files = [
  ...manifest.files.map((file) => [`css/cssom-view/${file}`, file]),
  ['resources/testharness.js', 'resources/testharness.js'],
  ['resources/testharnessreport.js', 'resources/testharnessreport.js'],
  [
    'dom/events/scrolling/scroll_support.js',
    'dom/events/scrolling/scroll_support.js',
  ],
  ['LICENSE.md', 'LICENSE.md'],
]
// Download everything before updating the vendored snapshot.
const downloads = await Promise.all(
  files.map(async ([upstream, local]) => {
    const response = await fetch(
      `https://raw.githubusercontent.com/web-platform-tests/wpt/${revision}/${upstream}`,
    )
    if (!response.ok) throw new Error(`${upstream}: HTTP ${response.status}`)
    return [local, await response.text()]
  }),
)
for (const [local, content] of downloads) {
  const destination = new URL(local, root)
  await mkdir(new URL('.', destination), { recursive: true })
  await writeFile(destination, content)
}
await writeFile(
  new URL('manifest.json', root),
  JSON.stringify({ ...manifest, revision }, null, 2) + '\n',
)
