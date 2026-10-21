import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useWindowDimensions } from 'react-native';
import {
  useSafeAreaInsets,
  type EdgeInsets,
} from 'react-native-safe-area-context';

export const LAYOUT_SETTLE_MS = 140;

export interface SettledLayout {
  height: number;
  insets: EdgeInsets;
  width: number;
}

const SettledLayoutContext = createContext<SettledLayout | null>(null);

// Publishes the window metrics a layout decision should use.
export function SettledLayoutProvider({ children }: { children: ReactNode }) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [settled, setSettled] = useState<SettledLayout>(() => ({
    height,
    insets,
    width,
  }));
  const settledRef = useRef(settled);

  useEffect(() => {
    const current = settledRef.current;
    if (
      current.height === height &&
      current.width === width &&
      sameInsets(current.insets, insets)
    ) {
      return;
    }
    const timer = setTimeout(() => {
      const next = { height, insets, width };
      settledRef.current = next;
      setSettled(next);
    }, LAYOUT_SETTLE_MS);
    return () => clearTimeout(timer);
  }, [height, insets, width]);

  return (
    <SettledLayoutContext.Provider value={settled}>
      {children}
    </SettledLayoutContext.Provider>
  );
}

// The settled window metrics.
export function useSettledLayout(): SettledLayout {
  const settled = useContext(SettledLayoutContext);
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return settled ?? { height, insets, width };
}

function sameInsets(a: EdgeInsets, b: EdgeInsets): boolean {
  return (
    a.top === b.top &&
    a.bottom === b.bottom &&
    a.left === b.left &&
    a.right === b.right
  );
}
