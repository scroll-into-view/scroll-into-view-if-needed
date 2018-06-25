import scrollIntoView from '../../src/index'

const node = document.body

// Ensuring that the generics support doesn't break
async function main() {
  const didScroll = await scrollIntoView<Promise<boolean>>(node, {
    behavior: actions => {
      actions.forEach(({ el, left, top }) => {
        el.scroll({ left, top })
      })
      return Promise.resolve(actions.length > 0)
    },
  })

  return didScroll === true
}

main()
