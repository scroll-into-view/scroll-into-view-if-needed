import { PureComponent, Fragment } from 'react'
import styled from 'styled-components'
import { format } from '../utils'
import SyntaxHighlighter, { registerLanguage } from "react-syntax-highlighter/prism-light";
import js from 'react-syntax-highlighter/languages/prism/javascript';
import prism from 'react-syntax-highlighter/styles/prism/prism'; 
 
registerLanguage('javascript', js);

const StyledSyntaxHighlighter = styled(SyntaxHighlighter).attrs({className: 'is-flex'})`
  height: 100%;
`

class Code extends PureComponent<{children: string}> {
  render() {
    const formattedCode = format(this.props.children)
    return (
      <Fragment>
        <StyledSyntaxHighlighter className="is-flex" language='javascript' style={prism}>{formattedCode}</StyledSyntaxHighlighter>
      </Fragment>
    )
  }
}

export default Code
