// add support for styled-jsx attributes
import 'react'

declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean
    global?: boolean
  }
}

// add support for setting a global
declare global {
  interface Window {
    scrollIntoViewIfNeeded: any
  }
}
