import { Component } from 'react'
import { format } from '../utils'
import scrollIntoViewIfNeeded, { Options } from 'scroll-into-view-if-needed'

export interface ListProps {
  items: number[]
  id: number
  boundary?: boolean
  options?: Options
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

  static defaultProps = {
    options: {},
  }

  state = { selected: 0 }

  handleClick = event => {
    this.setState(
      {
        selected: parseInt(event.target.value, 10),
      },
      () => {
        const boundary = this.getBoundary()
        const options = this.props.options || {}
        scrollIntoViewIfNeeded(this._node.children[this.state.selected], {
          ...options,
          boundary: boundary ? document.getElementById(boundary) : undefined,
        })
      }
    )
  }
  getBoundary() {
    return this.props.boundary ? `instance${this.props.id}` : undefined
  }
  render() {
    const boundary = this.getBoundary()

    let options = {
      ...this.props.options,
      boundary: boundary ? 'parent' : undefined,
    }

    return (
      <div id={`list${this.props.id}`}>
        <header>
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
                item #{i + 1}
              </li>
            ))}
          </ul>
        </header>
        <nav>
          {[0, 22, 24, 26, 33, 44, 55, 66, 77, 82, 84, 86, 99].map(v => (
            <button key={v.toString()} onClick={this.handleClick} value={v}>
              #{v + 1}
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

scrollIntoViewIfNeeded(${
              Object.keys(this.props.options).length > 0
                ? `node, ${JSON.stringify(options).replace(
                    /"parent"/gi,
                    'parent'
                  )}`
                : 'node'
            })
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
