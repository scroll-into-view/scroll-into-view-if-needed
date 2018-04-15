import styled from 'styled-components'

export interface SectionProps {
  children: React.ReactNode
  className?: string
}

const Wrapper = styled.section`
  margin-left: auto;
  margin-right: auto;
  max-width: 780px;
`

const Section: React.StatelessComponent<SectionProps> = ({
  children,
  ...props,
}) => <Wrapper {...props}>{children}</Wrapper>

export default Section
