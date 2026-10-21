import type { ReaderMode } from '@novella/reader-engine';

export interface ReaderPageProgress {
  current: number;
  progress: number;
  total: number;
}

export function snapReaderProgress(value: number, pageTotal: number): number {
  const total = Math.max(0, Math.trunc(pageTotal));
  if (total === 0) return 0;
  if (total === 1) return 1;
  const safeValue = clampProgress(value);
  return Math.round(safeValue * (total - 1)) / (total - 1);
}

export function readerProgressStep(pageTotal: number): number {
  const total = Math.max(0, Math.trunc(pageTotal));
  return total <= 1 ? 1 : 1 / (total - 1);
}

export interface ReaderProgressSliderState {
  /** The thumb is pinned at 100% and cannot be dragged. */
  disabled: boolean;
  /** Where the thumb sits, before RTL or pixel mapping. */
  progress: number;
  /** The fraction one step covers. */
  step: number;
  /** Whether the value snaps to page positions rather than 1% increments. */
  stepped: boolean;
}

// The reader's slider uses progression for its value, but a paged chapter can step by its measured pages.
export function resolveReaderProgressSliderState({
  displayMode,
  pageCurrent = 0,
  pageStepped,
  pageTotal,
  progress,
}: {
  displayMode: 'pages' | 'percentage';
  pageCurrent?: number;
  pageStepped: boolean;
  pageTotal: number;
  progress: number;
}): ReaderProgressSliderState {
  const isPercentage = displayMode === 'percentage';
  const total = Math.max(0, Math.trunc(pageTotal));
  const stepped = total > 1 && (!isPercentage || pageStepped);
  const disabled = isPercentage ? total === 1 : total <= 1;
  const current = Math.trunc(pageCurrent);
  return {
    disabled,
    progress: disabled
      ? 1
      : stepped
        ? current >= 1
          ? (Math.min(current, total) - 1) / (total - 1)
          : snapReaderProgress(progress, total)
        : clampProgress(progress),
    step: stepped ? readerProgressStep(total) : isPercentage ? 0.01 : 1,
    stepped,
  };
}

// Where a novel slider value sends the reader.
export function resolveNovelProgressTarget({
  paged,
  screenTotal,
  value,
}: {
  paged: boolean;
  screenTotal: number;
  value: number;
}): { progression: number; screenIndex: number | null } {
  const progress = clampProgress(value);
  const total = Math.max(0, Math.trunc(screenTotal));
  if (!paged || total <= 1) return { progression: progress, screenIndex: null };
  const screenIndex = Math.round(progress * (total - 1));
  return { progression: (screenIndex + 0.5) / total, screenIndex };
}

export interface ReaderPagePosition {
  current: number;
  total: number;
}

// The page a paged reader shows, for both the comic and the novel reader.
export function resolveReaderPagePosition({
  columnCount = 1,
  columnTotal = 0,
  displayMode,
  pageCurrent,
  pageStepped = false,
  pageTotal,
  progress,
}: {
  columnCount?: number;
  columnTotal?: number;
  displayMode: 'pages' | 'percentage';
  pageCurrent: number;
  pageStepped?: boolean;
  pageTotal: number;
  progress: number;
}): ReaderPagePosition | null {
  const total = Math.max(0, Math.trunc(pageTotal));
  if (total === 0) return null;
  if (displayMode === 'percentage' && !pageStepped) return null;
  const screen = pageCurrent >= 1
    ? Math.min(Math.max(Math.trunc(pageCurrent), 1), total)
    : Math.min(total, Math.max(1, Math.round(snapReaderProgress(progress, total) * (total - 1)) + 1));
  if (displayMode === 'pages') return { current: screen, total };
  const perScreen = columnCount >= 2 ? 2 : 1;
  const pages = columnTotal >= 1 ? Math.trunc(columnTotal) : total * perScreen;
  return { current: Math.min(pages, screen * perScreen), total: pages };
}

