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
    // Emit dist/index.js (ESM) and dist/index.cjs (CJS) to match package.json exports.
    // package.json points both conditions at dist/index.d.ts, so skip an unused index.d.cts.
    format: { esm: {}, cjs: { dts: false } },
    platform: 'neutral',
    // The targets @sanity/pkg-utils resolved from the former package.json browserslist query
    // ("> 0.2% and supports es6-module and supports es6-module-dynamic-import and not dead
    // and not IE 11", "maintained node versions")
    target: [
      'chrome109',
      'edge154',
      'firefox157',
      'ios16',
      'safari17',
      'opera136',
      'node22',
    ],
    // Oxc generates the declarations (needs `isolatedDeclarations`, see tsconfig.json),
    // so the package doesn't need its own TypeScript install. Their maps point at the
    // published src/*.ts files
    dts: { generator: 'oxc', sourcemap: true },
    sourcemap: true,
    minify: true,
    // Keep the "use strict" directive that the previous CommonJS output had
    outputOptions: { strict: true },
  },
})
