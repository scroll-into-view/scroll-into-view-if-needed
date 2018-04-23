import parse from 'prettier-browser/src/parser-babylon'
import { printAstToDoc } from 'prettier-browser/src/printer'
import { printDocToString } from 'prettier-browser/src/doc-printer'
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'
import smoothScrollIntoViewIfNeeded from 'smooth-scroll-into-view-if-needed'

export const dimensions = {
  maxWidth: 1220,
}

export function format(code) {
  let opts = {
    cursorOffset: -1,
    rangeStart: 0,
    rangeEnd: Infinity,
    useTabs: false,
    tabWidth: 2,
    printWidth: 60,
    singleQuote: true,
    trailingComma: 'none',
    bracketSpacing: true,
    jsxBracketSameLine: false,
    parser: 'babylon',
    insertPragma: false,
    requirePragma: false,
    semi: true,
    originalText: code,
  }
  const ast = parse(code)
  const doc = printAstToDoc(ast, opts)
  const result = printDocToString(doc, opts)
  return result.formatted
}

export function scrollIntoView(target, defaults) {
  // if the browser implements Element.prototype.scroll there is a chance it supports native smooth scrolling
  const {
    nativeSmooth = 'scrollBehavior' in document.documentElement.style,
    ...options
  } = defaults
  console.log(
    nativeSmooth,
    'scrollBehavior' in document.documentElement.style,
    defaults
  )

  nativeSmooth
    ? scrollIntoViewIfNeeded(target, options)
    : smoothScrollIntoViewIfNeeded(target, options)
}
