import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
const globals = {}

export default {
  entry: 'dist/index.js',
  dest: 'dist/bundle.js',
  format: 'umd',
  moduleName: 'scrollIntoViewIfNeeded',
  exports: 'named',
  globals,
  onwarn,
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true,
    }),

    commonjs({
      // non-CommonJS modules will be ignored, but you can also
      // specifically include/exclude files
      include: 'node_modules/**', // Default: undefined

      // if false then skip sourceMap generation for CommonJS modules
      sourceMap: false, // Default: true
    }),
  ],
}

function onwarn(message) {
  const suppressed = ['UNRESOLVED_IMPORT', 'THIS_IS_UNDEFINED']

  if (!suppressed.find(code => message.code === code)) {
    return console.warn(message.message)
  }
}
