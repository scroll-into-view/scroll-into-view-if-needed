import { Fragment, PureComponent } from 'react'
import styled from 'styled-components'

import Code from '../Code'
import { scrollIntoView } from '../../utils'

const SIZE = 200

const ScrollContainer = styled.div`
  box-sizing: content-box;
  border: 1px solid hsla(0, 0%, 0%, 0.05);
  background: hsla(0, 0%, 0%, 0.05);
  height: ${SIZE}px;
  overflow: scroll;
  width: ${SIZE}px;
`

const ScrollLayer = styled.div``

const Item = styled.div.attrs({
  className: 'has-background-primary is-size-4',
})`
  align-items: center;
  border-radius: 4px;
  display: flex;
  height: ${SIZE / 4 - 10}px;
  margin: 20px;
  color: hsla(0, 0%, 0%, 0.4);
  justify-content: center;

  & + & {
  }
`

const range = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

class IfNeeded extends PureComponent {
  state = {
    selectedBehavior: 'smooth',
    scrollMode: 'if-needed',
    position: ['nearest', 'center'],
  }

  items: { [key: string]: HTMLElement } = {}

  doScroll = target =>
    scrollIntoView(target, {
      behavior:
        this.state.selectedBehavior === 'smooth-ponyfill'
          ? 'smooth'
          : this.state.selectedBehavior,
      scrollMode: this.state.scrollMode,
      nativeSmooth: this.state.selectedBehavior === 'smooth',
    })

  render() {
    const { selectedBehavior, scrollMode } = this.state
    const behavior =
      selectedBehavior === 'smooth-ponyfill' ? 'smooth' : selectedBehavior

    return (
      <Fragment>
        <div className="columns">
          <div className="column">
            <Code>{`
        import scrollIntoView from 'scroll-into-view-if-needed${
          selectedBehavior === 'smooth-ponyfill' ? '/smooth' : ''
        }';

        const nodes = document.querySelectorAll('#example-if-needed > *')

        scrollIntoView(nodes[3], ${JSON.stringify({ behavior, scrollMode })})
        `}</Code>
          </div>
          <div className="column is-narrow has-text-centered">
            <div className="buttons is-centered">
              <span className="label">Scroll to:&nbsp;</span>
              <a
                className="button is-small"
                onClick={() => this.doScroll(this.items.B)}
              >
                B
              </a>
              <a
                className="button is-small"
                onClick={() => this.doScroll(this.items.D)}
              >
                D
              </a>
              <a
                className="button is-small"
                onClick={() => this.doScroll(this.items.F)}
              >
                F
              </a>
            </div>
            <ScrollContainer>
              <ScrollLayer id="example-if-needed">
                {range.map(name => (
                  <Item key={name} innerRef={node => (this.items[name] = node)}>
                    {name}
                  </Item>
                ))}
              </ScrollLayer>
            </ScrollContainer>
          </div>
        </div>
        <div className="field is-grouped">
          <div className="control">
            Behavior:&nbsp;
            <div className="select is-small">
              <select
                onChange={event =>
                  this.setState({ selectedBehavior: event.target.value })
                }
                value={selectedBehavior}
              >
                <option value="smooth-ponyfill">Ponyfilled smooth</option>
                <option value="smooth">Native smooth</option>
                <option value="instant">Instant</option>
              </select>
            </div>
          </div>
          <div className="control">
            Scroll mode:&nbsp;
            <div className="select is-small">
              <select
                onChange={event =>
                  this.setState({ scrollMode: event.target.value })
                }
                value={scrollMode}
              >
                <option value="if-needed">If needed</option>
                <option value="always">Always</option>
              </select>
            </div>
          </div>
        </div>
      </Fragment>
    )
  }
}

export default IfNeeded
