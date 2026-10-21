import { isLiquidGlassAvailable } from 'expo-glass-effect';
import Stack from 'expo-router/stack';
import { useMemo } from 'react';
import { Platform } from 'react-native';

import { useAppTheme } from '@/theme/app-theme';

type StackScreenOptions = NonNullable<
  React.ComponentProps<typeof Stack>['screenOptions']
>;

const hasLiquidGlass = isLiquidGlassAvailable();

export function useSystemScreenStackPreset(): StackScreenOptions {
  const { colorScheme, colors } = useAppTheme();

  return useMemo(() => ({
    contentStyle: { backgroundColor: colors.background },
    headerBackButtonDisplayMode: 'minimal',
    ...(Platform.OS === 'ios'
      ? {
          headerBlurEffect: hasLiquidGlass ? undefined : 'systemMaterial',
          headerTransparent: hasLiquidGlass,
        }
      : {}),
    headerLargeTitleShadowVisible: false,
    headerShadowVisible: false,
    headerTintColor: colors.accent,
    headerTitleStyle: { color: colors.label as string },
    headerTransparent: hasLiquidGlass,
    // iOS 27 ignores UIApplication's app-wide status bar API, so the style comes from the screen's view controller.
    statusBarStyle: colorScheme === 'dark' ? 'light' : 'dark',
  }), [colorScheme, colors]);
}
