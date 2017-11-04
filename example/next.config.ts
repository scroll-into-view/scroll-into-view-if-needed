module.exports = {
  assetPrefix: process.env.DOCS ? require('../package.json').homepage : '',
  exportPathMap() {
    return {
      '/': { page: '/' },
    }
  },
}
