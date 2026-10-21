import { Host, RNHostView } from '@expo/ui/jetpack-compose';
import { width as composeWidth } from '@expo/ui/jetpack-compose/modifiers';
import type { ViewEvent } from '@expo/ui/jetpack-compose';
import { requireNativeView } from 'expo';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import type { NativeBottomSheetProps } from './native-bottom-sheet';

type NativeViewProps = Omit<NativeBottomSheetProps, 'onDismiss'> &
  ViewEvent<'onDismissRequest', { value: boolean }>;

const NativeView = requireNativeView<NativeViewProps>('NovellaUi', 'BottomSheet');

const MATERIAL_SHEET_MAX_WIDTH = 640;

export function NativeBottomSheet({
  children,
  containerColor,
  fitToContents = false,
  onDismiss,
  ...props
}: NativeBottomSheetProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MATERIAL_SHEET_MAX_WIDTH);
  return (
    <Host pointerEvents="none" style={[styles.host, { width }]}>
      <NativeView
        {...props}
        containerColor={containerColor}
        onDismissRequest={onDismiss}
      >
        {/* The Compose BottomSheet owns the base surface. Keeping the hosted
            Android view transparent avoids unclipped full-height rectangles
            when partial sheets translate or resize their RN content. */}
        <RNHostView
          layoutRoot
          matchContents={fitToContents}
          modifiers={fitToContents ? [composeWidth(contentWidth)] : []}
        >
          <View
            style={fitToContents ? [styles.fitContent, { width: contentWidth }] : styles.fill}
          >
            {children}
          </View>
        </RNHostView>
      </NativeView>
    </Host>
  );
}

const styles = StyleSheet.create({
  fill: { flexGrow: 1, height: 0 },
  fitContent: { alignSelf: 'stretch' },
  host: { position: 'absolute' },
});
