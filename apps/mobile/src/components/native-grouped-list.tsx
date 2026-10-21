import type { PropsWithChildren, ReactElement, ReactNode } from 'react';

import {
  NativeGroupedListPlatform,
  NativeGroupedListRowPlatform,
  NativeGroupedListSectionPlatform,
} from '@/components/native-grouped-list-platform';
import type { NativeIconName } from '@/components/native-icon';
import {
  NativeIconSetProvider,
  type NativeIconSet,
} from '@/components/native-icon-set-context';

export interface NativeGroupedListProps extends PropsWithChildren {
  iconSet?: NativeIconSet;
  largeTitle?: boolean;
  onBackPress?: () => void;
  showBackButton?: boolean;
  testID?: string;
  title?: string;
}

export function NativeGroupedList({
  children,
  iconSet = 'tabler',
  largeTitle,
  onBackPress,
  showBackButton,
  testID,
  title,
}: NativeGroupedListProps) {
  return (
    <NativeIconSetProvider value={iconSet}>
      <NativeGroupedListPlatform
        {...(largeTitle === undefined ? {} : { largeTitle })}
        {...(onBackPress ? { onBackPress } : {})}
        {...(showBackButton === undefined ? {} : { showBackButton })}
        {...(testID ? { testID } : {})}
        {...(title ? { title } : {})}
      >
        {children}
      </NativeGroupedListPlatform>
    </NativeIconSetProvider>
  );
}

export interface NativeGroupedListSectionProps extends PropsWithChildren {
  /** React Native content centered below the section, such as a brand mark. */
  footer?: ReactElement | undefined;
  title: string;
}

export function NativeGroupedListSection({ children, footer, title }: NativeGroupedListSectionProps) {
  return (
    <NativeGroupedListSectionPlatform title={title}>
      {children}
      {footer}
    </NativeGroupedListSectionPlatform>
  );
}

export interface NativeGroupedListRowProps {
  description?: string;
  disabled?: boolean;
  icon: NativeIconName;
  onPress?: () => void;
  title: string;
  trailing?: ReactNode;
}

export function NativeGroupedListRow(props: NativeGroupedListRowProps) {
  return <NativeGroupedListRowPlatform {...props} />;
}
