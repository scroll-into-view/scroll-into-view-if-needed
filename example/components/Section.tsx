import styled from 'styled-components'
import { dimensions } from '../utils'

export interface SectionProps {
  children: React.ReactNode
  className?: string
}

const Wrapper = styled.section`
  margin-left: auto;
  margin-right: auto;
  padding: 20px 0;
  max-width: ${dimensions.maxWidth}px;
`

const Section: React.StatelessComponent<SectionProps> = ({
  children,
  ...props,
}) => <Wrapper {...props}>{children}</Wrapper>

export default Section
