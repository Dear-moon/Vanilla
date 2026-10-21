import type { WhatsNewRelease } from '@/services/whats-new';

// The release announced by the What's New sheet on the first launch after an update.
export const WHATS_NEW_RELEASE = {
  version: '2.6.0',
  highlights: [
    { id: 'foldable', icon: 'device' },
    { id: 'pages', icon: 'layout' },
    { id: 'messages', icon: 'messages' },
    { id: 'reader', icon: 'book' },
  ],
} as const satisfies WhatsNewRelease;
