import { useCallback, useState } from 'react';
import type { LayoutChangeEvent, ScrollView } from 'react-native';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import {
  runOnJS,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

interface DirectMessageScrollOptions {
  loaded: boolean;
  composerHeight: SharedValue<number>;
  bottomSafeArea: number;
}

export function useDirectMessageScroll({
  loaded,
  composerHeight,
  bottomSafeArea,
}: DirectMessageScrollOptions) {
  const scrollRef = useAnimatedRef<ScrollView>();
  const { height } = useReanimatedKeyboardAnimation();
  const contentHeight = useSharedValue(0);
  const viewportHeight = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const following = useSharedValue(true);
  const followRequest = useSharedValue(0);
  const initialPositioned = useSharedValue(false);
  const publishedAtEnd = useSharedValue(true);
  const [atEnd, setAtEnd] = useState(true);
  const [measured, setMeasured] = useState(false);
  const bottomInset = useDerivedValue(() =>
    composerHeight.value + Math.max(-height.value, bottomSafeArea),
  );
  // Android needs synthetic insets; ordinary ScrollView.contentInset is iOS-only.
  const extraContentPadding = useDerivedValue(() =>
    composerHeight.value + Math.max(0, bottomSafeArea + height.value),
  );
  const endOffset = useDerivedValue(() =>
    Math.max(0, contentHeight.value - viewportHeight.value + bottomInset.value),
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => { offsetY.value = event.contentOffset.y; },
    onBeginDrag: () => { following.value = false; },
    onEndDrag: (event) => {
      offsetY.value = event.contentOffset.y;
      if (Math.abs(event.velocity?.y ?? 0) < 0.1) {
        following.value = endOffset.value - event.contentOffset.y <= 20;
      }
    },
    onMomentumBegin: () => { following.value = false; },
    onMomentumEnd: (event) => {
      offsetY.value = event.contentOffset.y;
      following.value = endOffset.value - event.contentOffset.y <= 20;
    },
  });

  useAnimatedReaction(
    () => ({
      ready: loaded && composerHeight.value > 0 && contentHeight.value > 0 && viewportHeight.value > 0,
      target: endOffset.value,
      following: following.value,
      offset: offsetY.value,
      request: followRequest.value,
    }),
    (current, previous) => {
      if (!current.ready) return;
      if (current.following && (
        !previous?.ready || !previous.following || current.target !== previous.target ||
        current.request !== previous.request
      )) {
        scrollTo(scrollRef, 0, current.target, false);
      }
      if (!initialPositioned.value && Math.abs(current.target - current.offset) <= 1) {
        initialPositioned.value = true;
        runOnJS(setMeasured)(true);
      }
      const visible = current.following || current.target - current.offset <= 20;
      if (visible !== publishedAtEnd.value) {
        publishedAtEnd.value = visible;
        runOnJS(setAtEnd)(visible);
      }
    },
  );

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    viewportHeight.value = event.nativeEvent.layout.height;
  }, [viewportHeight]);
  const onContentSizeChange = useCallback((_width: number, value: number) => {
    contentHeight.value = value;
  }, [contentHeight]);
  const scrollToBottom = useCallback(() => {
    following.value = true;
    followRequest.value += 1;
  }, [followRequest, following]);

  return {
    animatedProps: undefined,
    extraContentPadding,
    atEnd,
    bottomInset,
    commitStyle: {},
    measured,
    onContentSizeChange,
    onLayout,
    onScroll,
    scrollRef,
    scrollToBottom,
  };
}
