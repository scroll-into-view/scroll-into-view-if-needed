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
