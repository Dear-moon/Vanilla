import { requireNativeView } from 'expo';
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentType,
  type Ref,
} from 'react';
import { StyleSheet, type ColorValue, type ViewProps } from 'react-native';

export interface NativeDirectMessageComposerHandle {
  blur(): Promise<void>;
  focus(): Promise<void>;
}

export interface NativeDirectMessageComposerProps extends ViewProps {
  accentColor?: ColorValue;
  draft?: string;
  enabled?: boolean;
  maxLength?: number;
  onDraftChange?: (value: string) => void;
  onHeightChange?: (height: number) => void;
  onSend?: (value: string) => void;
  placeholder?: string;
}

type NativeViewProps = Omit<
  NativeDirectMessageComposerProps,
  'onDraftChange' | 'onHeightChange' | 'onSend'
> & {
  onDraftChange?: (event: { nativeEvent: { value: string } }) => void;
  onHeightChange?: (event: { nativeEvent: { height: number } }) => void;
  onSend?: (event: { nativeEvent: { value: string } }) => void;
};

type NativeViewPropsWithRef = NativeViewProps & {
  ref?: Ref<NativeDirectMessageComposerHandle>;
};

const NativeView = requireNativeView<NativeViewProps>(
  'NovellaUi',
  'DirectMessageComposer',
) as ComponentType<NativeViewPropsWithRef>;

// Native layout keeps keyboard tracking independent of JS draft updates.
export const NativeDirectMessageComposer = forwardRef<
  NativeDirectMessageComposerHandle,
  NativeDirectMessageComposerProps
>(function NativeDirectMessageComposer(
  { onDraftChange, onHeightChange, onSend, ...props },
  ref,
) {
  const nativeViewRef = useRef<NativeDirectMessageComposerHandle>(null);

  useImperativeHandle(ref, () => ({
    blur() {
      return nativeViewRef.current?.blur() ?? Promise.resolve();
    },
    focus() {
      return nativeViewRef.current?.focus() ?? Promise.resolve();
    },
  }), []);

  return (
    <NativeView
      {...props}
      ref={nativeViewRef}
      onDraftChange={({ nativeEvent: { value } }) => onDraftChange?.(value)}
      onHeightChange={({ nativeEvent: { height } }) => onHeightChange?.(height)}
      onSend={({ nativeEvent: { value } }) => onSend?.(value)}
      style={styles.nativeView}
    />
  );
});

const styles = StyleSheet.create({
  // Native hit testing passes touches outside the composer to the transcript.
  nativeView: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
});
