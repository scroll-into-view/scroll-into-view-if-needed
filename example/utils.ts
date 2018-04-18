import parse from 'prettier-browser/src/parser-babylon'
import { printAstToDoc } from 'prettier-browser/src/printer'
import { printDocToString } from 'prettier-browser/src/doc-printer'
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'
import smoothScrollIntoViewIfNeeded from 'scroll-into-view-if-needed/smooth'

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

export function scrollIntoView(
  target,
  defaults: { nativeSmooth?: boolean; [key: string]: any } = {
    nativeSmooth: true,
  }
) {
  const { nativeSmooth = true, ...rest } = defaults
  const options = {
    behavior: 'auto',
    inline: 'nearest',
    block: 'center',
    ...rest,
  }
  // return target.scrollIntoView(options)
  nativeSmooth
    ? // this will use the default export
      scrollIntoViewIfNeeded(target, options as any)
    : // while this will use /smooth
      smoothScrollIntoViewIfNeeded(target, options as any)
  console.log(
    nativeSmooth ? 'native scrolled' : 'pony scrolled',
    target,
    'with',
    options
  )
}
