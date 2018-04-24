import { Component, Fragment, createRef } from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'

import '../style.css'

class Test extends Component {
  target = createRef()

  state = { test: undefined }

  componentDidMount() {
    const node = this.target.current
    scrollIntoView(node)
  }

  render() {
    return (
      <div
        className="bulls-eye"
        ref={this.target}
        data-test={this.state.test}
      />
    )
  }
}

export default () => (
  <Fragment>
    <div className="is-full-height" />
    <div className="is-full-height">
      <Test />
    </div>
    <div className="is-full-height" />
  </Fragment>
)
