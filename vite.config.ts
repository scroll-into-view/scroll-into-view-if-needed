import { defineConfig } from 'vite-plus'

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: [
      // Legacy Cypress/Next.js and vendored web-platform-tests fixtures that are not run
      'tests/integration/**',
      'tests/web-platform/**',
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
    // so the package doesn't need its own TypeScript install. Their maps point at the
    // published src/*.ts files
    dts: { generator: 'oxc', sourcemap: true },
    sourcemap: true,
    minify: true,
    // Keep the "use strict" directive that the previous CommonJS output had
    outputOptions: { strict: true },
  },
})
