import { requireNativeView } from 'expo';
import type { ComponentType } from 'react';
import { StyleSheet, type ViewProps } from 'react-native';

export interface NativeSearchBarProps extends ViewProps {
  clearAccessibilityLabel?: string;
  enabled?: boolean;
  onQueryChange?: (query: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  query?: string;
}

type NativeViewProps = Omit<
  NativeSearchBarProps,
  'clearAccessibilityLabel' | 'onQueryChange' | 'onSearch'
> & {
  onQueryChange?: (event: { nativeEvent: { value: string } }) => void;
  onSearch?: (event: { nativeEvent: { value: string } }) => void;
};

const NativeView = requireNativeView<NativeViewProps>(
  'NovellaUi',
  'SearchBar',
) as ComponentType<NativeViewProps>;

export function NativeSearchBar({
  clearAccessibilityLabel: _clearAccessibilityLabel,
  onQueryChange,
  onSearch,
  ...props
}: NativeSearchBarProps) {
  return (
    <NativeView
      {...props}
      onQueryChange={({ nativeEvent: { value } }) => onQueryChange?.(value)}
      onSearch={({ nativeEvent: { value } }) => onSearch?.(value)}
      style={styles.nativeView}
    />
  );
}

const styles = StyleSheet.create({
  nativeView: { flex: 1, width: '100%' },
});
