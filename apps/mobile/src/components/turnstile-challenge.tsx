import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref, type RefObject } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  TURNSTILE_RESET_SCRIPT,
  TurnstileWebView,
  type TurnstileWebViewInstance,
} from '@/components/turnstile-web-view';
import {
  TURNSTILE_CANCELLED,
  TurnstileError,
  type TurnstileAction,
  type TurnstileMessage,
} from '@/services/turnstile';
import { showAlert } from '@/components/native-alert-dialog';
import {
  closeTurnstileSession,
  isTurnstileSessionPresented,
  openTurnstileSession,
  type TurnstileSession,
} from '@/services/turnstile-session';

export interface TurnstileHandle {
  /** Resolves a fresh single-use token; rejects when verification is cancelled. */
  getToken(): Promise<string>;
}

/** Requests a token from a mounted challenge; a missing view counts as a failed challenge. */
export function requestTurnstileToken(handle: RefObject<TurnstileHandle | null>): Promise<string> {
  return handle.current?.getToken() ?? Promise.reject(new TurnstileError('unavailable'));
}

interface Waiter {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

// A stalled prefetch moves to the visible sheet so the caller can make progress.
const INVISIBLE_PATIENCE_MS = 8_000;

/** The sheet route must mount within this window, or the request is abandoned instead of spinning forever. */
const SHEET_PRESENT_TIMEOUT_MS = 2_000;

// Prefetch reduces send latency; interaction, failure, or timeout hands verification to a sheet.
export function TurnstileChallenge({
  action,
  prefetch = true,
  ref,
}: {
  action: TurnstileAction;
  prefetch?: boolean;
  ref: Ref<TurnstileHandle>;
}) {
  const webViewRef = useRef<TurnstileWebViewInstance>(null);
  const tokenRef = useRef<string | null>(null);
  // A consumed or expired token leaves the widget idle until someone asks again.
  const idleRef = useRef(false);
  const retiredRef = useRef(false);
  const waitersRef = useRef<Waiter[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [retired, setRetired] = useState(false);
  const [started, setStarted] = useState(prefetch);
  const { t } = useTranslation('auth');
  const sheetSessionRef = useRef<TurnstileSession | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current === null) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const rejectWaiters = useCallback((code: string) => {
    const waiters = waitersRef.current.splice(0);
    for (const waiter of waiters) waiter.reject(new TurnstileError(code));
  }, []);

  const presentSheet = useCallback(() => {
    // Requests queued while this host's sheet is up are settled by that sheet.
    if (sheetSessionRef.current) return;
    const session: TurnstileSession = {
      action,
      onCancel: () => {
        sheetSessionRef.current = null;
        rejectWaiters(TURNSTILE_CANCELLED);
      },
      onToken: (token) => {
        sheetSessionRef.current = null;
        waitersRef.current.shift()?.resolve(token);
        // Each token is single-use; a second queued caller has to ask again.
        rejectWaiters(TURNSTILE_CANCELLED);
      },
    };
    sheetSessionRef.current = session;
    openTurnstileSession(session);
    router.push('/human-verification');
    setTimeout(() => {
      if (sheetSessionRef.current !== session || isTurnstileSessionPresented(session)) return;
      sheetSessionRef.current = null;
      closeTurnstileSession(session);
      rejectWaiters('sheet');
      showAlert(t('captcha.sheetTitle'), t('captcha.loadFailed'));
    }, SHEET_PRESENT_TIMEOUT_MS);
  }, [action, rejectWaiters, t]);

  const retire = useCallback(() => {
    clearTimer();
    tokenRef.current = null;
    retiredRef.current = true;
    setRetired(true);
    if (waitersRef.current.length > 0) presentSheet();
  }, [clearTimer, presentSheet]);

  useImperativeHandle(ref, () => ({
    getToken() {
      const token = tokenRef.current;
      if (token) {
        tokenRef.current = null;
        idleRef.current = true;
        return Promise.resolve(token);
      }
      const promise = new Promise<string>((resolve, reject) => {
        waitersRef.current.push({ resolve, reject });
      });
      if (retiredRef.current) {
        presentSheet();
        return promise;
      }
      // A freshly mounted page challenges on load; no reset needed.
      setStarted(true);
      if (idleRef.current) {
        idleRef.current = false;
        webViewRef.current?.injectJavaScript(TURNSTILE_RESET_SCRIPT);
      }
      if (timeoutRef.current === null) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          retire();
        }, INVISIBLE_PATIENCE_MS);
      }
      return promise;
    },
  }), [presentSheet, retire]);

  useEffect(() => () => {
    clearTimer();
    rejectWaiters('aborted');
  }, [clearTimer, rejectWaiters]);

  const onMessage = useCallback((message: TurnstileMessage) => {
    if (retiredRef.current) return;
    switch (message.type) {
      case 'token': {
        clearTimer();
        const waiter = waitersRef.current.shift();
        if (!waiter) {
          tokenRef.current = message.token;
          return;
        }
        idleRef.current = true;
        waiter.resolve(message.token);
        rejectWaiters(TURNSTILE_CANCELLED);
        return;
      }
      case 'expired':
        tokenRef.current = null;
        idleRef.current = true;
        return;
      case 'interactive':
        // A click is needed: that belongs in the sheet, not inline.
        if (message.visible) retire();
        return;
      case 'error':
        retire();
        return;
    }
  }, [clearTimer, rejectWaiters, retire]);

  if (retired || !started) return null;
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.frame}>
      <TurnstileWebView action={action} appearance="interaction-only" onMessage={onMessage} ref={webViewRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Zero height but a real width, so the page lays out as it would on screen.
  // Absolute positioning keeps it out of the form's flex gap.
  frame: { height: 0, left: 0, overflow: 'hidden', position: 'absolute', right: 0 },
});
