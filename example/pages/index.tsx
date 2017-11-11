import { Component } from 'react'
import Head from 'next/head'
import systemFontStack from 'system-font-stack'
import Section from '../components/Section'
import Footer from '../components/Footer'
import List from '../components/List'

export interface IndexPageProps {
  items: number[]
}

const { description } = require('scroll-into-view-if-needed/package.json')

export default class IndexPage extends Component<IndexPageProps> {
  static defaultProps = {
    items: Array.apply(null, { length: 100 }).map(Number.call, Number),
  }

  render() {
    return (
      <div>
        <Head>
          <title>{description}</title>
        </Head>
        <Section>
          <h1 style={{ display: 'inline-block', width: '440px' }}>
            {description}
          </h1>
        </Section>
        <Section>
          <List items={this.props.items} />
        </Section>
        <Footer />
        <style jsx global>{`
          body {
            font-family: ${systemFontStack};
          }
        `}</style>
      </div>
    )
  }
}
