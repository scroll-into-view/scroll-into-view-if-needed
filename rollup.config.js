import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true
    }),

    commonjs({
      // non-CommonJS modules will be ignored, but you can also
      // specifically include/exclude files
      include: 'node_modules/**',  // Default: undefined

      // if false then skip sourceMap generation for CommonJS modules
      sourceMap: false,  // Default: true
    })
  ]
}