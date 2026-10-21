import assert from 'node:assert/strict';
import test from 'node:test';

import {
  closeTurnstileSession,
  isTurnstileSessionPresented,
  markTurnstileSessionPresented,
  openTurnstileSession,
} from './turnstile-session.ts';

test('verification session replacement cancels the old request and ignores stale dismissal', () => {
  let cancelled = 0;
  const first = { action: 'register', onToken() {}, onCancel() { cancelled += 1; } };
  const second = { action: 'reset_password', onToken() {}, onCancel() {} };
  openTurnstileSession(first);
  markTurnstileSessionPresented(first);
  assert.equal(isTurnstileSessionPresented(first), true);
  openTurnstileSession(second);
  assert.equal(cancelled, 1);
  assert.equal(isTurnstileSessionPresented(second), false);
  markTurnstileSessionPresented(second);
  closeTurnstileSession(first);
  assert.equal(isTurnstileSessionPresented(second), true);
  closeTurnstileSession(second);
  assert.equal(isTurnstileSessionPresented(second), false);
});
