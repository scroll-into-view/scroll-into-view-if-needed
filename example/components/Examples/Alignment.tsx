import { PureComponent, Fragment } from 'react'
import styled from 'styled-components'
import { scrollIntoView } from '../../utils'

const SIZE = 200

const ScrollContainer = styled.div`
  box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.1) inset;
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
  padding: ${layerPadding}px;
  height: ${layerSize}px;
  width: ${layerSize}px;
`

const Item = styled.div.attrs({ className: 'column is-one-third' })`
  justify-content: center;
  display: flex;
  align-items: center;
`
const Tile = styled.div.attrs({
  className: 'has-background-primary is-size-1',
})`
  align-items: center;
  border-radius: 4px;
  display: flex;
  height: ${SIZE / 3}px;
  color: hsla(0, 0%, 0%, 0.2);
  justify-content: center;
  width: ${SIZE / 3}px;
`

const range = [1, 2, 3, 4, 5, 6, 7, 8, 9]

class Alignment extends PureComponent {
  state = {
    position: ['nearest', 'center'],
  }

  items: HTMLElement[] = []

  render() {
    return (
      <div className="columns">
        <div className="column">code</div>
        <div className="column">
          Scroll to:&nbsp;
          <a
            onClick={() =>
              scrollIntoView(this.items[1], {
                inline: this.state.position[0],
                block: this.state.position[1],
              })
            }
          >
            1
          </a>&nbsp;
          <a
            onClick={() =>
              scrollIntoView(this.items[5], {
                inline: this.state.position[0],
                block: this.state.position[1],
              })
            }
          >
            5
          </a>&nbsp;
          <a
            onClick={() =>
              scrollIntoView(this.items[9], {
                inline: this.state.position[0],
                block: this.state.position[1],
              })
            }
          >
            9
          </a>
          <ScrollContainer>
            <ScrollLayer>
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
    )
  }
}

export default Alignment
