import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type {
  NativeDirectMessageComposerHandle,
  NativeDirectMessageComposerProps,
} from './native-direct-message-composer';
import { createThemedStyles, useAppTheme } from '@/theme/app-theme';

export type {
  NativeDirectMessageComposerHandle,
  NativeDirectMessageComposerProps,
} from './native-direct-message-composer';

export const NativeDirectMessageComposer = forwardRef<
  NativeDirectMessageComposerHandle,
  NativeDirectMessageComposerProps
>(function NativeDirectMessageComposer(
  { accentColor, draft = '', enabled = true, maxLength, onDraftChange, onHeightChange, onSend, placeholder },
  ref,
) {
  const inputRef = useRef<TextInput>(null);
  const { bottom } = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = useComposerStyles();
  const { t } = useTranslation('messages');
  const [inputHeight, setInputHeight] = useState(40);

  useImperativeHandle(ref, () => ({
    async blur() { inputRef.current?.blur(); },
    async focus() { inputRef.current?.focus(); },
  }), []);

  return (
    <KeyboardStickyView offset={{ closed: -bottom, opened: 0 }} style={styles.container}>
      <View
        onLayout={(event) => onHeightChange?.(event.nativeEvent.layout.height)}
        style={styles.content}
      >
        <View style={styles.row}>
          <TextInput
            ref={inputRef}
            accessibilityLabel={placeholder}
            editable={enabled}
            maxLength={maxLength}
            multiline
            onChangeText={onDraftChange}
            onContentSizeChange={(event) => setInputHeight(
              Math.min(144, Math.max(40, event.nativeEvent.contentSize.height)),
            )}
            placeholder={placeholder}
            placeholderTextColor={colors.secondaryLabel}
            selectionColor={accentColor ?? colors.accent}
            style={[styles.input, { height: inputHeight }]}
            textAlignVertical="top"
            value={draft}
          />
          <Pressable
            accessibilityLabel={t('composer.send')}
            accessibilityRole="button"
            disabled={!enabled || !draft.trim()}
            onPress={() => onSend?.(draft)}
            style={({ pressed }) => [
              styles.send,
              (!enabled || !draft.trim() || pressed) && styles.dimmed,
            ]}
          >
            <Text style={[styles.sendLabel, { color: accentColor ?? colors.accent }]}>
              {t('composer.send')}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardStickyView>
  );
});

const useComposerStyles = createThemedStyles((colors) => StyleSheet.create({
  container: { bottom: 0, left: 0, position: 'absolute', right: 0 },
  content: { paddingBottom: 8, paddingHorizontal: 12, paddingTop: 8 },
  dimmed: { opacity: 0.4 },
  input: { color: colors.label, flex: 1, fontSize: 16, paddingHorizontal: 12, paddingVertical: 10 },
  row: { alignItems: 'flex-end', backgroundColor: colors.surfaceContainerHighest, borderRadius: 24, flexDirection: 'row', padding: 4 },
  send: { justifyContent: 'center', minHeight: 40, paddingHorizontal: 12 },
  sendLabel: { fontSize: 15, fontWeight: '600' },
}));
