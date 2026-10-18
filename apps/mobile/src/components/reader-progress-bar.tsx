import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import { NativeReaderProgressBar } from '../../modules/novella-ui';

import type { ReaderNativeProgressBarProps } from '@/components/reader-progress-bar.types';
import { snapReaderProgress } from '@/services/reader-page-progress';
import { useAppTheme } from '@/theme/app-theme';

/** Fallback for platforms without a native progress bar; Android uses
 * {@link ./reader-progress-bar.android.tsx}, which hosts the Compose view. */
export function ReaderNativeProgressBar({
  direction,
  disabled,
  onProgressChange,
  pageCurrent,
  pageTotal,
  progress,
  remainingText,
  step,
}: ReaderNativeProgressBarProps) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const [draft, setDraft] = useState(progress);
  const isReversed = direction === 'rtl';

  useEffect(() => setDraft(progress), [progress]);

  // The native track is left-to-right; mirroring and page snapping stay here so
  // the reader's progress semantics live in one place.
  const displayedProgress = disabled ? 1 : isReversed ? 1 - draft : draft;
  const handleChange = (value: number) => {
    if (disabled) return;
    const next = isReversed ? 1 - value : value;
    const snapped = step > 0 ? snapReaderProgress(next, pageTotal) : next;
    setDraft(snapped);
    onProgressChange(snapped);
  };

  return (
    <NativeReaderProgressBar
      accentColor={colors.accent}
      currentPage={pageCurrent}
      direction={direction}
      disabled={disabled}
      onProgressChange={(event) => handleChange(event.nativeEvent.value)}
      progress={displayedProgress}
      remainingText={remainingText}
      style={{ height: 40, width: Math.max(1, width - 32) }}
      totalPages={pageTotal}
    />
  );
}
