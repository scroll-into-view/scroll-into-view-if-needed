import Link from 'next/link'

const suites = ['block', 'inline', 'scrollMode', 'boundary']

export default () => (
  <div
    style={{
      display: 'grid',
      margin: '0 auto',
      gridTemplateRows: 'repeat(auto-fill, minmax(200px, 1fr))',
      gridAutoRows: 'minmax(150px, auto)',
    }}
  >
    {suites.map((suite) => (
      <Link key={suite} href={`/${suite}`}>
        <a>{suite}</a>
      </Link>
    ))}
  </div>
)
