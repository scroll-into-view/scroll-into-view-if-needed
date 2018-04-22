import styled from 'styled-components'

const { version } = require('scroll-into-view-if-needed/package.json')

const Wrapper = styled.footer`
  margin-top: 20px;
  text-align: center;
`

export default () => (
  <Wrapper className="footer">
    <a href="https://github.com/stipsan/scroll-into-view-if-needed">GitHub</a>
    <p>version: {version}</p>
  </Wrapper>
)
