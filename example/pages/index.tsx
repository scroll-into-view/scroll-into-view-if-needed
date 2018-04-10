import { Component } from 'react'
import Head from 'next/head'
import systemFontStack from 'system-font-stack'
import styled from 'styled-components'
import Section from '../components/Section'
import Footer from '../components/Footer'
import List from '../components/List'
import { Text as TextIcon, Chrome } from '../components/Icons'

import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

export interface IndexPageProps {
  items: number[]
}

const { description } = require('scroll-into-view-if-needed/package.json')

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
`

export default class IndexPage extends Component<IndexPageProps> {
  static defaultProps = {
    items: Array.apply(null, { length: 100 }).map(Number.call, Number),
  }

  componentDidMount() {
    setTimeout(
      () => scrollIntoViewIfNeeded(document.getElementById('IF-NEEDED'), {}),
      /*document
          .getElementById('IF-NEEDED')
          .scrollIntoView({ behavior: 'smooth', block: 'nearest' })*/ 3000
    )
  }

  render() {
    return (
      <div>
        <Head>
          <title>{description}</title>
        </Head>

        <Hero>
          <Wrapper>
            <Chrome />
            <ScrollWrapper>
              <TextIcon />
            </ScrollWrapper>
          </Wrapper>
        </Hero>
        <Section>
          <h1 style={{ display: 'inline-block', width: '440px' }}>
            {description}
          </h1>
        </Section>
        <Section>
          <List id={1} items={this.props.items} options={{ duration: 300 }} />
          <List
            boundary
            id={2}
            items={this.props.items}
            options={{ centerIfNeeded: true, duration: 300 }}
          />
          <List
            id={3}
            items={this.props.items}
            options={{
              offset: {
                top: -3,
                right: 9,
                bottom: 9,
                left: -3,
              },
            }}
          />
          <List id={4} items={this.props.items} />
        </Section>
        <Footer />
        <style jsx global>{`
          html,
          body {
            margin: 0;
            padding: 0;
          }
          body {
            font-family: ${systemFontStack};
          }
        `}</style>
      </div>
    )
  }
}
