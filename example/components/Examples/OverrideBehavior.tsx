import { Fragment, PureComponent } from 'react'
import styled from 'styled-components'

import Code from '../Code'
import { scrollIntoView } from '../../utils'

const SIZE = 200

const ScrollContainer = styled.div`
  box-sizing: content-box;
  transition: background-color 200ms;
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

  @supports (mix-blend-mode: multiply) {
    color: hsla(0, 0%, 50%, 1);
    opacity: 0.8;
    mix-blend-mode: multiply;
  }
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

  doScroll = target => scrollIntoView(target, { behavior: 'smooth' })

  getSnapshotBeforeUpdate() {
    // @TODO report the need to use `as never`
    return getComputedStyle(this.buttons[this.state.selected])
      .backgroundColor as never
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { state, props } = this
    console.log(
      'update',
      { props, state },
      { props: prevProps, state: prevState },
      snapshot
    )
    this.doScroll(this.items[range[this.state.selected]])
    console.log('container', this.container)
    this.container.style.setProperty('background-color', snapshot, 'important')
  }
  component
  render() {
    const { inline } = this.state

    return (
      <Fragment>
        <div className="columns">
          <div className="column">
            <Code>{`
        import scrollIntoView from 'scroll-into-view-if-needed';

        scrollIntoView(node, {behavior: calculations => calculations.forEach(([el, scrollTop, scrollLeft]) => { 
               el.scrollTop = scrollTop
               el.scrollLeft = scrollLeft
            })})
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
              className={`has-background-${range[0]}`}
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
