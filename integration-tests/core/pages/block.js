import PropTypes from 'prop-types'
import { Component, Fragment, createRef } from 'react'

import Expect from '../components/Expect'

import '../style.css'

const SIZE = 100

const tests = {
  start: () => (
    <Expect
      options={{ block: 'start' }}
      toBe={node => {
        const clientRect = node.getBoundingClientRect()
        return clientRect.top === 0
      }}
    >
      {({ target }) => (
        <Fragment>
          <div className="is-full-height align-center" />
          <div className="is-full-height align-center">{target}</div>
          <div className="is-full-height align-center" />
        </Fragment>
      )}
    </Expect>
  ),
  center: () => (
    <Expect
      options={{ block: 'center' }}
      toBe={node => {
        const clientRect = node.getBoundingClientRect()
        return clientRect.top === window.innerHeight / 2 - SIZE / 2
      }}
    >
      {({ target }) => (
        <Fragment>
          <div className="is-full-height align-center" />
          <div className="is-full-height align-center">{target}</div>
          <div className="is-full-height align-center" />
        </Fragment>
      )}
    </Expect>
  ),
  end: () => (
    <Expect
      options={{ block: 'end' }}
      toBe={node => {
        const clientRect = node.getBoundingClientRect()
        return clientRect.bottom === window.innerHeight
      }}
    >
      {({ target }) => (
        <Fragment>
          <div className="is-full-height align-center" />
          <div className="is-full-height align-center">{target}</div>
          <div className="is-full-height align-center" />
        </Fragment>
      )}
    </Expect>
  ),
}
const keys = Object.keys(tests).sort()

export default class extends Component {
  state = { test: keys[0], mounted: false }

  componentDidMount() {
    // @TODO Workaround annoying chrome behavior, implement event listeners like window.onload instead
    setTimeout(() => this.setState({ mounted: true }), 100)
  }

  render() {
    const buttons = keys
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
