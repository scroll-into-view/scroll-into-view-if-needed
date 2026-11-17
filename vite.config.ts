import { defineConfig } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'

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
    entry: ['src/index.ts'],
    format: 'esm',
    platform: 'neutral',
    // ES2019 output so Webpack 4 and other older toolchains can parse the published bundles
    // (scroll-into-view/scroll-into-view-if-needed#1235). `vp run check:es` enforces this.
    target: [
      'chrome79',
      'edge79',
      'firefox72',
      'ios13',
      'safari13',
      'opera66',
      'node12',
    ],
    // Oxc generates the declarations (needs `isolatedDeclarations`, see tsconfig.json),
    // so the package doesn't need its own TypeScript install. No declaration maps, as `src` isn't published
    dts: { generator: 'oxc', sourcemap: false },
    sourcemap: true,
    minify: true,
    // tsdown writes `exports`, plus `main`, `module` and `types` for tools that predate `exports`
    exports: { legacy: true },
    // Fail the build on package.json/exports and type-resolution problems
    publint: true,
    attw: { profile: 'esm-only' },
  },
})
