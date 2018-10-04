import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'

const config = {
  input: 'src/index.ts',
  output: {
    name: 'scrollIntoView',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      extensions: ['.ts', '.js'],
    }),
    resolve({
      extensions: ['.ts', '.js', '.json'],
    }),
    commonjs({
      include: /node_modules/,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(terser())
}

export default config
