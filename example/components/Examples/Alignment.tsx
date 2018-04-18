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

const layerSize = SIZE * 1.5 + SIZE / 6
const layerPadding = SIZE / 12
const ScrollLayer = styled.div.attrs({
  className: 'columns is-multiline is-mobile is-gapless',
})`
  box-sizing: border-box;
  padding: ${layerPadding}px;
  height: ${layerSize}px;
  width: ${layerSize}px;
`

const Item = styled.div.attrs({ className: 'column is-one-third' })`
  justify-content: center;
  display: flex;
  align-items: center;
  /* The following is to support vertical writing mode */
  height: ${100 / 3}%;
`
const Tile = styled.div.attrs({
  className: 'has-background-primary is-size-1',
})`
  align-items: center;
  border-radius: 4px;
  display: flex;
  height: ${SIZE / 3}px;
  color: hsla(0, 0%, 0%, 0.3);
  justify-content: center;
  width: ${SIZE / 3}px;
`

const behavior = 'smooth'
const scrollMode = 'always'
const range = [1, 2, 3, 4, 5, 6, 7, 8, 9]

class Alignment extends PureComponent {
  state = {
    block: 'center',
    inline: 'center',
  }

  items: HTMLElement[] = []

  doScroll = target =>
    scrollIntoView(target, {
      behavior,
      scrollMode,
      block: this.state.block,
      inline: this.state.inline,
    })

  render() {
    const { block, inline } = this.state

    return (
      <Fragment>
        <div className="columns">
          <div className="column">
            <Code>{`
        import scrollIntoView from 'scroll-into-view-if-needed';

        const nodes = document.querySelectorAll('#example-alignment > *')

        scrollIntoView(nodes[5], ${JSON.stringify({
          scrollMode,
          behavior,
          block,
          inline,
        })})
        `}</Code>
          </div>
          <div className="column is-narrow has-text-centered">
            <div className="buttons is-centered">
              <span className="label">Scroll to:&nbsp;</span>
              <a
                className="button is-small"
                onClick={() => this.doScroll(this.items[1])}
              >
                1
              </a>
              <a
                className="button is-small"
                onClick={() => this.doScroll(this.items[5])}
              >
                5
              </a>
              <a
                className="button is-small"
                onClick={() => this.doScroll(this.items[9])}
              >
                9
              </a>
            </div>

            <ScrollContainer>
              <ScrollLayer id="example-alignment">
                {range.map(number => (
                  <Item key={number}>
                    <Tile innerRef={node => (this.items[number] = node)}>
                      {number}
                    </Tile>
                  </Item>
                ))}
              </ScrollLayer>
            </ScrollContainer>
          </div>
        </div>
        <div className="field is-grouped">
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
          <div className="control">
            Inline:&nbsp;
            <div className="select is-small">
              <select
                onChange={event =>
                  this.setState({ inline: event.target.value })
                }
                value={inline}
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

export default Alignment
