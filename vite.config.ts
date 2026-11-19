import browserslist from 'browserslist'
import { defineConfig } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'

// tsdown doesn't read the `browserslist` field in package.json, so it gets the oldest version of each browser
// that the field resolves to, in the esbuild-style target format
const esbuildNames: Record<string, string> = {
  and_chr: 'chrome',
  and_ff: 'firefox',
  chrome: 'chrome',
  edge: 'edge',
  firefox: 'firefox',
  ios_saf: 'ios',
  opera: 'opera',
  safari: 'safari',
}
const oldest = new Map<string, number>()
for (const entry of browserslist()) {
  const [name, version] = entry.split(' ')
  const esbuildName = esbuildNames[name]
  if (!esbuildName) {
    throw new Error(`Map the browserslist name "${name}" to a tsdown target`)
  }
  // Ranges like "13.0-13.1" start with their oldest version
  const number = parseFloat(version)
  if (number < (oldest.get(esbuildName) ?? Infinity)) {
    oldest.set(esbuildName, number)
  }
}
const target = [...oldest].map(([name, version]) => `${name}${version}`)

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    // Listing plugins replaces Oxlint's defaults (eslint, typescript, unicorn, oxc), so they're repeated here
    plugins: [
      'eslint',
      'typescript',
      'unicorn',
      'oxc',
      'import',
      'promise',
      'vitest',
      'jsdoc',
    ],
    // Whole categories, so rules that new Vite+/Oxlint releases add to them apply automatically
    categories: { correctness: 'error', suspicious: 'error', perf: 'error' },
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
      'typescript/switch-exhaustiveness-check': 'error',
      // The ported web-platform-tests assert through `expectApprox` (tests/browser/utils.ts)
      'vitest/expect-expect': [
        'error',
        { assertFunctionNames: ['expect', 'expectApprox'] },
      ],
    },
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    coverage: {
      // Istanbul instruments the code, so the unit (Node.js) and browser (Chromium)
      // projects' results merge reliably
      provider: 'istanbul',
      include: ['src/**'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'jsdom',
        },
      },
      {
        test: {
          name: 'browser',
          include: ['tests/browser/**/*.test.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
            // A desktop-sized window, which the ported web-platform-tests assume
            // (e.g. "nearest" for an element smaller than the viewport)
            viewport: { width: 800, height: 600 },
          },
        },
      },
    ],
  },
  fmt: {
    semi: false,
    singleQuote: true,
    printWidth: 80,
    sortPackageJson: false,
    ignorePatterns: [],
  },
  pack: {
    entry: ['src/index.ts', 'src/middleware.ts'],
    format: 'esm',
    platform: 'neutral',
    // The browserslist baseline in package.json (Baseline 2019) keeps the published bundles compiling away
    // optional chaining and nullish coalescing for Webpack 4 and other older toolchains
    // (scroll-into-view/scroll-into-view-if-needed#1235). Its oldest browser, Edge 18, supports ES2017 syntax but not
    // object rest/spread or optional catch binding, so `vp run check:es` runs `es-check es2017` to enforce it.
    // es-check's checkBrowser mode can't be used instead, as it treats Edge 18 as ES5
    target,
    // Oxc generates the declarations (needs `isolatedDeclarations`, see tsconfig.json),
    // so the package doesn't need its own TypeScript install. No declaration maps, as `src` isn't published
    dts: { generator: 'oxc', sourcemap: false },
    // Embeds the TypeScript source in its sourcesContent
    sourcemap: true,
    minify: true,
    // tsdown writes `exports`, plus `main`, `module` and `types` for tools that predate `exports`
    exports: { legacy: true },
    // Fail the build on package.json/exports and type-resolution problems
    publint: true,
    attw: { profile: 'esm-only' },
  },
})
