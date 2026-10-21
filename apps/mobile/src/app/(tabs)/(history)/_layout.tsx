import Stack from 'expo-router/stack';
import { useTranslation } from 'react-i18next';

import { useRootPageTitle } from '@/hooks/use-wide-layout';
import { useSystemScreenStackPreset } from '@/theme/stack-preset';

export default function HistoryStackLayout() {
  const { t } = useTranslation('navigation');
  const isAndroid = process.env.EXPO_OS === 'android';
  const systemScreenStackPreset = useSystemScreenStackPreset();
  const rootTitle = useRootPageTitle(t('tabs.history'));

  return (
    <Stack screenOptions={systemScreenStackPreset}>
      <Stack.Screen
        name="history"
        options={{
          headerLargeTitle: !isAndroid,
          headerShown: !isAndroid,
          title: t('tabs.history'),
        }}
      />
    </Stack>
  );
}
