import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsFocused } from 'expo-router';
import { useProfile } from '@/hooks/use-profile';
import { runAutomaticAppUpdateCheck } from '@/services/app-update-alerts';
import { formatUnreadBadge, getUnreadCounts } from '@/services/unread-counts';
import { useAppTheme } from '@/theme/app-theme';

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const { t } = useTranslation('navigation');
  const { t: tSettings } = useTranslation('settings');
  const { profile } = useProfile();
  const unreadBadge = formatUnreadBadge(getUnreadCounts(profile).total);

  useEffect(() => {
    void runAutomaticAppUpdateCheck((key) => tSettings(key));
  }, [tSettings]);

  return (
    <NativeTabs
      iconColor={{ default: colors.secondaryLabel, selected: colors.accent }}
      tintColor={colors.accent}
    >
      <NativeTabs.Trigger name="(discover)">
        <NativeTabs.Trigger.Icon
          drawable="ic_tabler_compass_24"
          sf="safari.fill"
        />
        <NativeTabs.Trigger.Label>{t('tabs.discover')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(shelf)">
        <NativeTabs.Trigger.Icon
          drawable="ic_tabler_books_24"
          sf="book.closed.fill"
        />
        <NativeTabs.Trigger.Label>{t('tabs.shelf')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(history)">
        <NativeTabs.Trigger.Icon
          drawable="ic_tabler_history_24"
          sf="clock.fill"
        />
        <NativeTabs.Trigger.Label>{t('tabs.history')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(community)">
        <NativeTabs.Trigger.Icon
          drawable="ic_tabler_messages_24"
          sf="text.bubble.fill"
        />
        <NativeTabs.Trigger.Label>{t('tabs.community')}</NativeTabs.Trigger.Label>
        {unreadBadge ? (
          <NativeTabs.Trigger.Badge>
            {unreadBadge}
          </NativeTabs.Trigger.Badge>
        ) : null}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(search)">
        <NativeTabs.Trigger.Icon
          drawable="ic_tabler_search_24"
          sf="magnifyingglass"
        />
        <NativeTabs.Trigger.Label>{t('tabs.search')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
