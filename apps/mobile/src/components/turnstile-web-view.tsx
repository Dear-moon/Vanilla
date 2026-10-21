import { useCallback, useMemo, type ComponentType, type Ref } from 'react';
import { Linking, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import type {
  AndroidWebViewProps,
  IOSWebViewProps,
  ShouldStartLoadRequest,
  WebViewMessageEvent,
  WebViewOpenWindowEvent,
} from 'react-native-webview/lib/WebViewTypes';

import { useAppLocale } from '@/localization/localization-provider';
import {
  TURNSTILE_ORIGIN,
  TURNSTILE_WIDGET_HEIGHT,
  buildTurnstileHtml,
  parseTurnstileMessage,
  type TurnstileAction,
  type TurnstileAppearance,
  type TurnstileMessage,
} from '@/services/turnstile';
import { useAuthPalette } from '@/theme/auth-theme';

export interface TurnstileWebViewInstance {
  injectJavaScript(script: string): void;
}

/** Starts a new challenge on the rendered widget; a page whose script failed reports an error instead. */
export const TURNSTILE_RESET_SCRIPT = 'window.novellaTurnstileReset && window.novellaTurnstileReset(); true;';

// The package's cross-platform prop intersection collapses to never with these React types.
const ChallengeWebView = WebView as unknown as ComponentType<IOSWebViewProps
  & Pick<AndroidWebViewProps, 'onRenderProcessGone'>
  & { ref?: Ref<TurnstileWebViewInstance> | undefined }>;

// The deployment origin is required for Turnstile hostname validation.
export function TurnstileWebView({
  action,
  appearance,
  onMessage,
  ref,
}: {
  action: TurnstileAction;
  appearance: TurnstileAppearance;
  onMessage: (message: TurnstileMessage) => void;
  ref?: Ref<TurnstileWebViewInstance>;
}) {
  const palette = useAuthPalette();
  const locale = useAppLocale();
  const theme = palette.isDark ? 'dark' : 'light';
  const source = useMemo(() => ({
    baseUrl: TURNSTILE_ORIGIN,
    html: buildTurnstileHtml({
      action,
      appearance,
      language: locale === 'zh-TW' ? 'zh-tw' : 'zh-cn',
      theme,
    }),
  }), [action, appearance, locale, theme]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    const message = parseTurnstileMessage(event.nativeEvent.data);
    if (message) onMessage(message);
  }, [onMessage]);

  const handleWebViewFailure = useCallback(() => {
    onMessage({ type: 'error', code: 'webview' });
  }, [onMessage]);

  const onShouldStartLoadWithRequest = useCallback((request: ShouldStartLoadRequest) => {
    if (!request.isTopFrame || request.url.startsWith(TURNSTILE_ORIGIN) || request.url.startsWith('about:')) {
      return true;
    }
    // Links inside the widget (privacy, help) belong in the browser.
    void Linking.openURL(request.url).catch(() => undefined);
    return false;
  }, []);

  return (
    <ChallengeWebView
      allowsLinkPreview={false}
      bounces={false}
      hideKeyboardAccessoryView
      onContentProcessDidTerminate={handleWebViewFailure}
      onError={handleWebViewFailure}
      onRenderProcessGone={handleWebViewFailure}
      onMessage={handleMessage}
      onOpenWindow={(event: WebViewOpenWindowEvent) => void Linking.openURL(event.nativeEvent.targetUrl).catch(() => undefined)}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      originWhitelist={['*']}
      ref={ref}
      scrollEnabled={false}
      source={source}
      style={styles.webView}
      textInteractionEnabled={false}
      webviewDebuggingEnabled={__DEV__}
    />
  );
}

const styles = StyleSheet.create({
  webView: { backgroundColor: 'transparent', height: TURNSTILE_WIDGET_HEIGHT },
});
