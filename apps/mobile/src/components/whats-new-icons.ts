import {
  IconBook2,
  IconDeviceMobileRotated,
  IconLayoutDashboard,
  IconMessages,
} from '@tabler/icons-react-native';
import type { ComponentType } from 'react';

import type { WhatsNewIconKey } from '@/services/whats-new';

type WhatsNewIcon = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

// The icon a release highlight names in `WHATS_NEW_RELEASE`.
export const WHATS_NEW_ICONS: Readonly<Record<WhatsNewIconKey, WhatsNewIcon>> = {
  book: IconBook2,
  device: IconDeviceMobileRotated,
  layout: IconLayoutDashboard,
  messages: IconMessages,
};
