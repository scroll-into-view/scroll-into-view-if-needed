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
      <Fragment>
        <div className="is-full-height align-center" />
        <div className="is-full-height align-center">
          <div
            className="bulls-eye"
            ref={this.target}
            data-test={this.state.test}
          />
        </div>
        <div className="is-full-height align-center" />
      </Fragment>
    )
  }
}

class Start extends Component {
  target = createRef()

  state = { test: undefined }

  componentDidMount() {
    const node = this.target.current
    scrollIntoView(node, { block: 'start' })
  }

  render() {
    return (
      <Fragment>
        <div className="is-full-height align-centers" />
        <div className="is-full-height align-center">
          <div
            className="bulls-eye"
            ref={this.target}
            data-test={this.state.test}
          />
        </div>
        <div className="is-full-height align-center" />
      </Fragment>
    )
  }
}

class End extends Component {
  target = createRef()

  state = { test: undefined }

  componentDidMount() {
    const node = this.target.current
    scrollIntoView(node, { block: 'end' })
  }

  render() {
    return (
      <Fragment>
        <div className="is-full-height align-centers" />
        <div className="is-full-height align-center">
          <div
            className="bulls-eye"
            ref={this.target}
            data-test={this.state.test}
          />
        </div>
        <div className="is-full-height align-center" />
      </Fragment>
    )
  }
}

const tests = {
  start: Start,
  center: Test,
  end: End,
}

export default class extends Component {
  state = { test: Object.keys(tests)[0], mounted: false }

  componentDidMount() {
    // @TODO Workaround annoying chrome behavior, implement event listeners like window.onload instead
    setTimeout(() => this.setState({ mounted: true }), 100)
  }

  render() {
    const buttons = Object.keys(tests)
    const ActiveTest = tests[this.state.test]
    return (
      <Fragment>
        <navbar className="test-switcher">
          {buttons.map(name => (
            <button key={name} onClick={() => this.setState({ test: name })}>
              {name}
            </button>
          ))}
        </navbar>

        {this.state.mounted ? (
          <ActiveTest key={this.state.test} />
        ) : (
          'mounting…'
        )}
      </Fragment>
    )
  }
}
