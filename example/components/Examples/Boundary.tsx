import { Fragment, PureComponent } from 'react'
import styled from 'styled-components'

import Code from '../Code'
import { scrollIntoView } from '../../utils'

const SIZE = 200

const ScrollContainer = styled.div`
  border: 1px solid hsla(0, 0%, 0%, 0.05);
  box-sizing: content-box;
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
    // @TODO replace type casting with Options from scroll-into-view-if-needed
    block: 'end' as 'end',
    boundary: true,
    scrollMode: 'if-needed' as 'if-needed',
    position: ['nearest', 'center'],
  }

  frameBoundary: Element
  items: { [key: string]: HTMLElement } = {}

  doScroll = target =>
    scrollIntoView(target, {
      behavior: 'smooth',
      block: this.state.block,
      boundary: this.state.boundary ? this.frameBoundary : undefined,
    })

  render() {
    const { boundary, block } = this.state

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
            <ScrollContainer innerRef={node => (this.frameBoundary = node)}>
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
            <label className="checkbox">
              Boundary:&nbsp;<input
                type="checkbox"
                checked={boundary}
                onChange={event =>
                  this.setState({ boundary: event.target.checked })
                }
              />
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
