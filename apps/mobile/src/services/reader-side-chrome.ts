import {
  requireNativeModule,
  type EventSubscription,
} from 'expo';

// The edge where iOS 27 places its vertical navigation bar.
export type ReaderVerticalBarEdge = 'leading' | 'trailing' | 'unspecified';

interface NovellaUiModule {
  getVerticalBarEdge(): Promise<ReaderVerticalBarEdge>;
  hideReaderLayoutTransition?(): Promise<void>;
  refreshReaderSideBar?(): Promise<void>;
  setReaderBottomToolbarHidden?(hidden: boolean): Promise<void>;
  setReaderBarInterfaceStyle?(style: 'dark' | 'light' | 'unspecified'): Promise<void>;
  setReaderLayoutTransitionAppearance?(dark: boolean): Promise<void>;
  showReaderLayoutTransition?(dark: boolean): Promise<void>;
  addListener?(
    eventName: 'onLayoutWillChange' | 'onLayoutDidChange',
    listener: () => void,
  ): EventSubscription;
}

const NativeNovellaUi = requireNativeModule<NovellaUiModule>('NovellaUi');

export function getReaderVerticalBarEdge(): Promise<ReaderVerticalBarEdge | null> {
  return NativeNovellaUi.getVerticalBarEdge?.() ?? Promise.resolve(null);
}

// Expo Router clears the bottom toolbar's items when its host unmounts but leaves the empty toolbar visible, which keeps reserving a bottom safe area.
export function setReaderBottomToolbarHidden(hidden: boolean): Promise<void> {
  return NativeNovellaUi.setReaderBottomToolbarHidden?.(hidden) ?? Promise.resolve();
}

// Liquid glass follows the trait collection, not the reader background.
export function setReaderBarInterfaceStyle(
  style: 'dark' | 'light' | 'unspecified',
): Promise<void> {
  return NativeNovellaUi.setReaderBarInterfaceStyle?.(style) ?? Promise.resolve();
}

// A fold moves the system bars to the other display and rebuilds the vertical column from the bar button items it already holds, so it never re-asks the screen for them.
export function refreshReaderSideBar(): Promise<void> {
  return NativeNovellaUi.refreshReaderSideBar?.() ?? Promise.resolve();
}

// Reported from the native window's size transition, before React Native's `useWindowDimensions` updates.
export function addReaderLayoutWillChangeListener(
  listener: () => void,
): EventSubscription | null {
  return NativeNovellaUi.addListener?.('onLayoutWillChange', listener) ?? null;
}

export function addReaderLayoutDidChangeListener(
  listener: () => void,
): EventSubscription | null {
  return NativeNovellaUi.addListener?.('onLayoutDidChange', listener) ?? null;
}

// Raises the transition blur over the whole window.
// The native side raises the cover itself when it sees the transition start, before the JS event can cross the bridge, so it needs the current blur style ahead of time.
export function setReaderLayoutTransitionAppearance(dark: boolean): void {
  NativeNovellaUi.setReaderLayoutTransitionAppearance?.(dark).catch(() => {});
}

export function showReaderLayoutTransitionCover(dark: boolean): void {
  NativeNovellaUi.showReaderLayoutTransition?.(dark).catch(() => {});
}

export function hideReaderLayoutTransitionCover(): void {
  NativeNovellaUi.hideReaderLayoutTransition?.().catch(() => {});
}
