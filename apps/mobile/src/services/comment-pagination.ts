import type { CommentPage } from '@novella/api-client';

import { mergeCommunityItems } from './community-utils.ts';

export interface AppendedCommentPage {
  hasMore: boolean;
  hasNewItems: boolean;
  page: CommentPage;
}

// Keep the requested page as the client cursor.
export function normalizeCommentPage(page: CommentPage, requestedPage: number): CommentPage {
  return {
    ...page,
    page: requestedPage,
    totalPages: Math.max(0, page.totalPages, requestedPage),
  };
}

export function appendCommentPage(
  current: CommentPage,
  incoming: CommentPage,
  requestedPage: number,
): AppendedCommentPage {
  const items = mergeCommunityItems(current.items, incoming.items);
  const page = normalizeCommentPage({ ...incoming, items }, requestedPage);
  const hasNewItems = items.length > current.items.length;

  // A non-empty response is evidence that another page may exist even when TotalPages is stale or under-reported.
  return {
    hasMore: hasNewItems && incoming.items.length > 0,
    hasNewItems,
    page,
  };
}

export function nextCommentPage(
  page: Pick<CommentPage, 'items' | 'totalPages'>,
  requestedPage: number,
): number | null {
  if (!Number.isSafeInteger(requestedPage) || requestedPage < 1) return null;
  if (page.items.length === 0) return null;
  if (page.totalPages > requestedPage) return requestedPage + 1;
  // Keep one continuation for non-empty pages when metadata under-reports the
  // available pages. Duplicate-page protection lives in appendCommentPage.
  return requestedPage + 1;
}
