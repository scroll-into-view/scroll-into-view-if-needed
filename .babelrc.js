const BABEL_ENV = process.env.BABEL_ENV
const building = BABEL_ENV != undefined && BABEL_ENV !== 'cjs'

const plugins = []

if (process.env.NODE_ENV === 'production') {
  plugins.push('dev-expression')
}

if (BABEL_ENV === 'cjs') {
  plugins.push('babel-plugin-add-module-exports')
}

module.exports = {
  comments: false,
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: building ? false : 'commonjs',
      },
    ],
  ],
  plugins: plugins,
}
