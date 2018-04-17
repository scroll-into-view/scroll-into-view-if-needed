import { Component } from 'react'
import systemFontStack from 'system-font-stack'
import styled, { injectGlobal } from 'styled-components'
import Section from '../components/Section'
import Footer from '../components/Footer'
import List from '../components/List'
import Iframe from '../components/Iframe'
import { Text as TextIcon, Chrome } from '../components/Icons'
import IfNeeded from '../components/Examples/IfNeeded'
import Alignment from '../components/Examples/Alignment'

import { scrollIntoView } from '../utils'

injectGlobal`
  html,
  body {
    margin: 0;
    padding: 0;
  }
  body {
    font-family: ${systemFontStack};
  }
`

export interface IndexPageProps {
  items: number[]
}

const Hero = styled.header`
  display: flex;
  box-sizing: border-box;
  padding: 0 20px;
  align-items: center;
  justify-content: center;
  background-image: linear-gradient(168deg, #b3fbf7 0%, #ff0561 100%);
  height: 100vh;
`
const Wrapper = styled.div`
  position: relative;
  max-height: 389px;

  svg {
    max-width: 100%;
    height: auto;
  }

  > svg {
    z-index: 1;
    position: relative;
  }
`
const ScrollWrapper = styled.div`
  position: absolute;
  overflow: scroll;
  top: 0;
  left: 0;
  right: 0;
  bottom: 3px;
  opacity: 0.6;

  @supports (mix-blend-mode: overlay) {
    opacity: 1;
    mix-blend-mode: overlay;
  }
`

/*

Show 3 boxes up top

Examples:
* simple 9 x 9 grid that showcases the "if-needed" mode, by making "5" never scroll
* showcase the "center" mode compared to normal scrollIntoView
* and show the "smooth" behavior mode



* normal counter grid
  simple version that do not animate
  or ios like contacts list
* color parallax grid
  introduce animation
* metro grid
* calendar, clicking on a month scrolls the month into view (based on what-she-said) 
* slack like "jump to message"?

*/

const ScrollContainer = styled.main`
  overflow: auto;
  height: 100vh;
  width: 100vw;
`

const IntroductionSection = styled(Section)`
  margin-top: 10px;
`

export default class IndexPage extends Component<IndexPageProps> {
  static defaultProps = {
    items: Array.apply(null, { length: 100 }).map(Number.call, Number),
  }

  scrollToRef = null

  componentDidMount() {
    setTimeout(() => {
      scrollIntoView(this.scrollToRef, { behavior: 'smooth', block: 'end' })
    }, 100)
  }

  render() {
    return (
      <div>
        <Hero>
          <Wrapper>
            <Chrome />
            <ScrollWrapper>
              <TextIcon innerRef={node => (this.scrollToRef = node)} />
            </ScrollWrapper>
          </Wrapper>
        </Hero>
        <IntroductionSection className="columns">
          <div className="column">
            <h2 className="is-size-4">Ponyfill</h2>
            <p>
              This package <a href="http://ponyfill.com/">ponyfills</a>
              &nbsp;new features in the&nbsp;
              <a href="https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView">
                Element.scrollIntoView
              </a>{' '}
              API. Including features in the non-standard{' '}
              <a href="https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded">
                Element.scrollIntoViewIfNeeded
              </a>{' '}
              API, that the CSS working group is{' '}
              <a href="https://github.com/w3c/csswg-drafts/pull/1805">
                proposing
              </a>{' '}
              to add to <code>scrollIntoVIew</code> as another option:{' '}
              <code>scrollMode: "if-needed"</code>.
            </p>
          </div>
          <div className="column">
            <h2 className="is-size-4">Minimal</h2>
            <p>
              To keep the filesize as small as possible only the absolute
              essentials is included by default. Using{' '}
              <code>behavior: "smooth"</code> thus only works in browsers that
              implement it, unless you opt-in to polyfilling it by importing
              from <code>scroll-into-view-if-needed/smooth</code>.
            </p>
          </div>
          <div className="column">
            <h2 className="is-size-4">Customizable</h2>
            <p>
              The available options cover most use cases, but for advanced users
              it's posible to pass in a function to <code>scrollMode</code> to
              control the logic of when to scroll or not, and{' '}
              <code>behavior</code> to if you only need to know if and what to
              scroll but bring your own logic for the actual scrolling.
            </p>
          </div>
        </IntroductionSection>
        <Section>
          <div className="columns">
            <div className="column is-one-third">
              <h3 className="title">Scrolling if needed</h3>
              <p className="subtitle">
                When deciding if scrolling is needed the visibility of the
                target element is checked. If it's less than 100% it will be
                scrolled.
              </p>
              <p>
                Pass a function to&nbsp;
                <code>scrollMode</code> to allow differen't visibility ratios or
                other custom logic.
              </p>
            </div>
            <div className="column">
              <IfNeeded />
            </div>
          </div>
        </Section>
        <Section>
          <div className="columns">
            <div className="column is-one-third">
              <h3 className="title">Scroll alignment</h3>
              <p className="subtitle">
                The options <code>block</code> and <code>inline</code> each have one of <code>"start"</code>, <code>"center"</code>, <code>"end"</code> or <code>"nearest"</code>.
                The default values are <code>block: "center"</code> and <code>inline: "nearest"</code>.
                </p><p>Usually <code>block</code> aligns vertically, while <code>inline</code> aligns horizontally. It depends on the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/writing-mode">writing-mode</a>.
              </p>
             
            </div>
            <div className="column">
              <Alignment />
            </div>
          </div>
        </Section>
        <Footer />
      </div>
    )
  }
}
