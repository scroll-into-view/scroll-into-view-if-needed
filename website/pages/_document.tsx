import Document, { Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

const { description } = require('scroll-into-view-if-needed/package.json')
const { version } = require('codemirror/package.json')

export default class MyDocument extends Document {
  static getInitialProps({ renderPage }) {
    const sheet = new ServerStyleSheet()
    const page = renderPage(App => props =>
      sheet.collectStyles(<App {...props} />)
    )
    const styleTags = sheet.getStyleElement()
    return { ...page, styleTags }
  }

  render() {
    return (
      <html>
        <Head>
          <title>{description}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta property="og:description" content={description} />
          <meta name="description" content={description} />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.0/css/bulma.min.css"
          />
          <link
            rel="stylesheet"
            href={`//cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/codemirror.min.css`}
          />
          <link
            rel="stylesheet"
            href={`//cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/theme/panda-syntax.min.css`}
          />
          {this.props.styleTags}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
