import { Component } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import styled, { StyleSheetManager } from 'styled-components'
import { dimensions } from '../utils'

const maxWidth = (dimensions.maxWidth - 20) / 3 || 1140 / 3

const Wrapper = styled.iframe`
  -webkit-overflow-scrolling: touch;
  display: inline-block;
  box-shadow: hsla(0, 0%, 0%, 0.1) 0 0 0 1px;
  height: 100%;
  width: 100%;
  margin: 0 auto;
  overflow: auto;
  padding: 0;
  max-width: 100%;
  transition: all 200ms linear;
  max-width: ${maxWidth}px;
  max-height: ${maxWidth}px;
`

class Iframe extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
  }
  frame?: HTMLIFrameElement
  root: HTMLDivElement

  state = { mounted: false }

  componentDidMount() {
    this.root = document.createElement('div')
    // We only need the first link tag
    this.frame.contentDocument.head.appendChild(
      document.querySelector('link[rel="stylesheet"]').cloneNode()
    )
    this.frame.contentDocument.body.appendChild(this.root)
    this.setState({ mounted: true })
  }

  render() {
    return (
      <Wrapper frameBorder="0" innerRef={frame => (this.frame = frame)}>
        {this.state.mounted &&
          createPortal(
            <StyleSheetManager target={this.frame.contentDocument.head}>
              {this.props.children}
            </StyleSheetManager>,
            this.root
          )}
      </Wrapper>
    )
  }
}

export default Iframe
