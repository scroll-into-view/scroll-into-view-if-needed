const wp = require('@cypress/webpack-preprocessor')

module.exports = on => {
  const options = {
    webpackOptions: {
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: [/node_modules/],
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: ['babel-preset-env', 'babel-preset-react'],
                },
              },
            ],
          },
        ],
      },
    },
  }
  on('file:preprocessor', wp(options))
}
