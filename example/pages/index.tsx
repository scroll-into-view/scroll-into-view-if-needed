import { Component } from 'react'
import Head from 'next/head'
import systemFontStack from 'system-font-stack'
import cx from 'classnames'
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

export interface IndexPageProps {
  items: number[]
}
export interface IndexPageState {
  selected: number
}

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
    this.setState({ selected: parseInt(event.target.value, 10) }, (...args) => {
      console.log('handleClick', args, this.state, this._node.childNodes[9])
      scrollIntoViewIfNeeded(this._node.children[this.state.selected], false, {
        duration: 300,
      })
    })
  }

  render() {
    console.log(this.props.items)
    return (
      <div>
        <style jsx global>{`
          body {
            font-family: ${systemFontStack};
          }
        `}</style>
        <Head>
          <title>scrollIntoViewIfNeeded test page</title>
        </Head>

        <h1>scrollIntoViewIfNeeded test page</h1>
        <style jsx>{`
          ul {
            border: 1px solid #aaa;
            height: 7em;
            margin: 0;
            overflow: auto;
            padding: 0;
            width: 400px;
            white-space: nowrap;
          }

          ul li {
            background: #eee;
            border-radius: 5px;
            display: inline-block;
            list-style: none;
            padding: 5px 10px;
          }

          ul li:nth-child(2n + 1) {
            background: #ddd;
            text-align: right;
          }

          ul li.selected {
            background: #bada55;
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
              className={cx({ selected: this.state.selected === i })}
              key={i.toString()}
            >
              item #{i}
            </li>
          ))}
        </ul>
        <div>
          {[0, 11, 22, 24, 26, 33, 44, 55, 66, 77, 82, 82, 86, 99].map(v => (
            <button onClick={this.handleClick} value={v}>
              #{v}
            </button>
          ))}
        </div>

        <div id="buttons-centerFalse">
          <span>
            <code>scrollIntoViewIfNeeded(false)</code> to item :{' '}
          </span>
          <button onClick={this.handleClick} data-item-idx="0">
            #0
          </button>
          <button data-item-idx="11">#11</button>
          <button data-item-idx="22">#22</button>
          <button data-item-idx="24">#24</button>
          <button data-item-idx="26">#26</button>
          <button data-item-idx="33">#33</button>
          <button data-item-idx="44">#44</button>
          <button data-item-idx="55">#55</button>
          <button data-item-idx="66">#66</button>
          <button data-item-idx="77">#77</button>
          <button data-item-idx="82">#82</button>
          <button data-item-idx="84">#84</button>
          <button data-item-idx="86">#86</button>
          <button data-item-idx="99">#99</button>
        </div>

        <div id="buttons-centerTrue">
          <span>
            <code>scrollIntoViewIfNeeded(true)</code> to item :{' '}
          </span>
          <button data-item-idx="0">#0</button>
          <button data-item-idx="11">#11</button>
          <button data-item-idx="22">#22</button>
          <button data-item-idx="24">#24</button>
          <button data-item-idx="26">#26</button>
          <button data-item-idx="33">#33</button>
          <button data-item-idx="44">#44</button>
          <button data-item-idx="55">#55</button>
          <button data-item-idx="66">#66</button>
          <button data-item-idx="77">#77</button>
          <button data-item-idx="82">#82</button>
          <button data-item-idx="84">#84</button>
          <button data-item-idx="86">#86</button>
          <button data-item-idx="99">#99</button>
        </div>

        <div id="buttons-centerUndefined">
          <span>
            <code>scrollIntoViewIfNeeded(undefined)</code> to item :{' '}
          </span>
          <button data-item-idx="0">#0</button>
          <button data-item-idx="11">#11</button>
          <button data-item-idx="22">#22</button>
          <button data-item-idx="24">#24</button>
          <button data-item-idx="26">#26</button>
          <button data-item-idx="33">#33</button>
          <button data-item-idx="44">#44</button>
          <button data-item-idx="55">#55</button>
          <button data-item-idx="66">#66</button>
          <button data-item-idx="77">#77</button>
          <button data-item-idx="82">#82</button>
          <button data-item-idx="84">#84</button>
          <button data-item-idx="86">#86</button>
          <button data-item-idx="99">#99</button>
        </div>

        <div id="buttons-centerNoArgs">
          <span>
            <code>scrollIntoViewIfNeeded()</code> to item :{' '}
          </span>
          <button data-item-idx="0">#0</button>
          <button data-item-idx="11">#11</button>
          <button data-item-idx="22">#22</button>
          <button data-item-idx="24">#24</button>
          <button data-item-idx="26">#26</button>
          <button data-item-idx="33">#33</button>
          <button data-item-idx="44">#44</button>
          <button data-item-idx="55">#55</button>
          <button data-item-idx="66">#66</button>
          <button data-item-idx="77">#77</button>
          <button data-item-idx="82">#82</button>
          <button data-item-idx="84">#84</button>
          <button data-item-idx="86">#86</button>
          <button data-item-idx="99">#99</button>
        </div>

        <div id="buttons-animate">
          <span>
            <code>animate scrollIntoViewIfNeeded()</code> to item :{' '}
          </span>
          <button data-item-idx="0">#0</button>
          <button data-item-idx="11">#11</button>
          <button data-item-idx="22">#22</button>
          <button data-item-idx="24">#24</button>
          <button data-item-idx="26">#26</button>
          <button data-item-idx="33">#33</button>
          <button data-item-idx="44">#44</button>
          <button data-item-idx="55">#55</button>
          <button data-item-idx="66">#66</button>
          <button data-item-idx="77">#77</button>
          <button data-item-idx="82">#82</button>
          <button data-item-idx="84">#84</button>
          <button data-item-idx="86">#86</button>
          <button data-item-idx="99">#99</button>
        </div>

        <script type="text/html">{`
        (function() {
            var scrollArea = document.getElementById('scroll-area'),
                buttonsCenterFalse = document.getElementById('buttons-centerFalse'),
                buttonsCenterTrue = document.getElementById('buttons-centerTrue'),
                buttonsCenterUndefined = document.getElementById('buttons-centerUndefined'),
                buttonsCenterNoArgs = document.getElementById('buttons-centerNoArgs'),
                buttonsAnimate = document.getElementById('buttons-animate'),
                scrollIntoViewIfNeededToItemAndSelect;
            scrollIntoViewIfNeededToItemAndSelect = function(itemIdx, centerIfNeeded, options) {
                scrollArea.querySelector('.selected').className = '';
                // Allow us to really have difference bewteen scrollIntoViewIfNeeded() and scrollIntoViewIfNeeded(undefined)
                if (arguments.length === 1) {
                    scrollIntoViewIfNeeded(scrollArea.children[itemIdx]);
                } else {
                    scrollIntoViewIfNeeded(scrollArea.children[itemIdx], centerIfNeeded, options);
                }
                scrollArea.children[itemIdx].className = 'selected';
            };
            buttonsCenterFalse.addEventListener('click', function(e) {
                if (e.target.nodeName === 'BUTTON') {
                    scrollIntoViewIfNeededToItemAndSelect(e.target.dataset.itemIdx, false);
                }
            }, false);
            buttonsCenterTrue.addEventListener('click', function(e) {
                if (e.target.nodeName === 'BUTTON') {
                    scrollIntoViewIfNeededToItemAndSelect(e.target.dataset.itemIdx, true);
                }
            }, false);
            buttonsCenterUndefined.addEventListener('click', function(e) {
                if (e.target.nodeName === 'BUTTON') {
                    scrollIntoViewIfNeededToItemAndSelect(e.target.dataset.itemIdx, undefined);
                }
            }, false);
            buttonsCenterNoArgs.addEventListener('click', function(e) {
                if (e.target.nodeName === 'BUTTON') {
                    scrollIntoViewIfNeededToItemAndSelect(e.target.dataset.itemIdx);
                }
            }, false);
            buttonsAnimate.addEventListener('click', function(e) {
                if (e.target.nodeName === 'BUTTON') {
                    scrollIntoViewIfNeededToItemAndSelect(e.target.dataset.itemIdx, false, {
                        centerIfNeeded: false,
                        duration: 150
                    });
                }
            }, false);
        })();
    `}</script>
      </div>
    )
  }
}