export interface ReaderSideProgressInfo {
  /** `current/total`, or empty until the reader has measured a page count. */
  pageLabel: string;
  /** Whole-number percentage shown in the side bar capsule. */
  percent: number;
}

// Text for the compact side-bar progress capsule.
export function resolveReaderSideProgressInfo({
  columnCount,
  columnTotal,
  displayMode,
  pageCurrent,
  pageStepped = false,
  pageTotal,
  progress,
}: {
  columnCount?: number;
  columnTotal?: number;
  displayMode: 'pages' | 'percentage';
  pageCurrent: number;
  pageStepped?: boolean;
  pageTotal: number;
  progress: number;
}): ReaderSideProgressInfo {
  const total = Math.max(0, Math.trunc(pageTotal));
  const state = resolveReaderProgressSliderState({
    displayMode,
    pageCurrent,
    pageStepped,
    pageTotal,
    progress,
  });
  const percent = Math.round(
    (total > 0 ? state.progress : clampProgress(progress)) * 100,
  );
  const position = resolveReaderPagePosition({
    ...(columnCount === undefined ? {} : { columnCount }),
    ...(columnTotal === undefined ? {} : { columnTotal }),
    displayMode,
    pageCurrent,
    pageStepped,
    pageTotal,
    progress,
  });
  return {
    pageLabel: position ? `${position.current}/${position.total}` : '',
    percent,
  };
}

export function resolveComicPageProgress(index: number, total: number): ReaderPageProgress {
  const safeTotal = Math.max(0, Math.trunc(total));
  if (safeTotal === 0) return { current: 0, progress: 0, total: 0 };
  const safeIndex = clampIndex(index, safeTotal);
  return {
    current: safeIndex + 1,
    progress: progressForIndex(safeIndex, safeTotal),
    total: safeTotal,
  };
}

function clampIndex(value: number, total: number): number {
  const safeValue = Number.isFinite(value) ? Math.trunc(value) : 0;
  return Math.min(Math.max(0, safeValue), Math.max(0, total - 1));
}

function progressForIndex(index: number, total: number): number {
  return total <= 1 ? 1 : index / (total - 1);
}

function clampProgress(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

export interface NovelPageProgressOptions {
  mode: ReaderMode;
  offset: { x: number; y: number };
  pagedPageCount: number;
  totalHeight: number;
  viewportHeight: number;
  viewportWidth: number;
}

export function estimateNovelPageCount(totalHeight: number, pageHeight: number): number {
  const safeHeight = positiveDimension(totalHeight, 1);
  const safePageHeight = positiveDimension(pageHeight, 1);
  return Math.max(1, Math.ceil(safeHeight / safePageHeight));
}

export function resolveNovelPageProgress(
  options: NovelPageProgressOptions,
): ReaderPageProgress {
  if (options.mode === 'paged') {
    const total = Math.max(0, Math.trunc(options.pagedPageCount));
    if (total === 0) return { current: 0, progress: 0, total: 0 };
    const index = clampIndex(
      Math.round(safeNumber(options.offset.x) / positiveDimension(options.viewportWidth, 1)),
      total,
    );
    return {
      current: index + 1,
      progress: progressForIndex(index, total),
      total,
    };
  }

  if (options.totalHeight <= 0) return { current: 0, progress: 0, total: 0 };
  const total = estimateNovelPageCount(options.totalHeight, options.viewportHeight);
  const maximumOffset = Math.max(
    0,
    safeNumber(options.totalHeight) - positiveDimension(options.viewportHeight, 1),
  );
  const progress = total <= 1
    ? 1
    : maximumOffset === 0
      ? 1
      : clampProgress(safeNumber(options.offset.y) / maximumOffset);
  const index = clampIndex(Math.round(progress * Math.max(0, total - 1)), total);
  return { current: index + 1, progress, total };
}

function positiveDimension(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function safeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}
