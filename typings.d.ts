declare module 'scroll-into-view-if-needed' {
  interface ScrollIntoViewIfNeededOptions {
    centerIfNeeded: boolean;
    duration: number;
    easing: 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'linear';
  }

  interface ScrollIntoViewIfNeededFunction {
    (
      node: Element,
      centerIfNeeded: boolean,
      options: ScrollIntoViewIfNeededOptions,
    ): void;
  }
  const ScrollIntoViewIfNeeded: ScrollIntoViewIfNeededFunction;
  export default ScrollIntoViewIfNeeded;
}
