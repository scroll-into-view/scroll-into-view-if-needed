import { Fragment, PureComponent } from 'react'
import styled from 'styled-components'
import scrollIntoView from 'scroll-into-view-if-needed'
import scroll from 'stylefire/scroll'
import { spring } from 'popmotion'

import Code from '../Code'

const SIZE = 200

const ScrollContainer = styled.div`
  box-sizing: content-box;
  border: 1px solid hsla(0, 0%, 0%, 0.2);
  background: hsla(0, 0%, 0%, 0.05);
  overflow: hidden;
  height: ${SIZE}px;
  width: ${SIZE}px;
`

const ScrollLayer = styled.div`
  display: flex;
  padding-left: ${SIZE}px;
  padding-right: ${SIZE}px;
  width: ${SIZE * 3}px;
`

const Item = styled.div.attrs({
  className: 'is-size-1',
})`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${SIZE}px;
  width: ${SIZE}px;
  color: black;
`

const emojis = ['🌎', '🌍', '🌏']

class Boundary extends PureComponent {
  state = {
    selectedBehavior: 'smooth',
    inline: 'center',
    boundary: true,
    selected: 0,
    scrollMode: 'if-needed',
    position: ['nearest', 'center'],
  }

  container: HTMLElement
  buttons: HTMLElement[] = []
  items: HTMLElement[] = []

  doScroll = target =>
    scrollIntoView(target, {
      behavior: instructions => {
        const { el: frame, left } = instructions[0]
        const elementScroll = scroll(frame)

        spring({
          from: frame.scrollLeft,
          to: left,
          //stiffness: 200,
          //damping: 10,
        }).start(v => elementScroll.set('left', v))
      },
      boundary: this.container.parentNode as Element,
      inline: 'center',
    })

  componentDidMount() {
    this.container.scrollLeft = SIZE
  }

  componentDidUpdate() {
    this.doScroll(this.items[this.state.selected])
  }
  component
  render() {
    return (
      <Fragment>
        <div className="columns">
          <div className="column">
            <Code>{`
        import scrollIntoView from 'scroll-into-view-if-needed';
        import scroll from 'stylefire/scroll'
        import { spring } from 'popmotion'

        scrollIntoView(node, {behavior: instructions => {
            const [frame, top, left] = instructions[0]
            const elementScroll = scroll(frame)
    
            spring({from: scrollLeft,to: left})
            .start((left) => elementScroll.set('left', left))
            
          },inline: 'center'})
        `}</Code>
          </div>
          <div className="column is-narrow has-text-centered">
            <div className="buttons is-centered">
              <span className="label">Scroll to:&nbsp;</span>
              {emojis.map((emoji, key) => (
                <a
                  key={emoji}
                  ref={button => (this.buttons[key] = button)}
                  className="button is-small"
                  onClick={() => this.setState({ selected: key })}
                >
                  {emoji}
                </a>
              ))}
            </div>
            <ScrollContainer
              innerRef={container => (this.container = container)}
            >
              <ScrollLayer id="example-override-behavior">
                {emojis.map((emoji, key) => (
                  <Item key={emoji} innerRef={node => (this.items[key] = node)}>
                    {emoji}
                  </Item>
                ))}
              </ScrollLayer>
            </ScrollContainer>
          </div>
        </div>
      </Fragment>
    )
  }
}

export default Boundary
