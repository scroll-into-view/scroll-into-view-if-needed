import { Fragment, PureComponent } from 'react'
import styled from 'styled-components'

import Code from '../Code'
import scrollIntoView from 'scroll-into-view-if-needed'
import smoothScrollIntoView from 'smooth-scroll-into-view-if-needed'

const SIZE = 200

const ScrollContainer = styled.div`
  box-sizing: content-box;
  border: 1px solid hsla(0, 0%, 0%, 0.05);
  background: hsla(0, 0%, 0%, 0.05);
  height: ${SIZE}px;
  overflow: scroll;
  width: ${SIZE}px;
`

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
    selectedBehavior: 'smooth' as 'smooth',
    scrollMode: 'if-needed' as 'if-needed',
    position: ['nearest' as 'nearest', 'center' as 'center'],
  }

  items: { [key: string]: HTMLElement } = {}

  doScroll = target =>
    (this.state.selectedBehavior === 'smooth'
      ? scrollIntoView
      : smoothScrollIntoView)(target, {
      behavior:
        (this.state.selectedBehavior as 'smooth-ponyfill') === 'smooth-ponyfill'
          ? ('smooth' as 'smooth')
          : this.state.selectedBehavior,
      scrollMode: this.state.scrollMode,
    })

  render() {
    const { selectedBehavior, scrollMode } = this.state
    const behavior =
      (selectedBehavior as 'smooth-ponyfill') === 'smooth-ponyfill'
        ? 'smooth'
        : selectedBehavior

    return (
      <Fragment>
        <div className="columns">
          <div className="column">
            <Code>{`
        import scrollIntoView from '${
          (selectedBehavior as 'smooth-ponyfill') === 'smooth-ponyfill'
            ? 'smooth-'
            : ''
        }scroll-into-view-if-needed';

        const nodes = document.querySelectorAll('#example-if-needed > *')

        scrollIntoView(nodes[3], ${JSON.stringify({ behavior, scrollMode })})
        `}</Code>
          </div>
          <div className="column is-narrow has-text-centered">
            <div className="buttons is-centered">
              <span className="label">Scroll to:&nbsp;</span>
              <a
                key="C"
                className="button is-small"
                onClick={() => this.doScroll(this.items.C)}
              >
                C
              </a>
              <a
                key="D"
                className="button is-small"
                onClick={() => this.doScroll(this.items.D)}
              >
                D
              </a>
              <a
                key="F"
                className="button is-small"
                onClick={() => this.doScroll(this.items.F)}
              >
                F
              </a>
            </div>
            <ScrollContainer>
              {range.map(name => (
                <Item key={name} innerRef={node => (this.items[name] = node)}>
                  {name}
                </Item>
              ))}
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
