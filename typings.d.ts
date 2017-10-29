interface ScrollIntoViewIfNeededOptions {
  centerIfNeeded?: boolean;
  duration?: number;
  easing?: 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'linear';
}

declare function scrollIntoViewIfNeeded(
  node: Element,
  centerIfNeeded: boolean,
  options?: ScrollIntoViewIfNeededOptions,
  finalElement?: Element
): void;

export = scrollIntoViewIfNeeded;
