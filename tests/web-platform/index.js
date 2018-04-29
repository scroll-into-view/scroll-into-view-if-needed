const micro = require('micro')
const { resolve, parse, URL } = require('url')
const fetch = require('node-fetch')
const replaceStream = require('replacestream')
const fs = require('fs')
const path = require('path')

const base = 'https://raw.githubusercontent.com/w3c/web-platform-tests/master'
const map = {
  '/': {
    dest: `${base}/css/cssom-view/scrollintoview.html`,
    type: 'text/html',
  },
  '/smooth': {
    dest: `${base}/css/cssom-view/scrollIntoView-smooth.html`,
    type: 'text/html',
  },
  '/resources/testharness.js': {
    dest: `${base}/resources/testharness.js`,
    type: 'text/javascript',
  },
  '/resources/testharnessreport.js': {
    dest: `${base}/resources/testharnessreport.js`,
    type: 'text/javascript',
  },
  '/resources/testharness.css': {
    dest: `${base}/resources/testharness.css`,
    type: 'text/css',
  },
}

const umdFile = require.resolve(
  'scroll-into-view-if-needed/umd/scroll-into-view-if-needed.js'
)

async function proxyRequest(req, res, dest, type) {
  const url = new URL(dest)
  const proxyRes = await fetch(url, {
    method: req.method,
    headers: Object.assign({}, req.headers, { host: url.host }),
    compress: true,
  })

  // Forward status code
  res.statusCode = proxyRes.status

  // Override content-type
  res.setHeader('content-type', type)

  // Handle the html case, apply a few overrides so the ponyfill is used intsead of the native api
  if (req.url === '/') {
    const hook = '<meta name="flags" content="dom">'
    //const script = 'https://unpkg.com/scroll-into-view-if-needed@2.0.0/umd/scroll-into-view-if-needed.min.js'
    const script = '/umd.js'

    proxyRes.body
      .pipe(
        replaceStream(hook, hook + '\n<script src=' + script + '></script>', {
          limit: 1,
        })
      )
      .pipe(
        replaceStream('testDiv.scrollIntoView(', 'scrollIntoView(testDiv, ')
      )
      .pipe(res)
  } else if (req.url === '/smooth') {
    const hook = '<!DOCTYPE HTML>'
    //const script = 'https://unpkg.com/scroll-into-view-if-needed@2.0.0/umd/scroll-into-view-if-needed.min.js'
    const script = '/umd.js'

    proxyRes.body
      .pipe(
        replaceStream(hook, hook + '\n<script src=' + script + '></script>', {
          limit: 1,
        })
      )
      .pipe(
        replaceStream('content.scrollIntoView(', 'scrollIntoView(content, ')
      )
      .pipe(res)
  } else {
    proxyRes.body.pipe(res)
  }

  proxyRes.body.on('error', err => {
    console.error(`Error on proxying url: ${url}`)
    console.error(err.stack)
    res.end()
  })

  req.on('abort', () => {
    proxyRes.body.destroy()
  })
}

module.exports = async (req, res) => {
  if (req.url === '/umd.js') {
    fs.createReadStream(umdFile).pipe(res)
    return
  }

  try {
    const item = map[req.url]

    if (!item) {
      res.writeHead(404)
      res.end('404 - Not Found' + req.url)
      return
    }

    const { dest, type } = item
    await proxyRequest(req, res, dest, type)
  } catch (err) {
    console.error(err.stack)
    res.end()
  }
}
