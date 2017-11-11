import { Component } from 'react'
import { format } from '../utils'
import scrollIntoViewIfNeeded, {
  AnimateOptions,
  OffsetConfig,
} from 'scroll-into-view-if-needed'

export interface ListProps {
  items: number[]
  id: number
  wrapInScrollView?: boolean
  centerIfNeeded?: boolean
  options?: AnimateOptions
  finalElement?: Element
  config?: OffsetConfig
}

export interface ListState {
  selected: number
}

// add support for next.js provided api
// @TODO find a better way to make it work
interface Process {
  browser: boolean
}
declare var process: Process

// enable devtools to play with the api
if (process.browser) {
  window.scrollIntoViewIfNeeded = scrollIntoViewIfNeeded
}

export default class List extends Component<ListProps, ListState> {
  private _node: HTMLUListElement

  state = { selected: 0 }

  handleClick = event => {
    this.setState(
      {
        selected: parseInt(event.target.value, 10),
      },
      () => {
        const finalElement = this.getFinalElement()
        scrollIntoViewIfNeeded(
          this._node.children[this.state.selected],
          this.props.centerIfNeeded,
          this.props.options,
          finalElement && document.getElementById(finalElement),
          this.props.config
        )
      }
    )
  }
  getFinalElement() {
    return this.props.finalElement || this.props.wrapInScrollView
      ? `instance${this.props.id}`
      : undefined
  }
  render() {
    const finalElement = this.getFinalElement()
    const args = [
      'node',
      JSON.stringify(this.props.centerIfNeeded),
      JSON.stringify(this.props.options) || 'undefined',
      finalElement ? `parent` : 'undefined',
      JSON.stringify(this.props.config),
    ]

    return (
      <div>
        <header
          style={
            this.props.wrapInScrollView
              ? {
                  //width: '200px',
                  height: '6em',
                  overflow: 'auto',
                }
              : {}
          }
        >
          <ul
            id={`instance${this.props.id}`}
            ref={node => {
              if (node) {
                this._node = node
              }
            }}
          >
            {this.props.items.map(i => (
              <li
                style={{
                  background: this.state.selected === i ? '#bada55' : null,
                }}
                key={i.toString()}
              >
                item #{i}
              </li>
            ))}
          </ul>
        </header>
        <nav>
          {[0, 22, 24, 26, 33, 44, 55, 66, 77, 82, 84, 86, 99].map(v => (
            <button key={v.toString()} onClick={this.handleClick} value={v}>
              #{v}
            </button>
          ))}
        </nav>
        <pre>
          // Try running this in your console and change the options to see what
          happens
          <br />
          <code>
            {format(`
var parent = document.getElementById("instance${
              this.props.id
            }"), list = parent.children, node = list[Math.floor(Math.random() * list.length)]

scrollIntoViewIfNeeded(${args.join(', ')})
        `)}
          </code>
        </pre>
        <style jsx>{`
          div {
            margin: 20px auto;
          }
          pre {
            display: inline-block;
            margin: 10px auto;
            padding: 20px;
            border-radius: 5px;
            background-color: rgb(246, 248, 250);
            text-align: left;
          }
          ul {
            border: 1px solid #aaa;
            display: inline-block;
            margin-left: auto;
            margin-right: auto;
            height: 7em;
            margin: 0;
            overflow: auto;
            padding: 0;
            width: 400px;
            white-space: nowrap;
          }

          li {
            background: #eee;
            border-radius: 5px;
            display: inline-block;
            list-style: none;
            padding: 5px 10px;
            margin: 3px;
          }

          li:nth-child(2n + 1) {
            background: #ddd;
            text-align: right;
          }

          li:nth-child(8n + 1) {
            display: block;
          }
        `}</style>
      </div>
    )
  }
}
