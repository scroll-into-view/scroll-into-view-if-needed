# scroll-into-view-if-needed

## 4.0.0

### Major Changes

- [#1234](https://github.com/scroll-into-view/scroll-into-view-if-needed/pull/1234) [`103a823`](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/103a8233728246c4b50c32998ae7e731facbf81b) Thanks [@tembo](https://github.com/apps/tembo)! - Ship ESM only.
  
  - The CommonJS build (`dist/index.cjs`) is removed. CommonJS code can still `require()` the package on Node.js 20.19, 22.12 and later, through `require(esm)`. That returns the module namespace, so use `require('scroll-into-view-if-needed').default`.
  - `exports` now maps `.` straight to `dist/index.js`, with its `dist/index.d.ts` declarations. For tools that don't read `exports`, `main`, `module` and `types` point at the same files.
  - The `source` export condition and the `source` and `typings` fields are removed.

- [#1253](https://github.com/scroll-into-view/scroll-into-view-if-needed/pull/1253) [`92cb200`](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/92cb2009498dd13634bddee6c8d11a9d381b8daa) Thanks [@stipsan](https://github.com/stipsan)! - Remove `behavior: Function`, and the `boundary` and `skipOverflowHiddenElements` options.
  
  - `behavior` is `'auto'`, `'smooth'` or `'instant'`, like `Element.scrollIntoView()`, and `scrollIntoView()` always returns `undefined`. The `CustomBehaviorOptions` and `CustomScrollBehaviorCallback` types are removed, `Options` is no longer generic, and `scrollIntoView` no longer takes a type argument. To do the scrolling yourself, call `compute()` from `compute-scroll-into-view` and apply the actions it returns.
  - `boundary` is removed. Use `container: 'nearest'` to scroll only the nearest scroll container, or the `boundary()` middleware from `scroll-into-view-if-needed/middleware` to stop further out.
  - `skipOverflowHiddenElements` is removed. Use the `skipOverflowHiddenElements()` middleware from `scroll-into-view-if-needed/middleware`.
  
  ```diff
  -import scrollIntoView from 'scroll-into-view-if-needed'
  +import { compute } from 'compute-scroll-into-view'
  +import { onlyIfNeeded } from 'compute-scroll-into-view/middleware'
  
  -scrollIntoView(node, {
  -  block: 'nearest',
  -  scroll: 'if-needed',
  -  behavior: (actions) =>
  -    actions.forEach(({ el, top, left }) => {
  -      el.scrollTop = top
  -      el.scrollLeft = left
  -    }),
  -})
  +if (node.isConnected) {
  +  compute(node, { block: 'nearest', middleware: [onlyIfNeeded()] }).forEach(
  +    ({ el, top, left }) => {
  +      el.scrollTop = top
  +      el.scrollLeft = left
  +    },
  +  )
  +}
  ```
  
  ```diff
  +import { skipOverflowHiddenElements } from 'scroll-into-view-if-needed/middleware'
  -scrollIntoView(node, { boundary: list, skipOverflowHiddenElements: true })
  +scrollIntoView(node, {
  +  container: 'nearest',
  +  middleware: [skipOverflowHiddenElements()],
  +})
  ```

- [#1241](https://github.com/scroll-into-view/scroll-into-view-if-needed/pull/1241) [`bbcb7e6`](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/bbcb7e64077422a2dce242807239a2436d8241ee) Thanks [@stipsan](https://github.com/stipsan)! - `scroll: 'if-needed'` scrolls only when the target isn't fully visible. `scrollMode` still does the same thing, but it is deprecated and will be removed in the next major version. Use `scroll` instead. When both are set, `scroll` is used.
  
  ```diff
  -scrollIntoView(target, { scrollMode: 'if-needed' })
  +scrollIntoView(target, { scroll: 'if-needed' })
  ```
  
  `selection()` from `scroll-into-view-if-needed/middleware` scrolls a text range instead of the element, which is how an editor keeps the caret in view. `middleware` runs before `onlyIfNeeded()`, which `scroll: 'if-needed'` adds last:
  
  ```ts
  import scrollIntoView from 'scroll-into-view-if-needed'
  import { selection } from 'scroll-into-view-if-needed/middleware'
  
  scrollIntoView(node, {
    block: 'nearest',
    scroll: 'if-needed',
    middleware: [selection(range)],
  })
  ```
  
  ### Features
  
  - `container: 'nearest'` scrolls only the target's nearest scroll container, or the viewport when it has none. The default, `'all'`, scrolls every scroll container, as before.
  
  ### Fixes
  
  Scrolling now follows `Element.scrollIntoView()`:
  
  - `scroll-padding` on a scroll container, and on the root element for the viewport, is part of the alignment. Percentage values are supported.
  - The target's `scroll-margin` works with `block: 'center'` and `'nearest'`, and together with `scroll-padding`.
  - `scroll: 'if-needed'` treats a target as visible only when its `scroll-margin` box is inside the `scroll-padding`. A target behind a fixed header covered by `scroll-padding-top` is scrolled into view.
  - `nearest` is measured from the padding edge of a scroll container that has borders.
  - `block` and `inline` follow the target's `writing-mode` and `direction`. For example, `inline: 'start'` aligns a right-to-left target to its right edge, and `block: 'start'` aligns a `vertical-rl` target to its right edge. Horizontal left-to-right targets are unchanged.
  - Scroll containers that overflow to the left or the top use the negative `left` and `top` offsets browsers use, and a scrollbar on the left is accounted for.
  - A target in a same-origin iframe also scrolls the parent document, up to the top-level page. Cross-origin parents are left alone. A `position: fixed` target inside a frame scrolls only the parent document.
  - In a scroll snap container, the target lands on its own snap position, and outer scroll containers align it from there.
  - The document body is scrolled when it is the scroll container, including when the root element's overflow is not `visible`.
  - `overflow: visible` elements inside an iframe are no longer scrolled. Only the frame's viewport is.
  - Only scroll containers in the target's containing block chain are scrolled. An absolutely or fixed positioned target no longer moves ancestors it isn't laid out in, and the viewport is not scrolled for a fixed target.
  - The viewport is scrolled when the target is the scrolling element, or the root element in quirks mode.
  - A slotted target also scrolls the scroll containers in the shadow tree it is laid out in.
  - A target inside a frame is measured against that frame's viewport, including when the scroll is started from the parent document.

### Patch Changes

- [#1240](https://github.com/scroll-into-view/scroll-into-view-if-needed/pull/1240) [`18ba72b`](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/18ba72b9e1050beba8e2c188acbf399417f4330a) Thanks [@stipsan](https://github.com/stipsan)! - Declare the supported browsers as [Baseline 2019](https://web.dev/baseline) in the `browserslist` field of `package.json`, and build for it. The bundle stays free of optional chaining and nullish coalescing, and is now checked against ES2017, the syntax level of legacy Edge 18. `src/` and `dist/index.d.ts.map` are no longer published. `dist/index.js.map` still embeds the source.

- [#1225](https://github.com/scroll-into-view/scroll-into-view-if-needed/pull/1225) [`fe3906e`](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/fe3906ece61c64dbb5d01dc4e36ebb437a721168) Thanks [@stipsan](https://github.com/stipsan)! - Build with Vite+ (tsdown and Rolldown) instead of `@sanity/pkg-utils`. The entry points, `exports`, and public types are unchanged.

- [#1249](https://github.com/scroll-into-view/scroll-into-view-if-needed/pull/1249) [`5b60717`](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/5b607172fd2b76a5a9e4e129eaa100b8a76b431a) Thanks [@stipsan](https://github.com/stipsan)! - `dist/index.d.ts` keeps the `//# sourceMappingURL=index.d.ts.map` comment Rolldown appends. The declaration map is still not published, and the public types are unchanged.

- [#1232](https://github.com/scroll-into-view/scroll-into-view-if-needed/pull/1232) [`67049e6`](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/67049e6fe45f0054652b8c2f648beb37eb817103) Thanks [@tembo](https://github.com/apps/tembo)! - Fix the documented default of the `behavior` option in the type declarations (`@default 'auto'`).

- [#1233](https://github.com/scroll-into-view/scroll-into-view-if-needed/pull/1233) [`53cf8aa`](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/53cf8aae36e8fced81bb1871bf098d14adf9636b) Thanks [@tembo](https://github.com/apps/tembo)! - Stop applying the target's `scroll-margin` twice. compute-scroll-into-view 3.1+ already accounts for it, so elements with a scroll margin ended up offset by double the margin.

- [#1233](https://github.com/scroll-into-view/scroll-into-view-if-needed/pull/1233) [`53cf8aa`](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/53cf8aae36e8fced81bb1871bf098d14adf9636b) Thanks [@tembo](https://github.com/apps/tembo)! - Fix `scrollIntoView(target, null)` throwing a TypeError. Like the web platform tests expect, `null` now uses the default alignment (`block: 'start'`, `inline: 'nearest'`), the same as omitting the options.

- [#1252](https://github.com/scroll-into-view/scroll-into-view-if-needed/pull/1252) [`f45752b`](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/f45752baef21be7caa5a9e88078b41f4bb5309ce) Thanks [@feritcemkahraman](https://github.com/feritcemkahraman)! - Scroll a target that is connected to another document, such as an iframe, including that document's open and closed shadow trees. The connection check uses the target's owner document. A target in a detached shadow tree still does nothing.

- [#1228](https://github.com/scroll-into-view/scroll-into-view-if-needed/pull/1228) [`6bfa3f2`](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/6bfa3f275ec6fef79acd72e40b1155ff5f0afcee) Thanks [@tembo](https://github.com/apps/tembo)! - Stop publishing the unused `src/types.ts` file. Nothing imported it, and the package's types are unchanged.

## 3.2.1

### Patch Changes

- [#1236](https://github.com/scroll-into-view/scroll-into-view-if-needed/pull/1236) [`75c3a8f`](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/75c3a8ff16f3c7752eddfc810ffdb46fc107d099) Thanks [@tembo](https://github.com/apps/tembo)! - Require `compute-scroll-into-view@^3.2.2`, which includes the same `engines` and ES2019 fixes

- [#1236](https://github.com/scroll-into-view/scroll-into-view-if-needed/pull/1236) [`75c3a8f`](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/75c3a8ff16f3c7752eddfc810ffdb46fc107d099) Thanks [@tembo](https://github.com/apps/tembo)! - Compile the published bundles to ES2019 syntax again. The previous release shipped optional chaining (`?.`) and nullish coalescing (`??`) because the browserslist targets drifted, which broke Webpack 4 and other older toolchains ([scroll-into-view-if-needed#1235](https://github.com/scroll-into-view/scroll-into-view-if-needed/issues/1235)). The build targets are now pinned and the build fails if the output isn't ES2019-compatible.

- [#1236](https://github.com/scroll-into-view/scroll-into-view-if-needed/pull/1236) [`75c3a8f`](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/75c3a8ff16f3c7752eddfc810ffdb46fc107d099) Thanks [@tembo](https://github.com/apps/tembo)! - Remove the `engines.node` requirement added in the previous release. Requiring Node.js 26 was unintentionally breaking for consumers on older Node.js versions, and as a browser library this package has no Node.js runtime requirement ([compute-scroll-into-view#928](https://github.com/scroll-into-view/compute-scroll-into-view/issues/928))

## 3.2.0

### Minor Changes

- [#1221](https://github.com/scroll-into-view/scroll-into-view-if-needed/pull/1221) [`ce383fc`](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/ce383fccbd5b469dbf13c68f93b769c419ddcde4) Thanks [@stipsan](https://github.com/stipsan)! - Require Node.js 26 (current LTS) or later, and publish to npm with trusted publishing (OIDC) and provenance

## [3.1.0](https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v3.0.10...v3.1.0) (2023-09-13)

### Features

- account for scroll margin ([#1197](https://github.com/scroll-into-view/scroll-into-view-if-needed/issues/1197)) ([1c8a3cc](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/1c8a3ccdb0d85584b918d3c78eea847d7f84c2aa))

## [3.0.10](https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v3.0.9...v3.0.10) (2023-04-10)

### Bug Fixes

- use const replace let ([#1180](https://github.com/scroll-into-view/scroll-into-view-if-needed/issues/1180)) ([0f00c8b](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/0f00c8b9d4ff05bbce58d99b4ebbe573d5ff4826))

## [3.0.9](https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v3.0.8...v3.0.9) (2023-04-09)

### Bug Fixes

- revert package.json [#1176](https://github.com/scroll-into-view/scroll-into-view-if-needed/issues/1176) ([#1183](https://github.com/scroll-into-view/scroll-into-view-if-needed/issues/1183)) ([03dca46](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/03dca46fa7c79c535be645579f20cf7a4cdeb0e4))

## [3.0.8](https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v3.0.7...v3.0.8) (2023-04-08)

### Bug Fixes

- support `—moduleResolution node16` in `compute-scroll-into-view` ([#1176](https://github.com/scroll-into-view/scroll-into-view-if-needed/issues/1176)) ([2027698](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/2027698131ddfa9e803d0596f78ff3dcf4bd945d))

## [3.0.7](https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v3.0.6...v3.0.7) (2023-04-06)

### Bug Fixes

- support `—moduleResolution node16` ([d9053bb](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/d9053bb1fcf4c1aa65ae8391e106b6a4d7dc801b)), closes [#1163](https://github.com/scroll-into-view/scroll-into-view-if-needed/issues/1163)

## [3.0.6](https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v3.0.5...v3.0.6) (2023-02-14)

### Bug Fixes

- **deps:** update dependency compute-scroll-into-view to v3 ([#1157](https://github.com/scroll-into-view/scroll-into-view-if-needed/issues/1157)) ([d4c36d6](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/d4c36d6bccd3432701085638a0978e3a01303095))

## [3.0.5](https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v3.0.4...v3.0.5) (2023-02-14)

### Bug Fixes

- always use `el.scroll()` ([6472ede](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/6472edebda21931add5776c04d4e8e1fb0d63947))

## [3.0.4](https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v3.0.3...v3.0.4) (2023-01-08)

### Bug Fixes

- **deps:** update dependencies (non-major) ([#1136](https://github.com/scroll-into-view/scroll-into-view-if-needed/issues/1136)) ([a72d093](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/a72d093f572f5b2fa8d5151aba0bf2dfa27575ad))
- **deps:** update dependency compute-scroll-into-view to ^2.0.4 ([#1145](https://github.com/scroll-into-view/scroll-into-view-if-needed/issues/1145)) ([b839598](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/b8395988770dc06016c0ea6a67a68d7f4746c2d2))

## [3.0.3](https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v3.0.2...v3.0.3) (2022-12-01)

### Bug Fixes

- make the generic param optional ([1bc73d3](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/1bc73d3b849b985c52b796fae3bf727c7d6386ef))

## [3.0.2](https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v3.0.1...v3.0.2) (2022-12-01)

### Bug Fixes

- **deps:** update dependency compute-scroll-into-view to ^2.0.2 ([#1126](https://github.com/scroll-into-view/scroll-into-view-if-needed/issues/1126)) ([275d193](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/275d193614fb8e6ffc6986361ca6e1b22b06f1f6))
- improve typings, reduce bundlesize ([2166404](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/216640426acb0844613b44a025ecc51003a9ba4d))

## [3.0.1](https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v3.0.0...v3.0.1) (2022-12-01)

### Bug Fixes

- **docs:** show correct bundlesizes ([871c02a](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/871c02ae048c87c3fba02d77ee21c26fdae87cc5))

## [3.0.0](https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v2.2.31...v3.0.0) (2022-12-01)

### ⚠ BREAKING CHANGES

- drops umd builds, and ships more modern syntax with ESM as baseline

### Bug Fixes

- **deps:** update dependency compute-scroll-into-view to v2 ([#1119](https://github.com/scroll-into-view/scroll-into-view-if-needed/issues/1119)) ([40ccca2](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/40ccca28236feec1453e52e4b9e3e6b28d8d9547))
- support node ESM ([#1120](https://github.com/scroll-into-view/scroll-into-view-if-needed/issues/1120)) ([8f48307](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/8f48307c364dfccd2f9cfb3a36dcb3120c07fc08))

## [2.2.31](https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v2.2.30...v2.2.31) (2022-11-29)

### Bug Fixes

- add `pkg.exports` ([e81272f](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/e81272f6b2287a1ace51be932120f497b00aebe7))

## [2.2.30](https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v2.2.29...v2.2.30) (2022-11-29)

### Bug Fixes

- bump `compute-scroll-into-view` ([b7c235b](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/b7c235bee5fde82f7ee7e8d5b0da28c2fbed580c))
- setup improved semantic-release ([7a68079](https://github.com/scroll-into-view/scroll-into-view-if-needed/commit/7a6807940dc18aeb28810acac4f26d4955be6816))

## [1.6.0]

### Added

- Support for `behavior`, `block` and `inline` options, from [the spec](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView).
- `scrollMode: "if-needed" | "always"` to control the `if-needed` behavior, based on [the csswg proposal to the spec](https://github.com/w3c/csswg-drafts/pull/1805).

### Removed

- `centerIfNeeded`, use `scrollMode: "if-needed", block: "center"` instead.
- `duration` to trigger animation, use [`smooth-scroll-into-view-if-needed`](https://github.com/scroll-into-view/smooth-scroll-into-view-if-needed) instead.
- `handleScroll(parent, {scrollLeft, scrollTop}, options)`, use `behavior: function(actions)` instead, where `actions` is an array of `{el, top, left}` allowing you to scroll everything in parallel or in a sequence, it's up to you.
- `offset`, use wrapper elements and CSS like padding or margins instead.

## [1.5.0] - 2018-02-25

### Added

- `sideEffects: false` in package.json to enable optimizations introduced in webpack v4.

## [1.4.0] - 2017-11-17

### Added

- New `handleScroll` option allows customizing scrolling behavior.

### Changed

- Animation logic is separated from scroll calculation logic. This allows skip
  importing animation dependencies and reduces bundle sizes when you don't need
  the built in animation feature.

## [1.3.0] - 2017-11-12

### Added

- New API interface (#148 @tonybdesign)

## [1.2.8] - 2017-11-05

### Fixed

- Missing TypeScript definitions and rollup/webpack pkg.module files from
  published package (#145)

## [1.2.7] - 2017-11-05

### Fixed

- Package published on npm contained unnecessary files bloating the package
  (#144)

## [1.2.6] - 2017-11-05

### Fixed

- Don't use postinstall as it runs in userland (#143)

## [1.2.5] - 2017-11-05

### Fixed

- Migrate tests to
  [new page](https://stipsan.github.io/scroll-into-view-if-needed/) that
  showcases how it works (#141)

## [1.2.4] - 2017-11-05

### Fixed

- TypeScript requires HTMLElement when it should accept Element (#140)

## [1.2.3] - 2017-11-04

### Fixed

- Incorrect TypeScript declarations and export format (#136)

## [1.2.2] - 2017-10-29

### Fixed

- Incorrect export declaration in TS typings (#132)

## [1.2.1] - 2017-10-02

### Fixed

- Fifth option should be optional (#129)

## [1.2.0] - 2017-10-01

### Added

- Set offset feature (#127 @iwangulenko)

## [1.1.1] - 2017-10-01

### Fixed

- Windows compatibility and CommonJS interop change back to Babel 5
  functionality (#121 @khell)

## [1.1.0] - 2017-03-29

### Added

- An optional argument finalElement was added to limit the scope of the function
  (#108 @hemnstill)

## [1.0.7] - 2017-03-14

### Added

- MIT License (#107 @JKillian)

### Changed

- Reduced size of dist build by switching from rollup to babel (#106 @JKillian)

## [1.0.6] - 2016-11-17

### Changed

- Updated typescript definition making options optional (#75 @pelotom)

## [1.0.5] - 2016-11-12

### Fixed

- Fix TypeScript definition file issues (#74 @forabi)

### Documentation

- React example snippet in readme.

## [1.0.4] - 2016-10-31

### Added

- Changelog readme.
- TypeScript definition file (#73 @forabi)

## 1.0.3 - 2016-09-30

### Documentation

- link to official ponyfill page (#68 @sindresorhus)

## 1.0.2 - 2016-04-18

### Added

- Greenkeeper

### Fixes

- Incomatibility with default webpack config.

## 1.0.1 - 2016-04-18

- PULLED: accidentally pushed incomplete build to npm!

## 1.0.0 - 2016-04-18

### Added

- Initial release.

[unreleased]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.5.0...HEAD
[1.5.0]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.2.8...v1.3.0
[1.2.8]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.2.7...v1.2.8
[1.2.7]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.2.6...v1.2.7
[1.2.6]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.2.5...v1.2.6
[1.2.5]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.2.4...v1.2.5
[1.2.4]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.0.7...v1.1.0
[1.0.7]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/scroll-into-view/scroll-into-view-if-needed/compare/v1.0.3...v1.0.4
