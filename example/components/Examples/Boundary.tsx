import { Fragment, PureComponent } from 'react'
import styled from 'styled-components'

import Code from '../Code'
import { scrollIntoView } from '../../utils'

const SIZE = 200

const ScrollContainer = styled.div`
  box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.1);
  background: hsla(0, 0%, 0%, 0.05);
  height: ${SIZE}px;
  overflow: scroll;
  width: ${SIZE}px;
`

const ScrollLayer = styled.div``

const Item = styled.div.attrs({
  className: 'has-background-dark is-size-4',
})`
  align-items: center;
  border-radius: 4px;
  display: flex;
  height: ${SIZE / 4 - 10}px;
  margin: 20px;
  color: white;
  justify-content: center;

  & + & {
  }
`

const range = ['😁', '🤯', '😅', '🤔', '🤩', '🤨', '😲']

class Boundary extends PureComponent {
  state = {
    selectedBehavior: 'smooth',
    block: 'end',
    boundary: true,
    scrollMode: 'if-needed',
    position: ['nearest', 'center'],
  }

  items: { [key: string]: HTMLElement } = {}

  doScroll = target =>
    scrollIntoView(target, {
      behavior: 'smooth',
      block: this.state.block,
    })

  render() {
    const { selectedBehavior, boundary, block } = this.state

    return (
      <Fragment>
        <div className="columns">
          <div className="column">
            <Code>{`
        import scrollIntoView from 'scroll-into-view-if-needed';

        const nodes = document.querySelectorAll('#example-boundary > *')

        scrollIntoView(nodes[3], {
          behavior: 'smooth',
          block: '${block}',
          ${
            boundary
              ? 'boundary: document.getElementById("example-boundary")'
              : ''
          }
        })
        `}</Code>
          </div>
          <div className="column is-narrow has-text-centered">
            <div className="buttons is-centered">
              <span className="label">Scroll to:&nbsp;</span>
              <a
                className="button is-small"
                onClick={() => this.doScroll(this.items[range[1]])}
              >
                {range[1]}
              </a>
              <a
                className="button is-small"
                onClick={() => this.doScroll(this.items[range[3]])}
              >
                {range[3]}
              </a>
              <a
                className="button is-small"
                onClick={() => this.doScroll(this.items[range[5]])}
              >
                {range[5]}
              </a>
            </div>
            <ScrollContainer>
              <ScrollLayer id="example-boundary">
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
            Boundary:&nbsp;
            <label className="radio">
              <input
                type="radio"
                name="boundary"
                checked={boundary}
                onChange={event =>
                  this.setState({ boundary: event.target.checked })
                }
              />
              &nbsp;Yes
            </label>
            <label className="radio">
              <input
                type="radio"
                name="boundary"
                checked={!boundary}
                onChange={event =>
                  this.setState({ boundary: !event.target.checked })
                }
              />
              &nbsp;No
            </label>
          </div>
          <div className="control">
            Block:&nbsp;
            <div className="select is-small">
              <select
                onChange={event => this.setState({ block: event.target.value })}
                value={block}
              >
                <option value="start">Start</option>
                <option value="center">Center</option>
                <option value="end">End</option>
                <option value="nearest">Nearest</option>
              </select>
            </div>
          </div>
        </div>
      </Fragment>
    )
  }
}

export default Boundary
