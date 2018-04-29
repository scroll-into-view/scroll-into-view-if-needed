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
        return clientRect.top === Math.round(window.innerHeight / 2 - SIZE / 2)
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
  state = { test: false }

  render() {
    const buttons = keys
    const ActiveTest = this.state.test ? tests[this.state.test] : false
    return (
      <Fragment>
        <navbar className="test-switcher">
          {buttons.map(name => (
            <button
              key={name}
              onClick={() => this.setState({ test: name })}
              id={name}
            >
              {name}
            </button>
          ))}
        </navbar>

        {(ActiveTest && <ActiveTest key={this.state.test} />) || 'Ready!'}
      </Fragment>
    )
  }
}
