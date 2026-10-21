import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Keeps interactive content clear of the vertical toolbars and tab bars iOS places on the leading or trailing edge on iPhone Duo and in resizable windows.
export function HorizontalSafeArea({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { left, right } = useSafeAreaInsets();
  return (
    // Keep Fabric children attached so native navigation finds the scroll view.
    <View collapsable={false} style={[style, { paddingLeft: left, paddingRight: right }]}>
      {children}
    </View>
  );
}
