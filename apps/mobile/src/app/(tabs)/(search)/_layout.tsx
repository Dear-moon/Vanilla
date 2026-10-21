import Stack from 'expo-router/stack';
import { useTranslation } from 'react-i18next';

import { useRootPageTitle } from '@/hooks/use-wide-layout';
import { useSystemScreenStackPreset } from '@/theme/stack-preset';

export default function SearchStackLayout() {
  const { t } = useTranslation('navigation');
  const isAndroid = process.env.EXPO_OS === 'android';
  const systemScreenStackPreset = useSystemScreenStackPreset();
  const rootTitle = useRootPageTitle(t('tabs.search'));

  return (
    <Stack screenOptions={systemScreenStackPreset}>
      <Stack.Screen
        name="search"
        options={{
          headerLargeTitle: !isAndroid,
          headerShown: !isAndroid,
          title: t('tabs.search'),
        }}
      />
    </Stack>
  );
}
