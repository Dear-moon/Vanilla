import { Platform, StyleSheet, Text } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { READER_TOOLBAR_HEIGHT } from '@/services/reader-chrome-layout';

const FADE_DURATION_MS = 220;
const EASING = Easing.bezier(0.22, 1, 0.36, 1);
const FADE_IN = FadeIn.duration(FADE_DURATION_MS).easing(EASING);
const FADE_OUT = FadeOut.duration(FADE_DURATION_MS).easing(EASING);
const SIDE_MARGIN = 24;

export interface ReaderCollapsedInfoProps {
  /** Bottom of the hidden toolbar: the page's stable bottom safe area. */
  bottom: number;
  color: string;
  /** `current / total`, or empty until the chapter is measured. */
  pageLabel: string;
  title: string;
  /** Top of the hidden title bar: the page's stable top safe area. */
  top: number;
  visible: boolean;
}

// Paged layouts leave the hidden toolbar bands clear for faint reading information.
export function ReaderCollapsedInfo({
  bottom,
  color,
  pageLabel,
  title,
  top,
  visible,
}: ReaderCollapsedInfoProps) {
  const insets = useSafeAreaInsets();
  const toolbar = READER_TOOLBAR_HEIGHT[Platform.OS === 'android' ? 'android' : 'ios'];
  if (!visible) return null;

  const sides = {
    left: insets.left + SIDE_MARGIN,
    right: insets.right + SIDE_MARGIN,
  };
  return (
    <>
      {title ? (
        <Animated.View
          entering={FADE_IN}
          exiting={FADE_OUT}
          accessibilityElementsHidden
          pointerEvents="none"
          style={[styles.band, sides, { height: toolbar.top, top }]}
        >
          <Text ellipsizeMode="tail" numberOfLines={1} style={[styles.text, { color }]}>
            {title}
          </Text>
        </Animated.View>
      ) : null}
      {pageLabel ? (
        <Animated.View
          entering={FADE_IN}
          exiting={FADE_OUT}
          accessibilityElementsHidden
          pointerEvents="none"
          style={[styles.band, sides, { bottom, height: toolbar.bottom }]}
        >
          <Text numberOfLines={1} style={[styles.text, styles.page, { color }]}>
            {pageLabel}
          </Text>
        </Animated.View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  band: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  page: {
    fontVariant: ['tabular-nums'],
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.45,
    textAlign: 'center',
  },
});
