const withTypescript = require('@zeit/next-typescript')
module.exports = withTypescript({
  assetPrefix: process.env.DOCS ? require('../package.json').homepage : '',
  exportPathMap() {
    return {
      '/': { page: '/' },
    }
  },
  // because of prettier-browser we need an uglifyjs that supports es6 syntax
  webpack: function(config, { dev }) {
    config.plugins = config.plugins.filter(
      p => p.constructor.name !== 'UglifyJsPlugin'
    )

    if (!dev) {
      const Uglify = require('uglifyjs-webpack-plugin')
      config.plugins.push(
        new Uglify({
          parallel: true,
          sourceMap: true,
        })
      )
    }

    return config
  },
  typescriptLoaderOptions: {
    transpileOnly: false,
  },
})
