import { useEffect, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shouldUseReaderSideChrome } from '@/services/reader-display-layout';
import { getReaderVerticalBarEdge } from '@/services/reader-side-chrome';

// Whether the reader should put its title and progress into the system's vertical edge bar.
export function useReaderSideChrome(): boolean {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isPad = Platform.OS === 'ios' && Platform.isPad;
  const [sideChrome, setSideChrome] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let active = true;
    // The trait can trail a rotation or a fold by one commit.
    const frame = requestAnimationFrame(() => {
      void getReaderVerticalBarEdge()
        .then((edge) => {
          if (!active) return;
          if (edge === null) {
            setSideChrome(shouldUseReaderSideChrome(width, height, isPad));
            return;
          }
          setSideChrome(edge !== 'unspecified');
        })
        .catch(() => {
          if (active) setSideChrome(false);
        });
    });
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [height, isPad, width, insets.bottom, insets.left, insets.right, insets.top]);

  return sideChrome;
}
