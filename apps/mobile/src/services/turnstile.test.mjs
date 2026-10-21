import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';

import { buildTurnstileHtml, parseTurnstileMessage } from './turnstile.ts';

test('Turnstile document forwards widget events through the native bridge', () => {
  const messages = [];
  const resets = [];
  let options;
  const window = { ReactNativeWebView: { postMessage: (value) => messages.push(JSON.parse(value)) } };
  const turnstile = {
    render(selector, config) { assert.equal(selector, '#widget'); options = config; return 7; },
    reset(id) { resets.push(id); },
  };
  const html = buildTurnstileHtml({ action: 'reset_password', appearance: 'always', language: 'zh-tw', theme: 'dark' });
  const script = html.match(/<script>([\s\S]*?)<\/script>/u)?.[1];
  assert.ok(script);
  vm.runInNewContext(script, { window, turnstile });
  window.novellaTurnstileLoaded();
  assert.equal(options.action, 'reset_password');
  assert.equal(options.appearance, 'always');
  assert.equal(options.language, 'zh-tw');
  assert.equal(options.theme, 'dark');
  options.callback('fresh-token');
  options['before-interactive-callback']();
  options['after-interactive-callback']();
  options['expired-callback']();
  options['error-callback']('network');
  assert.deepEqual(messages, [
    { type: 'token', token: 'fresh-token' },
    { type: 'interactive', visible: true },
    { type: 'interactive', visible: false },
    { type: 'expired' },
    { type: 'error', code: 'network' },
  ]);
  window.novellaTurnstileReset();
  assert.deepEqual(resets, [7]);
});

test('native Turnstile messages reject malformed or empty token payloads', () => {
  for (const message of ['not json', 'null', '[]', '{}', '{"type":"token"}', '{"type":"token","token":""}']) {
    assert.equal(parseTurnstileMessage(message), null);
  }
  assert.deepEqual(parseTurnstileMessage('{"type":"token","token":"fresh-token"}'), { type: 'token', token: 'fresh-token' });
  assert.deepEqual(parseTurnstileMessage('{"type":"interactive","visible":"true"}'), { type: 'interactive', visible: false });
  assert.deepEqual(parseTurnstileMessage('{"type":"error"}'), { type: 'error', code: 'unknown' });
});
