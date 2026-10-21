export type ReaderChromePlatform = 'android' | 'ios' | 'web';

export interface ReaderChromeInsets {
  bottom: number;
  top: number;
}

export type ReaderChapterBarDirection = 'ltr' | 'rtl';
export type ReaderChapterBarAction = 'next' | 'previous';

export interface ReaderChapterBarOrder {
  left: ReaderChapterBarAction;
  right: ReaderChapterBarAction;
}

const CHROME_CONTENT_GAP = 16;
export const READER_TOOLBAR_HEIGHT = {
  android: { bottom: 56, top: 56 },
  ios: { bottom: 44, top: 44 },
} as const;

const SIDE_CHROME_CONTENT_GAP = 8;

export function resolveReaderChapterBarOrder(
  direction: ReaderChapterBarDirection,
): ReaderChapterBarOrder {
  return direction === 'rtl'
    ? { left: 'next', right: 'previous' }
    : { left: 'previous', right: 'next' };
}

export function createReaderChromeInsets(
  platform: ReaderChromePlatform | string | undefined,
  safeAreaTop: number,
  safeAreaBottom: number,
): ReaderChromeInsets {
  if (platform !== 'android' && platform !== 'ios') return { bottom: 0, top: 0 };
  const toolbar = READER_TOOLBAR_HEIGHT[platform];
  return {
    bottom: Math.max(0, safeAreaBottom) + toolbar.bottom + CHROME_CONTENT_GAP,
    top: Math.max(0, safeAreaTop) + toolbar.top + CHROME_CONTENT_GAP,
  };
}

// Insets for the vertical-bar layout.
export function createReaderSideChromeInsets(
  safeAreaTop: number,
  safeAreaBottom: number,
): ReaderChromeInsets {
  const inset = Math.max(0, safeAreaTop, safeAreaBottom) + SIDE_CHROME_CONTENT_GAP;
  return { bottom: inset, top: inset };
}
