import { Component } from 'react'
import Head from 'next/head'
import Section from '../components/Section'
import Footer from '../components/Footer'
import List from '../components/List'

export interface TestsPageProps {
  items: number[]
}

const { description } = require('scroll-into-view-if-needed/package.json')

// @TODO legacy
export default class TestsPage extends Component<TestsPageProps> {
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
      </div>
    )
  }
}
