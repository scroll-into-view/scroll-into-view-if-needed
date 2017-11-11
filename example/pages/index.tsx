import { Component } from 'react'
import Head from 'next/head'
import systemFontStack from 'system-font-stack'
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'
import Section from '../components/Section'

export interface IndexPageProps {
  items: number[]
}
export interface IndexPageState {
  selected: number
}

const { description } = require('scroll-into-view-if-needed/package.json')

export default class IndexPage extends Component<
  IndexPageProps,
  { selected: number }
> {
  private _node: HTMLUListElement

  static defaultProps = {
    items: Array.apply(null, { length: 100 }).map(Number.call, Number),
  }

  state = { selected: 0 }

  handleClick = event => {
    this.setState({ selected: parseInt(event.target.value, 10) }, () => {
      scrollIntoViewIfNeeded(this._node.children[this.state.selected], false, {
        duration: 300,
      })
    })
  }

  render() {
    return (
      <div>
        <Head>
          <title>{description}</title>
        </Head>
        <Section>
          <h1>{description}</h1>
          <style jsx>{`
            section {
              font-family: ${systemFontStack};
            }
            ul {
              border: 1px solid #aaa;
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

            footer {
              margin-top: 20px;
            }
          `}</style>
          <ul
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
          <div>
            {[0, 11, 22, 24, 26, 33, 44, 55, 66, 77, 82, 84, 86, 99].map(v => (
              <button onClick={this.handleClick} value={v}>
                #{v}
              </button>
            ))}
          </div>
        </Section>
        <footer>
          <a
            href="https://github.com/stipsan/scroll-into-view-if-needed"
            target="_blank"
          >
            GitHub
          </a>
        </footer>
      </div>
    )
  }
}
