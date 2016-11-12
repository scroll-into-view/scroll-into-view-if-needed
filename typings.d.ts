module 'scroll-into-view-if-needed' {
  interface ScrollIntoViewIfNeededOptions {
    centerIfNeeded: boolean;
    duration: number;
    easing: 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'linear';
  }

  interface ScrollIntoViewIfNeededFunction {
    (
      node: Element,
      centerIfNeeded: boolean = false,
      options: ScrollIntoViewIfNeededOptions = {
        centerIfNeeded: false,
        duration: 0,
        easing: 'ease',
      }
    ): void;
  }
  const ScrollIntoViewIfNeeded: ScrollIntoViewIfNeededFunction;
  export default ScrollIntoViewIfNeeded;
}
