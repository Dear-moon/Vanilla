import { requireNativeModule } from 'expo';

interface NovellaUiModule {
  applyWordJoiners?(text: string, locale: string): Promise<string>;
}

const NativeNovellaUi = requireNativeModule<NovellaUiModule>('NovellaUi');

// Join the characters of each Chinese word with U+2060 WORD JOINER so CoreText breaks lines between words rather than between any two characters.
export async function insertWordJoiners(
  text: string,
  locale: string,
): Promise<string> {
  if (!NativeNovellaUi.applyWordJoiners) return text;
  try {
    return await NativeNovellaUi.applyWordJoiners(text, locale);
  } catch {
    return text;
  }
}
