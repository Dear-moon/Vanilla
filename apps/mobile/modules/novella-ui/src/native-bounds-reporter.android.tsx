import { View } from 'react-native';

import type { NativeBoundsReporterProps } from './native-bounds-reporter';

export function NativeBoundsReporter({ onBoundsChange, onLayout, ...props }: NativeBoundsReporterProps) {
  return (
    <View
      {...props}
      onLayout={(event) => {
        onLayout?.(event);
        const { height, width } = event.nativeEvent.layout;
        onBoundsChange?.({ height, width });
      }}
    />
  );
}
