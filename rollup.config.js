const globals = {}

export default {
  entry: 'dist/index.js',
  dest: 'dist/bundle.js',
  format: 'umd',
  sourceMap: true,
  moduleName: 'scrollIntoViewIfNeeded',
  exports: 'named',
  globals,
  onwarn,
}

function onwarn(message) {
  const suppressed = ['UNRESOLVED_IMPORT', 'THIS_IS_UNDEFINED']

  if (!suppressed.find(code => message.code === code)) {
    return console.warn(message.message)
  }
}
