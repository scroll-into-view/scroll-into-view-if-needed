import { Fragment, PureComponent } from 'react'
import styled from 'styled-components'
import scrollIntoView from 'scroll-into-view-if-needed'
import scroll from 'stylefire/scroll'
import css from 'stylefire/css'
import { physics } from 'popmotion'

import Code from '../Code'

const SIZE = 200

const ScrollContainer = styled.div`
  box-sizing: content-box;
  border: 1px solid hsla(0, 0%, 0%, 0.2);
  overflow: hidden;
  height: ${SIZE}px;
  width: ${SIZE}px;
`

const ScrollLayer = styled.div`
  display: flex;
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
  opacity: 0.6;
`

const range = ['success', 'warning', 'danger']

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
  items: { [key: string]: HTMLElement } = {}

  doScroll = (target, snapshot) =>
    scrollIntoView(target, {
      behavior: instructions => {
        const [frame, , left] = instructions[0]

        const [fromColor, toColor] = snapshot
        const colorStyler = css(frame)
        const elementScroll = scroll(frame)

        physics({
          from: { left: frame.scrollLeft, color: fromColor },
          to: { left: left, color: toColor },
          springStrength: 600,
          friction: 1,
        }).start(({ left, color }) => {
          colorStyler.set('backgroundColor', color)
          elementScroll.set('left', left)
        })
      },
      boundary: this.container.parentNode as Element,
      inline: 'center',
    })

  getSnapshotBeforeUpdate(_prevProps, prevState) {
    // @TODO report the need to use `as never`
    return [
      getComputedStyle(this.buttons[prevState.selected])
        .backgroundColor as never,
      getComputedStyle(this.buttons[this.state.selected])
        .backgroundColor as never,
    ]
  }

  componentDidMount() {
    this.container.style.setProperty(
      'background-color',
      getComputedStyle(this.buttons[this.state.selected]).backgroundColor
    )
  }

  componentDidUpdate(_prevProps, _prevState, snapshot) {
    this.doScroll(this.items[range[this.state.selected]], snapshot)
  }
  component
  render() {
    return (
      <Fragment>
        <div className="columns">
          <div className="column">
            <Code>{`
        import scrollIntoView from 'scroll-into-view-if-needed';
        import scroll from 'stylefire/scroll';
       import { physics } from 'popmotion';

        scrollIntoView(node, {behavior: instructions => {
            const [frame, top, left] = instructions[0]
            const elementScroll = scroll(frame)
    
            physics({
              from: frame.scrollLeft,
              to: left,
              springStrength: 600,
              friction: 1,
            }).start((v) => elementScroll.set('left', v)
            )
          },
        })
        `}</Code>
          </div>
          <div className="column is-narrow has-text-centered">
            <div className="buttons is-centered">
              <span className="label">Scroll to:&nbsp;</span>
              {range.map((item, key) => (
                <a
                  key={item}
                  ref={button => (this.buttons[key] = button)}
                  className={`button is-small is-${item}`}
                  onClick={() => this.setState({ selected: key })}
                >
                  {key + 1}
                </a>
              ))}
            </div>
            <ScrollContainer
              innerRef={container => (this.container = container)}
            >
              <ScrollLayer id="example-override-behavior">
                {range.map((name, i) => (
                  <Item key={name} innerRef={node => (this.items[name] = node)}>
                    {i + 1}
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
