import parse from 'prettier-browser/src/parser-babylon'
import { printAstToDoc } from 'prettier-browser/src/printer'
import { printDocToString } from 'prettier-browser/src/doc-printer'
import scrollIntoViewIfNeeded, {
  ponyfill as smoothScrollIntoViewIfNeeded,
  Options,
} from '../src'

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

interface CustomOptions extends Options {
  nativeSmooth?: boolean
}

export function scrollIntoView(target, defaults: CustomOptions) {
  // if the browser implements Element.prototype.scroll there is a chance it supports native smooth scrolling
  const {
    nativeSmooth = 'scrollBehavior' in document.documentElement.style,
    ...rest,
  } = defaults
  console.log(
    nativeSmooth,
    'scrollBehavior' in document.documentElement.style,
    defaults
  )
  const options = {
    behavior: 'auto',
    inline: 'nearest',
    block: 'center',
    ...rest,
  }

  nativeSmooth
    ? // this will use the default export
      scrollIntoViewIfNeeded(target, options as any)
    : // while this will use /ponyfill
      smoothScrollIntoViewIfNeeded(target, options as any)
}
